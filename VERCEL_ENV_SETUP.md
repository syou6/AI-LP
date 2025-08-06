# Vercel環境変数設定ガイド

## 重要：以下の環境変数をVercelダッシュボードで設定してください

1. [Vercelダッシュボード](https://vercel.com)にログイン
2. プロジェクト `ai-lp-yrhn` を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の環境変数を追加：

### Supabase関連
- `NEXT_PUBLIC_SUPABASE_URL`: `https://jepczzqulgibekmulamg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [.env.localからコピー]
- `SUPABASE_SERVICE_ROLE_KEY`: [.env.localからコピー]

### Twitter API関連
- `TWITTER_CLIENT_ID`: [Twitter開発者ポータルから取得]
- `TWITTER_CLIENT_SECRET`: [Twitter開発者ポータルから取得]
- `TWITTER_REDIRECT_URI`: `https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback`

### Google Gemini AI
- `GEMINI_API_KEY`: [Google AI Studioから取得]

### アプリケーションURL
- `NEXT_PUBLIC_APP_URL`: `https://ai-lp-yrhn.vercel.app`

### Cron Jobs
- `CRON_SECRET`: [任意の安全な文字列を生成]

## Twitter開発者ポータルでの設定

1. [Twitter開発者ポータル](https://developer.twitter.com)にアクセス
2. アプリケーションの設定で以下のコールバックURLを追加：
   - `https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback`
   - `https://ai-lp-yrhn-*.vercel.app/api/auth/twitter/callback` （プレビューデプロイ用）

## 設定後の確認

1. Vercelで「Redeploy」を実行
2. デプロイが完了したら、設定画面でTwitter連携をテスト

これらの設定が完了すると、Twitterの連携が正しく動作するようになります。