import type { Dayjs } from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';

interface Props {
  date: Dayjs;
  onChange: (date: Dayjs) => void;
}

/** 日付選択（前後ボタンで1日ずつ移動、タップで今日に戻る） */
export function DateStepper({ date, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.button} onPress={() => onChange(date.subtract(1, 'day'))}>
        <Text style={styles.arrow}>◀</Text>
      </Pressable>
      <Pressable onPress={() => onChange(date.startOf('day'))} style={styles.center}>
        <Text style={styles.label}>{date.format('M月D日(ddd)')}</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => onChange(date.add(1, 'day'))}>
        <Text style={styles.arrow}>▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: { paddingVertical: 10, paddingHorizontal: 16 },
  arrow: { color: colors.primary, fontSize: 14 },
  center: { flex: 1, alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
});
