import type { Dayjs } from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';

interface Props {
  month: Dayjs; // 月初を指す
  onChange: (month: Dayjs) => void;
}

export function MonthSwitcher({ month, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.button} onPress={() => onChange(month.subtract(1, 'month'))}>
        <Text style={styles.arrow}>◀</Text>
      </Pressable>
      <Text style={styles.label}>{month.format('YYYY年M月')}</Text>
      <Pressable style={styles.button} onPress={() => onChange(month.add(1, 'month'))}>
        <Text style={styles.arrow}>▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  button: { padding: 8 },
  arrow: { color: colors.primary, fontSize: 16 },
  label: { fontSize: 17, fontWeight: '700', color: colors.text, minWidth: 110, textAlign: 'center' },
});
