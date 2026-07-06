import '@/lib/dayjs-setup';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { firebaseReady } from '@/lib/firebase';
import { colors } from '@/lib/theme';
import { useAuth } from '@/stores/auth';
import { useLedgers } from '@/stores/ledgers';
import { useRecords } from '@/stores/records';

export default function RootLayout() {
  const { uid, ready, error, init } = useAuth();
  const subscribeRecords = useRecords((s) => s.subscribe);
  const subscribeLedgers = useLedgers((s) => s.subscribeAll);

  useEffect(() => {
    init();
  }, [init]);

  // ログイン後、家計簿と貸し借りの購読をアプリ全体で1回だけ張る
  useEffect(() => {
    if (!uid) return;
    const unsubRecords = subscribeRecords(uid);
    const unsubLedgers = subscribeLedgers(uid);
    return () => {
      unsubRecords();
      unsubLedgers();
    };
  }, [uid, subscribeRecords, subscribeLedgers]);

  if (!firebaseReady) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Firebase が未設定です</Text>
        <Text style={styles.body}>
          リポジトリ直下に .env を作成して Firebase の設定を入れてください。{'\n'}
          手順は README.md を参照（.env.example をコピーして値を埋めます）。
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>ログインに失敗しました</Text>
        <Text style={styles.body}>
          {error}
          {'\n\n'}Firebase コンソールで匿名認証が有効か確認してください。
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ledger/[id]" options={{ title: '', headerBackTitle: '戻る' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: colors.bg,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.sub, lineHeight: 22, textAlign: 'center' },
});
