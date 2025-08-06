# Twitter連携デバッグガイド

## 1. 環境変数の確認

### Vercelダッシュボードで確認すべき項目
以下の環境変数がすべて設定されているか確認してください：

```
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
NEXT_PUBLIC_APP_URL=https://ai-lp-yrhn.vercel.app
```

### ローカル環境（.env.local）での設定例
```
TWITTER_CLIENT_ID=あなたのクライアントID
TWITTER_CLIENT_SECRET=あなたのクライアントシークレット
TWITTER_REDIRECT_URI=https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
NEXT_PUBLIC_APP_URL=https://ai-lp-yrhn.vercel.app
```

## 2. Twitter開発者ポータルの設定確認

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. アプリケーションの設定を開く
3. 「User authentication settings」で以下を確認：
   - OAuth 2.0が有効になっている
   - Type of App: Web App, Automated App or Bot
   - Callback URI / Redirect URLに以下が設定されている：
     - `https://ai-lp-yrhn.vercel.app`
     - `https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback`

## 3. エラー別トラブルシューティング

### "API接続エラー: 環境変数の設定を確認してください"
- Vercelで環境変数が設定されていない
- 設定後は必ず再デプロイが必要

### "Twitter接続の開始に失敗しました"
- Twitter APIのクライアントIDまたはシークレットが間違っている
- Twitter開発者ポータルでアプリが無効化されている

### "invalid_state"エラー
- ブラウザのCookieが無効になっている
- セッションタイムアウト（10分以上経過）

### "oauth_denied"エラー
- ユーザーがTwitterでの認証をキャンセルした

## 4. デバッグ手順

### ステップ1: ブラウザの開発者ツールを開く
1. F12キーまたは右クリック→「検証」
2. 「Network」タブを開く
3. 「Console」タブも開く

### ステップ2: Twitter連携ボタンをクリック
1. 「Twitterを接続」ボタンをクリック
2. Networkタブで`/api/auth/twitter`のリクエストを確認
3. レスポンスが200 OKで、`url`フィールドが含まれているか確認

### ステップ3: エラーの詳細を確認
- Consoleタブにエラーメッセージが表示される
- Networkタブでレスポンスの詳細を確認

## 5. よくある設定ミス

1. **環境変数名の誤り**
   - `TWITTER_CLIENT_ID`（正しい）
   - `TWITTER_API_KEY`（間違い）

2. **URLの末尾スラッシュ**
   - `https://ai-lp-yrhn.vercel.app`（正しい）
   - `https://ai-lp-yrhn.vercel.app/`（末尾スラッシュは不要）

3. **コールバックURLの不一致**
   - Twitterとアプリケーションで同じURLを使用する必要がある

## 6. 確認用チェックリスト

- [ ] Vercelに環境変数を設定した
- [ ] 環境変数設定後に再デプロイした
- [ ] Twitter開発者ポータルでOAuth 2.0が有効
- [ ] コールバックURLが正しく設定されている
- [ ] ブラウザのCookieが有効
- [ ] JavaScriptが有効
- [ ] アドブロッカーを無効化した（念のため）

## 7. サポート情報の収集

問題が解決しない場合は、以下の情報を収集してください：

1. ブラウザのコンソールエラー
2. Network タブの失敗したリクエストの詳細
3. Vercelのファンクションログ（Vercel Dashboard → Functions → Logs）