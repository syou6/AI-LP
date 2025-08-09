# テスト用URL一覧

## OAuth 1.0a テストページ

以下のURLにアクセスしてください：

### ローカル環境（localhost:3001）
```
http://localhost:3001/api/auth/twitter-oauth1/test
```

### 本番環境（Vercel）
```
https://ai-lp-yrhn.vercel.app/api/auth/twitter-oauth1/test
```

## OAuth 1.0a 認証開始

### ローカル環境
```
http://localhost:3001/api/auth/twitter-oauth1
```

### 本番環境
```
https://ai-lp-yrhn.vercel.app/api/auth/twitter-oauth1
```

## ファイル構造

```
app/api/auth/
├── twitter-oauth1/
│   ├── route.ts              # 認証開始
│   ├── callback/
│   │   └── route.ts          # コールバック処理
│   └── test/
│       └── route.ts          # テストページ
```

## 確認方法

1. まずテストページにアクセス：
   `http://localhost:3001/api/auth/twitter-oauth1/test`

2. テストページが表示されたら、「X連携をテスト」ボタンをクリック

3. Twitterの認証画面にリダイレクトされます