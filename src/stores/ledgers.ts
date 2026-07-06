import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { create } from 'zustand';

import { db } from '@/lib/firebase';
import type { Ledger, LedgerEntry } from '@/lib/types';

interface LedgersState {
  ledgers: Ledger[];
  /** ledgerId -> entries（date降順） */
  entries: Record<string, LedgerEntry[]>;
  loaded: boolean;
  /** 自分がメンバーの台帳と、その全 entries を購読する。 */
  subscribeAll: (uid: string) => () => void;
  addLedger: (uid: string, partnerLabel: string) => Promise<void>;
  addEntry: (
    ledgerId: string,
    uid: string,
    data: Omit<LedgerEntry, 'id' | 'creatorUid'>,
  ) => Promise<void>;
  removeEntry: (ledgerId: string, entryId: string) => Promise<void>;
}

export const useLedgers = create<LedgersState>((set) => ({
  ledgers: [],
  entries: {},
  loaded: false,
  subscribeAll: (uid) => {
    const entryUnsubs = new Map<string, Unsubscribe>();
    const q = query(collection(db!, 'ledgers'), where('memberUids', 'array-contains', uid));
    const unsubLedgers = onSnapshot(
      q,
      (snap) => {
      const ledgers = snap.docs
        .map((d) => {
          const v = d.data();
          return {
            id: d.id,
            ownerUid: v.ownerUid,
            memberUids: v.memberUids,
            partnerLabel: v.partnerLabel,
            partnerUid: v.partnerUid ?? null,
            // serverTimestamp 反映前（ローカル書き込み直後）は null になる
            createdAt: v.createdAt ? (v.createdAt as Timestamp).toDate() : new Date(),
          } as Ledger;
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      set({ ledgers, loaded: true });

      // サーバ側で確定済みの台帳だけ entries を購読する。
      // 作成直後のローカル反映時点ではサーバに台帳ドキュメントが無く、
      // セキュリティルールの get() が失敗してリスナーが死ぬため。
      // （createdAt の serverTimestamp が確定した時点で再度スナップショットが来る）
      const committedIds = new Set(
        snap.docs.filter((d) => !d.metadata.hasPendingWrites).map((d) => d.id),
      );
      for (const id of committedIds) {
        if (entryUnsubs.has(id)) continue;
        const eq = query(collection(db!, 'ledgers', id, 'entries'), orderBy('date', 'desc'));
        entryUnsubs.set(
          id,
          onSnapshot(
            eq,
            (es) => {
              const list = es.docs.map((d) => {
                const v = d.data();
                return {
                  id: d.id,
                  creatorUid: v.creatorUid,
                  amount: v.amount,
                  direction: v.direction,
                  memo: v.memo ?? '',
                  date: (v.date as Timestamp).toDate(),
                } as LedgerEntry;
              });
              set((s) => ({ entries: { ...s.entries, [id]: list } }));
            },
            (err) => console.warn(`entries listener error (${id}):`, err),
          ),
        );
      }
      const allIds = new Set(ledgers.map((l) => l.id));
      for (const [id, unsub] of entryUnsubs) {
        if (!allIds.has(id)) {
          unsub();
          entryUnsubs.delete(id);
        }
      }
      },
      (err) => console.warn('ledgers listener error:', err),
    );
    return () => {
      unsubLedgers();
      entryUnsubs.forEach((u) => u());
      entryUnsubs.clear();
    };
  },
  addLedger: async (uid, partnerLabel) => {
    await addDoc(collection(db!, 'ledgers'), {
      ownerUid: uid,
      memberUids: [uid],
      partnerLabel,
      partnerUid: null,
      createdAt: serverTimestamp(),
    });
  },
  addEntry: async (ledgerId, uid, data) => {
    await addDoc(collection(db!, 'ledgers', ledgerId, 'entries'), {
      creatorUid: uid, // direction は常に creator 視点で保存（設計書 §4）
      amount: data.amount,
      direction: data.direction,
      memo: data.memo,
      date: Timestamp.fromDate(data.date),
    });
  },
  removeEntry: async (ledgerId, entryId) => {
    await deleteDoc(doc(db!, 'ledgers', ledgerId, 'entries', entryId));
  },
}));
