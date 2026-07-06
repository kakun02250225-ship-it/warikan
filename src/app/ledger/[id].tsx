import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Segmented } from '@/components/Segmented';
import { EntryFormModal } from '@/features/loans/EntryFormModal';
import { yen, yenSigned } from '@/lib/format';
import { ledgerBalance, viewDirection } from '@/lib/loan';
import { colors } from '@/lib/theme';
import type { Direction, LedgerEntry } from '@/lib/types';
import { useAuth } from '@/stores/auth';
import { useLedgers } from '@/stores/ledgers';

type Filter = 'all' | Direction;

export default function LedgerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = useAuth((s) => s.uid);
  const { ledgers, entries, addEntry, removeEntry } = useLedgers();

  const [filter, setFilter] = useState<Filter>('all');
  const [formVisible, setFormVisible] = useState(false);

  const ledger = ledgers.find((l) => l.id === id);
  const allEntries = (id && entries[id]) || [];

  if (!uid || !ledger) {
    return (
      <View style={styles.centerFill}>
        <Stack.Screen options={{ title: '貸し借り' }} />
        <Text style={styles.empty}>台帳が見つかりません</Text>
      </View>
    );
  }

  // 集計・フィルタはすべて自分（viewer）視点の direction で行う
  const lendTotal = allEntries
    .filter((e) => viewDirection(e, uid) === 'lend')
    .reduce((s, e) => s + e.amount, 0);
  const borrowTotal = allEntries
    .filter((e) => viewDirection(e, uid) === 'borrow')
    .reduce((s, e) => s + e.amount, 0);
  const balance = ledgerBalance(allEntries, uid);

  const visibleEntries =
    filter === 'all' ? allEntries : allEntries.filter((e) => viewDirection(e, uid) === filter);

  const confirmDelete = (e: LedgerEntry) => {
    Alert.alert('削除しますか？', `${yen(e.amount)}${e.memo ? ` / ${e.memo}` : ''}`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => removeEntry(ledger.id, e.id) },
    ]);
  };

  const renderItem = ({ item }: { item: LedgerEntry }) => {
    const dir = viewDirection(item, uid);
    const isLend = dir === 'lend';
    return (
      <Pressable style={styles.entryCard} onLongPress={() => confirmDelete(item)}>
        <View style={[styles.entryBar, { backgroundColor: isLend ? colors.lend : colors.borrow }]} />
        <View style={styles.entryBody}>
          <View style={styles.entryTop}>
            <Text
              style={[styles.entryBadge, isLend ? styles.badgeLend : styles.badgeBorrow]}
            >
              {isLend ? '貸' : '借'}
            </Text>
            <Text style={styles.entryDate}>{dayjs(item.date).format('YYYY年M月D日(ddd)')}</Text>
          </View>
          {item.memo ? <Text style={styles.entryMemo}>{item.memo}</Text> : null}
        </View>
        <Text style={[styles.entryAmount, { color: isLend ? colors.lend : colors.borrow }]}>
          {yen(item.amount)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: ledger.partnerLabel }} />

      <FlatList
        data={visibleEntries}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>収支（貸 − 借）</Text>
              <Text
                style={[
                  styles.summaryBalance,
                  { color: balance > 0 ? colors.lend : balance < 0 ? colors.borrow : colors.text },
                ]}
              >
                {yenSigned(balance)}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summarySub, { color: colors.lend }]}>
                  貸 {yen(lendTotal)}
                </Text>
                <Text style={[styles.summarySub, { color: colors.borrow }]}>
                  借 {yen(borrowTotal)}
                </Text>
              </View>
            </View>

            <Segmented<Filter>
              options={[
                { key: 'all', label: 'すべて' },
                { key: 'lend', label: '貸', color: colors.lend },
                { key: 'borrow', label: '借', color: colors.borrow },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>取引がありません</Text>}
      />

      <Pressable style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <EntryFormModal
        visible={formVisible}
        partnerLabel={ledger.partnerLabel}
        onClose={() => setFormVisible(false)}
        onSave={(data) => addEntry(ledger.id, uid, data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  list: { padding: 16, paddingBottom: 96, gap: 10 },
  header: { gap: 12, marginBottom: 4 },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: { fontSize: 12, color: colors.sub },
  summaryBalance: { fontSize: 30, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  summarySub: { fontSize: 13, fontWeight: '600' },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  entryBar: { width: 5, alignSelf: 'stretch' },
  entryBody: { flex: 1, padding: 12, gap: 4 },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeLend: { color: colors.lend, backgroundColor: colors.lendBg },
  badgeBorrow: { color: colors.borrow, backgroundColor: colors.borrowBg },
  entryDate: { fontSize: 12, color: colors.sub },
  entryMemo: { fontSize: 14, color: colors.text },
  entryAmount: { fontSize: 17, fontWeight: '700', paddingRight: 14 },
  empty: { textAlign: 'center', color: colors.sub, paddingVertical: 32 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
