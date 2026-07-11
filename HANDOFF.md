# 🚀 warikan セットアップ引き継ぎメモ

## 現状
✅ プロジェクトコード完成
✅ GitHub Actions ワークフロー実装済み
✅ PWA設定完了
✅ GitHub Pages を「GitHub Actions」に設定
✅ Firebase 匿名認証有効化

## 👤 あなたが今やること（残り5ステップ）

### ステップ 1️⃣: Firestore Database 作成
**Firebase Console** → 左メニュー「Database と Storage」→「Firestore Database」

```
ロケーション: asia-northeast1 (東京)
モード: 本番モード
```

作成後、「ルール」タブに `firestore.rules` の内容を貼り付けける → 「公開」

### ステップ 2️⃣: Web アプリ登録
**Firebase Console** → プロジェクト概要 → 「＋ アプリを追加」

```
Web アプリ (</>)
ニックネーム: warikan-web
Hosting: 不要（チェック外す）
```

### ステップ 3️⃣: 設定値を取得
Web アプリ登録後に表示される `firebaseConfig` から以下をコピー：

```
apiKey → FIREBASE_API_KEY
authDomain → FIREBASE_AUTH_DOMAIN
projectId → FIREBASE_PROJECT_ID
storageBucket → FIREBASE_STORAGE_BUCKET
messagingSenderId → FIREBASE_MESSAGING_SENDER_ID
appId → FIREBASE_APP_ID
```

### ステップ 4️⃣: GitHub に設定値を登録
**GitHub Repo Settings** → **Secrets and variables** → **Actions** → **Variables**

上記で取得した6つの値を登録（名前そのまま）

### ステップ 5️⃣: Firebase 認証域追加
**Firebase Console** → **Authentication** → **Settings** → **承認済みドメイン**

追加:
```
kakun02250225.github.io
```

## 💻 ローカル環境

```bash
# プロジェクトルートで実行
cp .env.example .env
# .env に上記の6つの値を記入

npm install
npm run web
```

ブラウザで http://localhost:8081 で動作確認可能

## 🌐 オンライン公開

すべての設定が完了したら、GitHub にプッシュすると自動的に以下にデプロイ：

```
https://kakun02250225.github.io/warikan/
```

## 📋 ファイルの場所

| 用途 | ファイル |
|---|---|
| ルール貼り付け | `firestore.rules` |
| ローカル設定 | `.env.example` → `.env` に変更 |
| セットアップ詳細 | `SETUP_PROGRESS.md` |

## ⚠️ 注意事項

1. **`.env` は git に含めない** ← 既に `.gitignore` に登録済み
2. **Firebase のプロジェクトID** は URL に含まれる `warikan-e0ad6`
3. **GitHub Pages の URL** は `kakun02250225.github.io/warikan/` （サブパス `/warikan/`）
4. **ローカルと本番で共通設定** → 同じ Firebase プロジェクトを使用

## 🔗 リンク集

- Firebase Console: https://console.firebase.google.com/
- GitHub Repo: https://github.com/kakun02250225-ship-it/warikan
- GitHub Pages: https://kakun02250225.github.io/warikan/
- Firestore Rules: `firestore.rules`

## ✨ 完了後

5つのステップをすべて完了したら：

1. ローカルで `npm run web` で動作確認
2. Git にプッシュ
3. GitHub Actions で自動デプロイ開始
4. https://kakun02250225.github.io/warikan/ にアクセス

🎉 完成！

---

**最後に**: 不明な点は `SETUP_PROGRESS.md` に詳細な手順があります。
