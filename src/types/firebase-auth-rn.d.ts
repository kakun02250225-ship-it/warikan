// firebase/auth の公開型は Web 向けで、React Native ビルドにだけ存在する
// getReactNativePersistence が含まれていないため、ここで型を補う。
// （ランタイムでは Metro が react-native ビルドを解決するので実体は存在する）
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
