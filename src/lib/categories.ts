export const EXPENSE_CATEGORIES = [
  '食費',
  '外食費',
  '日用品',
  '交通費',
  '衣服',
  '交際費',
  '趣味',
  'その他',
] as const;

export const INCOME_CATEGORIES = ['給料', '賞与', '副収入', 'その他'] as const;

/** 円グラフ・凡例用のカテゴリ色 */
export const CATEGORY_COLORS: Record<string, string> = {
  食費: '#F97316',
  外食費: '#F59E0B',
  日用品: '#10B981',
  交通費: '#3B82F6',
  衣服: '#8B5CF6',
  交際費: '#EC4899',
  趣味: '#14B8A6',
  給料: '#3B82F6',
  賞与: '#8B5CF6',
  副収入: '#10B981',
  その他: '#9CA3AF',
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#9CA3AF';
}
