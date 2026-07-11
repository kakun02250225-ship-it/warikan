# Firebase × GitHub Pages セットアップ進捗

## ✅ 完了したこと

### 1. GitHub Pages 設定
- [x] Settings → Pages → Source を「GitHub Actions」に変更
- [x] `.github/workflows/deploy-pages.yml` が自動デプロイ用に配置済み

### 2. Firebase プロジェクト作成
- [x] Firebase コンソールで「warikan」プロジェクト作成
- [x] Authentication → Anonymous ログイン有効化

## 🔄 これからやること

### 3. Firestore Database 作成
**場所**: Firebase Console → 左メニュー「Database と Storage」→ Firestore Database

手順：
1. 「データベースを作成」をクリック
2. ロケーション：**`asia-northeast1`**（東京）を選択
3. **本番モード** で開始
4. 作成完了後、「ルール」タブに以下を貼り付けて「公開」：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 家計簿：本人のみ read/write
    match /users/{uid}/records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // 貸し借り台帳：メンバーのみ read/write
    match /ledgers/{ledgerId} {
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.ownerUid
        && request.auth.uid in request.resource.data.memberUids;
      allow read, update, delete: if request.auth != null
        && request.auth.uid in resource.data.memberUids;

      match /entries/{entryId} {
        allow read, update, delete: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/ledgers/$(ledgerId)).data.memberUids;
        allow create: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/ledgers/$(ledgerId)).data.memberUids
          && request.resource.data.creatorUid == request.auth.uid;
      }
    }
  }
}
```

### 4. Web アプリ登録 & 設定値取得
**場所**: Firebase Console → プロジェクト概要 → 「＋ アプリを追加」

手順：
1. **Web（`</>` アイコン）** を選択
2. ニックネーム：「warikan-web」
3. Hosting は **不要（チェック外す）**
4. 「アプリを登録」をクリック
5. 表示される `firebaseConfig` から以下の6つをコピー：

```
FIREBASE_API_KEY = 
FIREBASE_AUTH_DOMAIN = 
FIREBASE_PROJECT_ID = 
FIREBASE_STORAGE_BUCKET = 
FIREBASE_MESSAGING_SENDER_ID = 
FIREBASE_APP_ID = 
```

### 5. GitHub Repository Variables 登録
**場所**: GitHub Repo Settings → Secrets and variables → Actions → Variables

1. 上記で取得した6つの値を登録
2. 名前はそのまま（`FIREBASE_API_KEY` など）

### 6. Firebase 認証域追加
**場所**: Firebase Console → Authentication → Settings → 承認済みドメイン

以下を追加：
```
kakun02250225.github.io
```

## 📝 ローカル環境設定

`.env` ファイルを作成（同じ6つの値）：
```bash
cp .env.example .env
# .env に上記の6つの値を記入
```

## 🚀 完了後

すべて完了したら：
```bash
npm install
npm run web
```

ブラウザで http://localhost:8081 にアクセス可能。

GitHub にプッシュすれば自動的に以下にデプロイ：
```
https://kakun02250225.github.io/warikan/
```

## 📌 注意
- Firebase の「プロジェクトの設定 → マイアプリ」で Web アプリを選ぶと、すべての設定値が一度に表示されます
- `EXPO_PUBLIC_` プレフィックスは環境変数でのみ使用（ファイル名は `FIREBASE_` で統一）
