import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { create } from 'zustand';

import { db } from '@/lib/firebase';
import type { MoneyRecord } from '@/lib/types';

interface RecordsState {
  records: MoneyRecord[];
  loaded: boolean;
  subscribe: (uid: string) => () => void;
  add: (uid: string, data: Omit<MoneyRecord, 'id'>) => Promise<void>;
  remove: (uid: string, id: string) => Promise<void>;
}

function recordsRef(uid: string) {
  return collection(db!, 'users', uid, 'records');
}

export const useRecords = create<RecordsState>((set) => ({
  records: [],
  loaded: false,
  subscribe: (uid) => {
    const q = query(recordsRef(uid), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const records = snap.docs.map((d) => {
          const v = d.data();
          return {
            id: d.id,
            type: v.type,
            amount: v.amount,
            category: v.category,
            memo: v.memo ?? '',
            date: (v.date as Timestamp).toDate(),
          } as MoneyRecord;
        });
        set({ records, loaded: true });
      },
      (err) => console.warn('records listener error:', err),
    );
  },
  add: async (uid, data) => {
    await addDoc(recordsRef(uid), {
      type: data.type,
      amount: data.amount,
      category: data.category,
      memo: data.memo,
      date: Timestamp.fromDate(data.date),
    });
  },
  remove: async (uid, id) => {
    await deleteDoc(doc(db!, 'users', uid, 'records', id));
  },
}));
