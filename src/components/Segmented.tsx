import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
  /** 選択時の背景色（省略時 primary） */
  color?: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.item, active && { backgroundColor: o.color ?? colors.primary }]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 3,
  },
  item: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: { color: colors.sub, fontWeight: '600', fontSize: 14 },
  labelActive: { color: '#fff' },
});
