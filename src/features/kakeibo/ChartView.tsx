import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MonthSwitcher } from '@/components/MonthSwitcher';
import { PieChart } from '@/components/PieChart';
import { categoryColor } from '@/lib/categories';
import { yen } from '@/lib/format';
import { colors } from '@/lib/theme';
import { useRecords } from '@/stores/records';

export function ChartView() {
  const records = useRecords((s) => s.records);
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));

  // 月の支出をカテゴリ別に集計（金額の大きい順）
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      if (r.type !== 'expense' || !dayjs(r.date).isSame(month, 'month')) continue;
      map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount, color: categoryColor(category) }))
      .sort((a, b) => b.amount - a.amount);
  }, [records, month]);

  const total = byCategory.reduce((s, c) => s + c.amount, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MonthSwitcher month={month} onChange={setMonth} />

      <View style={styles.chartWrap}>
        <PieChart
          data={byCategory.map((c) => ({ value: c.amount, color: c.color }))}
          centerLabel={yen(total)}
          centerSub="支出合計"
        />
      </View>

      {byCategory.length === 0 ? (
        <Text style={styles.empty}>この月の支出はありません</Text>
      ) : (
        <View style={styles.list}>
          {byCategory.map((c) => (
            <View key={c.category} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={styles.category}>{c.category}</Text>
              <Text style={styles.percent}>
                {total > 0 ? Math.round((c.amount / total) * 100) : 0}%
              </Text>
              <Text style={styles.amount}>{yen(c.amount)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  chartWrap: { alignItems: 'center', marginVertical: 16 },
  list: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  category: { flex: 1, fontSize: 15, color: colors.text },
  percent: { fontSize: 13, color: colors.sub, width: 44, textAlign: 'right' },
  amount: { fontSize: 15, fontWeight: '700', color: colors.text, minWidth: 90, textAlign: 'right' },
  empty: { textAlign: 'center', color: colors.sub, paddingVertical: 24 },
});
