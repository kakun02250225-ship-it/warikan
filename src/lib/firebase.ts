import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  // RN ビルドにのみ存在。型は src/types/firebase-auth-rn.d.ts で補完している
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** .env に Firebase 設定が入っているか。未設定なら初期化せずセットアップ画面を出す。 */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (firebaseReady) {
  app = getApps()[0] ?? initializeApp(config);
  if (Platform.OS === 'web') {
    auth = getAuth(app);
    auth.setPersistence(browserLocalPersistence);
    db = initializeFirestore(app, { localCache: persistentLocalCache() });
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    // JS SDK は RN での永続キャッシュ未対応のためメモリキャッシュ。
    // 完全なオフライン永続化が必要になったら @react-native-firebase へ移行する。
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
  }

  // ローカル開発用：`firebase emulators:start` に接続する
  if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === '1') {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? 'localhost';
    connectAuthEmulator(auth!, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db!, host, 8080);
  }
}

export { app, auth, db };
