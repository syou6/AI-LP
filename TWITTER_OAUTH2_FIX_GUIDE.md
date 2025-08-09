# 🚨 X (Twitter) OAuth 2.0 連携エラー解決ガイド

## 問題の原因

現在のClient IDが **OAuth 1.0a形式** になっているため、OAuth 2.0で動作していません。

### 現在の設定（間違い）
```
TWITTER_CLIENT_ID=TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ  # ← これはOAuth 1.0a形式
```

### 正しいOAuth 2.0のClient ID形式
```
TWITTER_CLIENT_ID=bGdWUm1tT3JZdVRPajN3SURhSDN...  # 50文字以上の長い文字列
```

## 解決手順

### ステップ1: Twitter Developer Portalにアクセス
1. https://developer.twitter.com/en/portal/dashboard にログイン
2. あなたのプロジェクトとアプリを確認

### ステップ2: OAuth 2.0 Client IDを取得

#### 方法A: 既存アプリでOAuth 2.0を有効化

1. **アプリケーション名をクリック**
2. 左メニューから **「User authentication settings」** をクリック
3. **「Set up」または「Edit」** ボタンをクリック
4. 以下の設定を行う：

   **App permissions:**
   - ✅ Read and write

   **Type of App:**
   - ✅ Web App, Automated App or Bot

   **App info:**
   - Callback URI / Redirect URL:
     ```
     https://ai-lp-yrhn.vercel.app
     https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
     http://localhost:3001/api/auth/twitter/callback
     ```
   - Website URL: `https://ai-lp-yrhn.vercel.app`

5. **「Save」をクリック**

6. 左メニューから **「Keys and tokens」** をクリック

7. **OAuth 2.0 Client ID and Client Secret** セクションを探す
   - ⚠️ **重要**: これは「API Key and Secret」セクションとは**別物**です
   - OAuth 2.0セクションが表示されない場合は、User authentication settingsが正しく設定されていません

8. **「Regenerate」** ボタンをクリックして新しいOAuth 2.0認証情報を生成

#### 方法B: 新しいアプリを作成（推奨）

1. **「+ Create App」** をクリック
2. アプリ名を入力（例: `marketing-ai-oauth2`）
3. 作成後、上記の方法Aの手順3-8を実行

### ステップ3: 環境変数を更新

1. `.env.local`ファイルを更新：
```env
# OAuth 2.0の正しい認証情報
TWITTER_CLIENT_ID=[新しいOAuth 2.0 Client ID - 長い文字列]
TWITTER_CLIENT_SECRET=[新しいOAuth 2.0 Client Secret - 50文字程度]
TWITTER_REDIRECT_URI=https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
```

2. Vercelの環境変数も更新：
   - https://vercel.com にログイン
   - プロジェクトの Settings → Environment Variables
   - `TWITTER_CLIENT_ID`と`TWITTER_CLIENT_SECRET`を更新
   - **「Save」をクリック**
   - **再デプロイ**

### ステップ4: 動作確認

1. ローカルでテスト：
```bash
npm run dev
```
http://localhost:3001/api/auth/twitter/test にアクセス

2. 本番環境でテスト：
https://ai-lp-yrhn.vercel.app/api/auth/twitter/test にアクセス

## Client IDの見分け方

| タイプ | 形式 | 例 | 文字数 |
|--------|------|-----|--------|
| ❌ OAuth 1.0a API Key | `xxxx:1:ci` 形式 | `TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ` | 34文字 |
| ✅ OAuth 2.0 Client ID | 長いBase64文字列 | `bGdWUm1tT3JZdVRPajN3SURhSDN...` | 50文字以上 |

## トラブルシューティング

### エラー: "Invalid client_id"
- OAuth 2.0 Client IDではなく、OAuth 1.0a API Keyを使用している
- 解決: 上記の手順でOAuth 2.0 Client IDを取得

### エラー: "Callback URL mismatch"
- Developer PortalのCallback URLsに正しいURLが登録されていない
- 解決: User authentication settingsでCallback URLsを追加

### エラー: "Unauthorized"
- App permissionsが不足している
- 解決: Read and writeパーミッションを設定

### OAuth 2.0セクションが表示されない
- User authentication settingsが設定されていない
- 解決: ステップ2の方法Aの手順3-5を実行

## 重要な注意点

1. **OAuth 1.0aとOAuth 2.0は別物**
   - API Key ≠ OAuth 2.0 Client ID
   - API Secret ≠ OAuth 2.0 Client Secret

2. **Free tierの制限**
   - Twitter APIのFree tierではOAuth 2.0に制限がある場合があります
   - Basic tier以上が推奨されます

3. **PKCE (Proof Key for Code Exchange)**
   - OAuth 2.0では必須
   - コードで自動的に処理されています

## 次のステップ

1. 上記の手順でOAuth 2.0認証情報を取得
2. `.env.local`を更新
3. Vercel環境変数を更新
4. テストエンドポイントで動作確認
5. 問題が解決したら、本番環境で連携をテスト

## サポート

問題が解決しない場合は、以下の情報と共に報告してください：
- Twitter Developer Portalのスクリーンショット
- エラーメッセージの詳細
- Client IDの最初の10文字（セキュリティのため全体は共有しない）