import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { create } from 'zustand';

import { auth, firebaseReady } from '@/lib/firebase';

interface AuthState {
  uid: string | null;
  ready: boolean;
  error: string | null;
  /** 起動時に1回だけ呼ぶ。匿名認証で即利用開始（設計書 §7）。 */
  init: () => void;
}

let started = false;

export const useAuth = create<AuthState>((set) => ({
  uid: null,
  ready: false,
  error: null,
  init: () => {
    if (started || !firebaseReady || !auth) return;
    started = true;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ uid: user.uid, ready: true, error: null });
      } else {
        signInAnonymously(auth!).catch((e: unknown) => {
          set({ ready: true, error: e instanceof Error ? e.message : String(e) });
        });
      }
    });
  },
}));
