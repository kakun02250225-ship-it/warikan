import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DateStepper } from '@/components/DateStepper';
import { Segmented } from '@/components/Segmented';
import { colors } from '@/lib/theme';
import type { Direction } from '@/lib/types';

interface Props {
  visible: boolean;
  partnerLabel: string;
  onClose: () => void;
  onSave: (data: { amount: number; direction: Direction; memo: string; date: Date }) => Promise<void>;
}

/** 貸し借りの取引入力（金額・メモ・日付・借/貸）。direction は自分視点。 */
export function EntryFormModal({ visible, partnerLabel, onClose, onSave }: Props) {
  const [direction, setDirection] = useState<Direction>('lend');
  const [amountText, setAmountText] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState<Dayjs>(dayjs().startOf('day'));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const amount = Number(amountText);
    if (!Number.isInteger(amount) || amount <= 0) {
      Alert.alert('金額を確認してください', '1円以上の整数で入力してください。');
      return;
    }
    setSaving(true);
    try {
      await onSave({ amount, direction, memo: memo.trim(), date: date.toDate() });
      setAmountText('');
      setMemo('');
      onClose();
    } catch (e) {
      Alert.alert('保存に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropTouch} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{partnerLabel} との貸し借りを記録</Text>

          <Segmented<Direction>
            options={[
              { key: 'lend', label: '貸した', color: colors.lend },
              { key: 'borrow', label: '借りた', color: colors.borrow },
            ]}
            value={direction}
            onChange={setDirection}
          />

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
            style={[
              styles.saveButton,
              { backgroundColor: direction === 'lend' ? colors.lend : colors.borrow },
              saving && { opacity: 0.5 },
            ]}
            onPress={save}
            disabled={saving}
          >
            <Text style={styles.saveText}>保存</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
