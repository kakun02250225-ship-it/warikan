import type { Direction, LedgerEntry } from './types';

type EntryView = Pick<LedgerEntry, 'creatorUid' | 'direction' | 'amount'>;

/**
 * direction は creatorUid 視点で保存されているため、
 * 見る人が作成者でなければ lend↔borrow を反転する。
 * 表示反転のロジックはここに集約する（他の場所で反転しない）。
 */
export function viewDirection(
  entry: Pick<LedgerEntry, 'creatorUid' | 'direction'>,
  viewerUid: string,
): Direction {
  if (entry.creatorUid === viewerUid) return entry.direction;
  return entry.direction === 'lend' ? 'borrow' : 'lend';
}

/** 台帳の収支（viewer視点）：Σ(貸) − Σ(借)。プラスなら相手に貸している。 */
export function ledgerBalance(entries: EntryView[], viewerUid: string): number {
  return entries.reduce(
    (sum, e) => sum + (viewDirection(e, viewerUid) === 'lend' ? e.amount : -e.amount),
    0,
  );
}
