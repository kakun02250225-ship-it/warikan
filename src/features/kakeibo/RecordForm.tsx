import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DateStepper } from '@/components/DateStepper';
import { Segmented } from '@/components/Segmented';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { yen } from '@/lib/format';
import { colors } from '@/lib/theme';
import { useAuth } from '@/stores/auth';
import { useRecords } from '@/stores/records';

type Tab = 'expense' | 'income' | 'savings';

export function RecordForm() {
  const uid = useAuth((s) => s.uid);
  const { records, add } = useRecords();

  const [tab, setTab] = useState<Tab>('expense');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState<Dayjs>(dayjs().startOf('day'));
  const [saving, setSaving] = useState(false);

  const categories = tab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const switchTab = (t: Tab) => {
    setTab(t);
    if (t === 'expense') setCategory(EXPENSE_CATEGORIES[0]);
    if (t === 'income') setCategory(INCOME_CATEGORIES[0]);
  };

  const save = async () => {
    if (!uid || tab === 'savings') return;
    const amount = Number(amountText);
    if (!Number.isInteger(amount) || amount <= 0) {
      Alert.alert('金額を確認してください', '1円以上の整数で入力してください。');
      return;
    }
    setSaving(true);
    try {
      await add(uid, {
        type: tab,
        amount,
        category,
        memo: memo.trim(),
        date: date.toDate(),
      });
      setAmountText('');
      setMemo('');
    } catch (e) {
      Alert.alert('保存に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  // 貯金額 = 収入合計 − 支出合計（MVPでは全期間の合計を表示するだけ）
  const totalIncome = records.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpense = records
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);
  const savings = totalIncome - totalExpense;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Segmented<Tab>
        options={[
          { key: 'expense', label: '支出', color: colors.expense },
          { key: 'income', label: '収入', color: colors.income },
          { key: 'savings', label: '貯金額' },
        ]}
        value={tab}
        onChange={switchTab}
      />

      {tab === 'savings' ? (
        <View style={styles.savingsCard}>
          <Text style={styles.savingsLabel}>貯金額（収入合計 − 支出合計）</Text>
          <Text
            style={[
              styles.savingsValue,
              { color: savings >= 0 ? colors.income : colors.expense },
            ]}
          >
            {yen(savings)}
          </Text>
          <View style={styles.savingsRow}>
            <Text style={styles.savingsSub}>収入 {yen(totalIncome)}</Text>
            <Text style={styles.savingsSub}>支出 {yen(totalExpense)}</Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.label}>金額</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={setAmountText}
            placeholder="0"
            placeholderTextColor={colors.sub}
            keyboardType="number-pad"
            inputMode="numeric"
          />

          <Text style={styles.label}>カテゴリー</Text>
          <View style={styles.chips}>
            {categories.map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.chip,
                    active && {
                      backgroundColor: tab === 'income' ? colors.income : colors.expense,
                      borderColor: 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>メモ</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="メモ（任意）"
            placeholderTextColor={colors.sub}
          />

          <Text style={styles.label}>日付</Text>
          <DateStepper date={date} onChange={setDate} />

          <Pressable
            style={[styles.saveButton, saving && { opacity: 0.5 }]}
            onPress={save}
            disabled={saving}
          >
            <Text style={styles.saveText}>保存</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, paddingBottom: 40 },
  label: { fontSize: 13, color: colors.sub, fontWeight: '600', marginTop: 8 },
  amountInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  memoInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  savingsCard: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  savingsLabel: { color: colors.sub, fontSize: 13 },
  savingsValue: { fontSize: 34, fontWeight: '800' },
  savingsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  savingsSub: { color: colors.sub, fontSize: 13 },
});
