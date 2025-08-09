# X (Twitter) OAuth 1.0a 実装完了

## 実装内容

Free tierではOAuth 2.0が使用できないため、**OAuth 1.0a**対応の実装を作成しました。

### 作成したファイル

1. **`lib/twitter-oauth1-service.ts`**
   - OAuth 1.0a用の認証サービス
   - ツイート投稿、メトリクス取得などの機能

2. **`app/api/auth/twitter-oauth1/route.ts`**
   - OAuth 1.0a認証開始エンドポイント

3. **`app/api/auth/twitter-oauth1/callback/route.ts`**
   - OAuth 1.0aコールバックエンドポイント

4. **`app/api/auth/twitter-oauth1/test/route.ts`**
   - テスト用エンドポイント

### 環境変数の更新

`.env.local`ファイルを以下のように更新済み：

```env
# Twitter API (OAuth 1.0a - Free tier用)
TWITTER_API_KEY=TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ
TWITTER_API_SECRET=zlq0pNjUY92Go_ksx38zLB6sua2TsuifjShHem_RdYcKHbzJJ8
TWITTER_CALLBACK_URL=https://ai-lp-yrhn.vercel.app/api/auth/twitter-oauth1/callback
```

## 使用方法

### 1. ローカルでテスト

```bash
npm run dev
```

以下にアクセス：
http://localhost:3001/api/auth/twitter-oauth1/test

### 2. Vercelの環境変数を更新

1. [Vercel Dashboard](https://vercel.com)にログイン
2. プロジェクトのSettings → Environment Variables
3. 以下の環境変数を追加/更新：
   - `TWITTER_API_KEY` - 現在のTWITTER_CLIENT_IDの値
   - `TWITTER_API_SECRET` - 現在のTWITTER_CLIENT_SECRETの値
   - `TWITTER_CALLBACK_URL` - `https://ai-lp-yrhn.vercel.app/api/auth/twitter-oauth1/callback`

### 3. Twitter Developer Portalで設定

1. [Twitter Developer Portal](https://developer.twitter.com/en/apps)にログイン
2. アプリの「User authentication settings」を開く
3. 以下を設定：
   - **OAuth 1.0a**: 有効
   - **App permissions**: Read and write
   - **Callback URLs**に追加:
     ```
     https://ai-lp-yrhn.vercel.app/api/auth/twitter-oauth1/callback
     http://localhost:3001/api/auth/twitter-oauth1/callback
     ```

## 既存のコードへの統合

既存のフロントエンドコードで、Twitter連携ボタンのリンクを変更：

**変更前：**
```javascript
href="/api/auth/twitter"
```

**変更後：**
```javascript
href="/api/auth/twitter-oauth1"
```

## 投稿機能の更新

投稿時はOAuth 1.0a用のサービスを使用：

```typescript
import { twitterOAuth1Service } from '@/lib/twitter-oauth1-service'

// ユーザーのトークンを取得（Supabaseから）
const { twitter_access_token, twitter_refresh_token } = user

// ツイート投稿
const result = await twitterOAuth1Service.postTweet(
  twitter_access_token,  // access_token
  twitter_refresh_token,  // access_secret (OAuth 1.0aではrefresh_tokenに保存)
  tweetContent
)
```

## 制限事項（Free tier）

- 月間1,500ツイート投稿まで
- 詳細な分析データ（インプレッション等）は取得不可
- API呼び出しレート制限あり

## トラブルシューティング

### エラー: "Callback URL not approved"
Developer PortalでCallback URLが正しく設定されているか確認

### エラー: "Invalid oauth_consumer_key"
環境変数のTWITTER_API_KEYとTWITTER_API_SECRETが正しいか確認

### エラー: "Read-only application cannot POST"
App permissionsを「Read and write」に変更

## 次のステップ

1. Vercelに環境変数を設定
2. Developer PortalでCallback URLを追加
3. テストエンドポイントで動作確認
4. フロントエンドのリンクを更新