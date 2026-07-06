/** 金額表示。金額は常に整数（円）で扱う。 */
export function yen(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}¥${Math.abs(amount).toLocaleString('ja-JP')}`;
}

/** 符号付き表示（+¥1,000 / -¥1,000） */
export function yenSigned(amount: number): string {
  if (amount > 0) return `+${yen(amount)}`;
  return yen(amount);
}
