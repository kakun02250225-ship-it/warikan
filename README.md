# 貸し借り ＋ 家計簿アプリ（warikan）

1つのアプリで「個人の家計簿」と「人ごとの貸し借り」を管理する React Native (Expo) アプリ。

- **家計簿**（個人・非共有）：支出/収入の入力、カレンダー、カテゴリ別円グラフ、貯金額（収入合計 − 支出合計）
- **貸し借り**（人ごと）：相手ごとの台帳、借/貸の記録（借=オレンジ / 貸=緑）、収支 = 貸合計 − 借合計

現在は **Phase 1（単独動作・ローカル相手）** まで実装済み。詳細な仕様は `DESIGN.md`（設計書）を参照。

## 技術スタック

| レイヤ | 採用 |
|---|---|
| アプリ | React Native + Expo (TypeScript) |
| 画面遷移 | Expo Router |
| 状態 | Zustand |
| 認証 | Firebase Authentication（匿名） |
| DB | Cloud Firestore |
| グラフ | react-native-svg（自前ドーナツチャート） |
| 日付 | dayjs |

## セットアップ

### 1. Firebase プロジェクトを作る

1. [Firebase コンソール](https://console.firebase.google.com/) で新規プロジェクトを作成
2. **Authentication → ログイン方法 → 匿名** を有効化
3. **Firestore Database** を作成（本番モードでOK）
4. `firestore.rules` の内容をコンソールの「ルール」に貼り付けて公開
5. プロジェクトの設定 → マイアプリ → **Web アプリ**を追加し、構成（apiKey など）を控える

### 2. 環境変数を設定する

```bash
cp .env.example .env
# .env に Firebase の構成値を記入
```

### 3. 起動

```bash
npm install
npm start          # Expo Go で QR を読む
npm run web        # ブラウザで確認
```

## プロジェクト構成

```
src/
  app/                 # Expo Router の画面
    (tabs)/index.tsx     # 家計簿（入力/カレンダー/グラフ切替）
    (tabs)/loans.tsx     # 貸し借り・人一覧
    ledger/[id].tsx      # 台帳詳細（取引一覧・借/貸フィルタ・入力）
  features/            # 画面の中身（家計簿の各ビュー、貸し借り入力モーダル）
  components/          # 汎用UI（Segmented / MonthSwitcher / DateStepper / PieChart）
  stores/              # Zustand ストア（auth / records / ledgers）
  lib/                 # firebase 初期化・型・集計ユーティリティ
firestore.rules        # Firestore セキュリティルール
```

## データモデル（設計書 §4）

- `users/{uid}/records/{recordId}` … 家計簿（本人のみ）
- `ledgers/{ledgerId}` … 貸し借り台帳（`memberUids` のメンバーが読める）
- `ledgers/{ledgerId}/entries/{entryId}` … 取引。`direction` は **常に creatorUid 視点**で保存し、閲覧者が作成者でない場合は表示時に lend↔borrow を反転する（`src/lib/loan.ts` に集約）

金額はすべて **整数（円）** で保持する。

## 設計書からの差分メモ

- Firestore のオフライン永続化：Web では有効（IndexedDB）。ネイティブは Firebase JS SDK が永続キャッシュ未対応のためメモリキャッシュで動作。完全なオフライン対応が必要になったら `@react-native-firebase`（開発ビルド）へ移行する。

## ロードマップ

- **Phase 1（済）**：家計簿一式、ローカル相手の貸し借り、台帳収支
- **Phase 2**：匿名→メール/Google への認証昇格、招待コードで台帳を接続して双方向リアルタイム同期
- **Phase 3**：グループ台帳、家計簿×貸し借り連携、CSV出力
