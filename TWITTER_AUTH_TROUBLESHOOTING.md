# Twitter認証トラブルシューティングガイド

## デバッグ手順

### 1. 環境変数の確認
ブラウザで以下のURLにアクセスして環境変数の状態を確認：
```
https://ai-lp-yrhn.vercel.app/api/debug/env
```

このエンドポイントで以下を確認できます：
- 各環境変数が設定されているか
- Twitter APIの設定状態
- リダイレクトURIの値

### 2. Vercel環境変数の再確認

1. [Vercelダッシュボード](https://vercel.com/syou6s-projects/ai-lp-yrhn/settings/environment-variables)にアクセス
2. 以下の環境変数が**すべて**設定されているか確認：

```
TWITTER_CLIENT_ID=[TwitterのOAuth2.0クライアントID]
TWITTER_CLIENT_SECRET=[TwitterのOAuth2.0クライアントシークレット]
NEXT_PUBLIC_APP_URL=https://ai-lp-yrhn.vercel.app
```

### 3. Twitter開発者ポータルの設定確認

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. アプリケーションの「User authentication settings」を開く
3. 以下を確認：
   - **Type of App**: `Web App, Automated App or Bot`を選択
   - **App permissions**: `Read and write`を選択
   - **Callback URI / Redirect URL**に以下が**両方**登録されているか確認：
     ```
     https://ai-lp-yrhn.vercel.app
     https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
     ```

### 4. OAuth 2.0の設定確認

Twitter開発者ポータルで：
1. 「Keys and tokens」タブを開く
2. 「OAuth 2.0 Client ID and Client Secret」セクションを確認
3. Client IDとClient Secretが生成されているか確認
4. これらの値がVercelの環境変数と**完全に一致**しているか確認

### 5. よくある問題と解決方法

#### "Token exchange failed: 400"エラー
- **原因**: Client IDまたはClient Secretが間違っている
- **解決**: Twitter開発者ポータルから正しい値をコピーして、Vercelに再設定

#### "Token exchange failed: 401"エラー
- **原因**: OAuth 2.0が正しく設定されていない
- **解決**: Twitter開発者ポータルでOAuth 2.0を有効化

#### "invalid_state"エラー
- **原因**: Cookie問題またはセッションタイムアウト
- **解決**: 
  - ブラウザのCookieをクリア
  - シークレットモードで試す
  - 別のブラウザで試す

### 6. デバッグ情報の収集

問題が解決しない場合、以下の情報を収集：

1. **ブラウザのコンソールログ**
   - F12で開発者ツールを開く
   - Consoleタブのエラーをコピー

2. **Networkタブの情報**
   - Twitter連携ボタンをクリック
   - `/api/auth/twitter`のレスポンスを確認
   - `/api/auth/twitter/callback`のレスポンスを確認

3. **Vercelのファンクションログ**
   - Vercel Dashboard → Functions → Logs
   - エラーログを確認

### 7. 最終チェックリスト

- [ ] Vercelに環境変数を設定した
- [ ] 設定後に再デプロイした
- [ ] Twitter開発者ポータルでOAuth 2.0が有効
- [ ] Callback URLsが正しく設定されている
- [ ] Client IDとClient Secretが正しい
- [ ] ブラウザのCookieが有効
- [ ] JavaScriptが有効

### 8. それでも解決しない場合

1. Twitter APIの制限に達していないか確認
2. Twitter開発者アカウントのステータスを確認
3. アプリケーションが承認待ちでないか確認