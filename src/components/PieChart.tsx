import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { colors } from '@/lib/theme';

export interface PieSlice {
  value: number;
  color: string;
}

interface Props {
  data: PieSlice[];
  size?: number;
  /** 中央に表示するテキスト（合計金額など） */
  centerLabel?: string;
  centerSub?: string;
}

/** ドーナツ型円グラフ。strokeDasharray 方式なので1カテゴリ100%でも破綻しない。 */
export function PieChart({ data, size = 200, centerLabel, centerSub }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const strokeWidth = size * 0.16;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;

  let offset = 0;
  const slices = data
    .filter((d) => d.value > 0)
    .map((d, i) => {
      const frac = total > 0 ? d.value / total : 0;
      const slice = (
        <Circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={d.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${frac * c} ${c}`}
          strokeDashoffset={-offset * c}
        />
      );
      offset += frac;
      return slice;
    });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* 12時の位置から時計回りに描く */}
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colors.border}
            strokeWidth={strokeWidth}
          />
          {slices}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {centerSub ? <Text style={styles.centerSub}>{centerSub}</Text> : null}
        {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: { fontSize: 20, fontWeight: '700', color: colors.text },
  centerSub: { fontSize: 12, color: colors.sub },
});
