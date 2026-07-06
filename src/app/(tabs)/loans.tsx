import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { yen } from '@/lib/format';
import { ledgerBalance } from '@/lib/loan';
import { colors } from '@/lib/theme';
import type { Ledger } from '@/lib/types';
import { useAuth } from '@/stores/auth';
import { useLedgers } from '@/stores/ledgers';

export default function LoansScreen() {
  const router = useRouter();
  const uid = useAuth((s) => s.uid);
  const { ledgers, entries, addLedger } = useLedgers();

  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const register = async () => {
    const label = name.trim();
    if (!uid || !label) return;
    setAdding(true);
    // 保存完了を待ってからクリアすると、その間に入力された次の名前を消してしまう
    setName('');
    try {
      await addLedger(uid, label);
    } catch (e) {
      Alert.alert('登録に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  const renderItem = ({ item }: { item: Ledger }) => {
    const balance = uid ? ledgerBalance(entries[item.id] ?? [], uid) : 0;
    const balanceColor = balance > 0 ? colors.lend : balance < 0 ? colors.borrow : colors.sub;
    const balanceNote = balance > 0 ? '貸し' : balance < 0 ? '借り' : '';
    return (
      <Pressable style={styles.card} onPress={() => router.push(`/ledger/${item.id}`)}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.partnerLabel.slice(0, 1)}</Text>
        </View>
        <Text style={styles.name}>{item.partnerLabel}</Text>
        <View style={styles.balanceWrap}>
          <Text style={[styles.balance, { color: balanceColor }]}>{yen(Math.abs(balance))}</Text>
          {balanceNote ? (
            <Text style={[styles.balanceNote, { color: balanceColor }]}>{balanceNote}</Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="相手の名前（例：ゆうま）"
          placeholderTextColor={colors.sub}
          onSubmitEditing={register}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, (!name.trim() || adding) && { opacity: 0.4 }]}
          onPress={register}
          disabled={!name.trim() || adding}
        >
          <Text style={styles.addButtonText}>登録</Text>
        </Pressable>
      </View>

      <FlatList
        data={ledgers}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            まだ相手がいません。{'\n'}上の欄から相手を登録して貸し借りを記録しましょう。
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  addRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  balanceWrap: { alignItems: 'flex-end' },
  balance: { fontSize: 16, fontWeight: '700' },
  balanceNote: { fontSize: 11 },
  empty: { textAlign: 'center', color: colors.sub, lineHeight: 22, paddingVertical: 32 },
});
