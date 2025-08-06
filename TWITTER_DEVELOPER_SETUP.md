# Twitter Developer Portal 設定手順

## 📋 設定手順（ステップバイステップ）

### Step 1: Twitter Developer Portalにアクセス
1. https://developer.twitter.com/en/apps を開く
2. あなたのアプリを選択（または新規作成）

### Step 2: User Authentication Settingsを開く
1. アプリのダッシュボードで「Settings」タブをクリック
2. 「User authentication settings」の「Set up」または「Edit」をクリック

### Step 3: OAuth 2.0を設定

#### 3-1. App permissionsセクション
**必須の権限にチェック:**
- ✅ **Read and write**
- ✅ **Read and write and Direct message**（可能なら）

#### 3-2. Type of Appセクション
以下を選択:
- 🔘 **Web App, Automated App or Bot**

#### 3-3. App infoセクション

**Callback URI / Redirect URL**
以下のURLを**すべて追加**（1行ずつ）:
```
https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
https://ai-lp-yrhn.vercel.app/api/auth/twitter/test/callback
https://ai-lp-yrhn.vercel.app/api/auth/twitter/simple-callback
http://localhost:3000/api/auth/twitter/callback
http://localhost:3000/api/auth/twitter/test/callback
```

**Website URL**
```
https://ai-lp-yrhn.vercel.app
```

**Terms of service URL**（オプション）
```
https://ai-lp-yrhn.vercel.app/terms
```

**Privacy policy URL**（オプション）
```
https://ai-lp-yrhn.vercel.app/privacy
```

### Step 4: OAuth 2.0 Client ID and Client Secretを確認

設定を保存後:
1. 「Keys and tokens」タブに移動
2. **OAuth 2.0 Client ID and Client Secret**セクションを確認

表示される情報:
- **Client ID**: `TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ` のような文字列
- **Client Secret**: 「Regenerate」をクリックして新規生成（初回のみ）

⚠️ **重要**: Client Secretは一度しか表示されません！必ずコピーして保存してください。

### Step 5: 環境変数を更新

`.env.local`ファイルを更新:
```bash
# Twitter API
TWITTER_CLIENT_ID=あなたのClient ID
TWITTER_CLIENT_SECRET=あなたのClient Secret
TWITTER_REDIRECT_URI=https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback
```

### Step 6: Vercelに環境変数を設定

1. https://vercel.com/dashboard にアクセス
2. あなたのプロジェクトを選択
3. 「Settings」→「Environment Variables」
4. 以下を追加:
   - `TWITTER_CLIENT_ID`: あなたのClient ID
   - `TWITTER_CLIENT_SECRET`: あなたのClient Secret
   - `TWITTER_REDIRECT_URI`: https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback

### Step 7: デプロイを再実行
```bash
vercel --prod
```

## 🔍 確認チェックリスト

- [ ] OAuth 2.0が有効になっている
- [ ] App permissionsで「Read and write」が選択されている
- [ ] Type of Appで「Web App, Automated App or Bot」が選択されている
- [ ] Callback URLsにすべてのURLが登録されている
- [ ] Client IDとClient Secretを取得した
- [ ] 環境変数を.env.localに設定した
- [ ] Vercelに環境変数を設定した
- [ ] デプロイを再実行した

## ⚠️ よくあるエラーと解決方法

### 「アプリにアクセスを許可できません」
**原因**: Callback URLが正しく設定されていない
**解決**: 上記のCallback URLをすべて追加

### 「Invalid client」
**原因**: Client IDまたはClient Secretが間違っている
**解決**: 環境変数を再確認

### 「Unauthorized」
**原因**: App permissionsが不足
**解決**: Read and writeを選択

## 📝 テスト方法

設定完了後、以下でテスト:
1. https://ai-lp-yrhn.vercel.app/api/auth/twitter/test
2. 「X連携をテスト」ボタンをクリック
3. Xにログインして承認
4. 成功メッセージが表示されれば完了！