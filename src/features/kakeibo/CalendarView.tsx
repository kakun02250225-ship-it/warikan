import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthSwitcher } from '@/components/MonthSwitcher';
import { yen, yenSigned } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { MoneyRecord } from '@/lib/types';
import { useAuth } from '@/stores/auth';
import { useRecords } from '@/stores/records';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarView() {
  const uid = useAuth((s) => s.uid);
  const { records, remove } = useRecords();

  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [selected, setSelected] = useState<Dayjs>(dayjs().startOf('day'));

  const monthRecords = useMemo(
    () => records.filter((r) => dayjs(r.date).isSame(month, 'month')),
    [records, month],
  );

  // 日別合計（key: 日にち）
  const daily = useMemo(() => {
    const map = new Map<number, { expense: number; income: number }>();
    for (const r of monthRecords) {
      const d = dayjs(r.date).date();
      const cur = map.get(d) ?? { expense: 0, income: 0 };
      cur[r.type] += r.amount;
      map.set(d, cur);
    }
    return map;
  }, [monthRecords]);

  const income = monthRecords.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = monthRecords
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);

  // カレンダーのセル（月初の曜日ぶん null で埋める）
  const cells = useMemo(() => {
    const list: (number | null)[] = [];
    for (let i = 0; i < month.day(); i++) list.push(null);
    for (let d = 1; d <= month.daysInMonth(); d++) list.push(d);
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [month]);

  const dayRecords = monthRecords
    .filter((r) => dayjs(r.date).isSame(selected, 'day'))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const changeMonth = (m: Dayjs) => {
    setMonth(m);
    setSelected(m.startOf('month'));
  };

  const confirmDelete = (r: MoneyRecord) => {
    if (!uid) return;
    Alert.alert('削除しますか？', `${r.category} ${yen(r.amount)}`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => remove(uid, r.id) },
    ]);
  };

  const renderItem = ({ item }: { item: MoneyRecord }) => (
    <Pressable style={styles.recordRow} onLongPress={() => confirmDelete(item)}>
      <View style={styles.recordLeft}>
        <Text style={styles.recordCategory}>{item.category}</Text>
        {item.memo ? <Text style={styles.recordMemo}>{item.memo}</Text> : null}
      </View>
      <Text
        style={[
          styles.recordAmount,
          { color: item.type === 'expense' ? colors.expense : colors.income },
        ]}
      >
        {yenSigned(item.type === 'expense' ? -item.amount : item.amount)}
      </Text>
    </Pressable>
  );

  return (
    <FlatList
      data={dayRecords}
      keyExtractor={(r) => r.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View>
          <MonthSwitcher month={month} onChange={changeMonth} />

          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>収入</Text>
              <Text style={[styles.summaryValue, { color: colors.income }]}>{yen(income)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>支出</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>{yen(expense)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>合計</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: income - expense >= 0 ? colors.income : colors.expense },
                ]}
              >
                {yen(income - expense)}
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={w}
                style={[
                  styles.weekday,
                  i === 0 && { color: colors.expense },
                  i === 6 && { color: colors.primary },
                ]}
              >
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((d, i) => {
              if (d === null) return <View key={i} style={styles.cell} />;
              const cellDate = month.date(d);
              const isSelected = cellDate.isSame(selected, 'day');
              const isToday = cellDate.isSame(dayjs(), 'day');
              const sums = daily.get(d);
              return (
                <Pressable
                  key={i}
                  style={[styles.cell, isSelected && styles.cellSelected]}
                  onPress={() => setSelected(cellDate)}
                >
                  <Text style={[styles.cellDay, isToday && styles.cellToday]}>{d}</Text>
                  {sums?.expense ? (
                    <Text style={styles.cellExpense} numberOfLines={1}>
                      {sums.expense.toLocaleString('ja-JP')}
                    </Text>
                  ) : null}
                  {sums?.income ? (
                    <Text style={styles.cellIncome} numberOfLines={1}>
                      {sums.income.toLocaleString('ja-JP')}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.detailHeader}>{selected.format('M月D日(ddd)')} の明細</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>記録がありません</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryLabel: { fontSize: 12, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.sub },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 52,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  cellSelected: { backgroundColor: '#DBEAFE' },
  cellDay: { fontSize: 13, color: colors.text },
  cellToday: { color: colors.primary, fontWeight: '800' },
  cellExpense: { fontSize: 9, color: colors.expense },
  cellIncome: { fontSize: 9, color: colors.income },
  detailHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  recordLeft: { flex: 1, gap: 2 },
  recordCategory: { fontSize: 15, fontWeight: '600', color: colors.text },
  recordMemo: { fontSize: 12, color: colors.sub },
  recordAmount: { fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.sub, paddingVertical: 24 },
});
