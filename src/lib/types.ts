export type RecordType = 'expense' | 'income';

/** 家計簿の1レコード（users/{uid}/records/{id}） */
export interface MoneyRecord {
  id: string;
  type: RecordType;
  amount: number; // 正の整数（円）
  category: string;
  memo: string;
  date: Date;
}

export type Direction = 'lend' | 'borrow';

/** 貸し借り台帳（ledgers/{id}） */
export interface Ledger {
  id: string;
  ownerUid: string;
  memberUids: string[];
  partnerLabel: string;
  partnerUid: string | null;
  createdAt: Date;
}

/** 台帳の取引（ledgers/{id}/entries/{id}）。direction は必ず creatorUid 視点。 */
export interface LedgerEntry {
  id: string;
  creatorUid: string;
  amount: number; // 正の整数（円）
  direction: Direction;
  memo: string;
  date: Date;
}
