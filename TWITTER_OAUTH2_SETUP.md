# Twitter OAuth 2.0 設定ガイド

## 重要：OAuth 2.0 Client IDの取得方法

### 問題の原因
現在設定されているClient ID（`TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ`）は、OAuth 1.0a形式のAPI Keyです。
OAuth 2.0では別のClient IDが必要です。

### 正しいOAuth 2.0 Client IDの取得手順

1. **Twitter Developer Portalにアクセス**
   - https://developer.twitter.com/en/portal/dashboard

2. **アプリケーションを選択**
   - プロジェクトの下にあるアプリケーションをクリック

3. **Keys and tokensタブを開く**

4. **OAuth 2.0 Client ID and Client Secretセクションを確認**
   - ここに表示されるのがOAuth 2.0用の認証情報です
   - もし表示されていない場合は「Generate」ボタンをクリック

5. **正しいClient IDの形式**
   - OAuth 2.0 Client ID: 通常は長い文字列（例：`bGdWUm...`のような形式）
   - OAuth 2.0 Client Secret: 50文字程度の文字列

### OAuth 1.0a vs OAuth 2.0の違い

| 項目 | OAuth 1.0a | OAuth 2.0 |
|------|------------|-----------|
| API Key | `xxxx:1:ci`形式 | 使用しない |
| API Key Secret | 短い文字列 | 使用しない |
| Client ID | 使用しない | 長い文字列 |
| Client Secret | 使用しない | 50文字程度 |

### 設定手順

1. **User authentication settingsを確認**
   - Twitter Developer Portal → アプリケーション → User authentication settings
   - 「Set up」または「Edit」をクリック

2. **OAuth 2.0を有効化**
   - Type of App: `Web App, Automated App or Bot`
   - App permissions: `Read and write`
   - Callback URI / Redirect URL:
     ```
     https://ai-lp-yrhn.vercel.app
     https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
     ```
   - Website URL: `https://ai-lp-yrhn.vercel.app`

3. **保存後、OAuth 2.0の認証情報を取得**
   - Keys and tokens → OAuth 2.0 Client ID and Client Secret

### Vercel環境変数の更新

正しいOAuth 2.0の認証情報を取得したら：

1. [Vercelダッシュボード](https://vercel.com/syou6s-projects/ai-lp-yrhn/settings/environment-variables)にアクセス
2. 以下を更新：
   ```
   TWITTER_CLIENT_ID=[OAuth 2.0 Client ID]
   TWITTER_CLIENT_SECRET=[OAuth 2.0 Client Secret]
   ```
3. 保存後、再デプロイ

### 確認方法

1. `/api/debug/twitter-test`にアクセス
2. `apiTest`のステータスが`success`になることを確認