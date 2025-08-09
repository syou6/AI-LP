# 🚨 Twitter OAuth 1.0a 設定が必要です

## エラーの原因

「401 unauthorized_client」エラーが発生しています。これは以下の原因が考えられます：

1. **Twitter Developer PortalでOAuth 1.0aが有効になっていない**
2. **Callback URLが登録されていない**
3. **App permissionsが不適切**

## 今すぐ必要な設定

### ステップ1: Twitter Developer Portalにログイン

1. https://developer.twitter.com/en/apps にアクセス
2. あなたのアプリをクリック

### ステップ2: User authentication settingsを設定

1. 左メニューから「**User authentication settings**」をクリック
2. 「**Set up**」ボタンをクリック（既に設定済みの場合は「Edit」）

### ステップ3: 以下の設定を行う

#### OAuth 1.0a を有効にする
- ✅ **OAuth 1.0a** にチェック
- ❌ OAuth 2.0 のチェックは外す（Free tierでは使用不可）

#### App permissions
- ✅ **Read and write** を選択
  - 「Read」だけだとツイート投稿ができません

#### Type of App
- ✅ **Web App, Automated App or Bot** を選択

#### App info - Callback URLs（重要！）
以下のURLを**すべて**追加してください：

```
https://ai-lp-yrhn.vercel.app/api/auth/twitter-oauth1/callback
http://localhost:3001/api/auth/twitter-oauth1/callback
```

#### Website URL
```
https://ai-lp-yrhn.vercel.app
```

### ステップ4: 保存

「**Save**」ボタンをクリック

### ステップ5: API KeyとAPI Secretを確認

1. 左メニューから「**Keys and tokens**」をクリック
2. **Consumer Keys** セクションを確認
   - API Key: `TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ` と一致していることを確認
   - API Key Secret: 設定済みであることを確認

## 設定後のテスト

1. ローカルでテスト：
```
http://localhost:3001/api/auth/twitter-oauth1/test
```

2. または直接テスト：
```
http://localhost:3001/api/auth/twitter-oauth1/simple-test
```

## よくある問題と解決方法

### 「Callback URL not approved」エラー
→ Callback URLsに上記のURLが**正確に**登録されているか確認

### 「Read-only application cannot POST」エラー
→ App permissionsを「Read and write」に変更

### 「Could not authenticate you」エラー
→ API KeyとAPI Secretが正しいか確認

## 重要な注意点

1. **Callback URLは完全一致が必要**
   - `http://` と `https://` は別物として扱われます
   - 末尾のスラッシュの有無も区別されます

2. **設定変更後は数分待つ**
   - Twitter側で設定が反映されるまで1-2分かかることがあります

3. **Free tierの制限**
   - OAuth 2.0は使用できません
   - OAuth 1.0aのみ使用可能
   - 月間1,500ツイートまで

## それでも動作しない場合

1. アプリを削除して新規作成
2. 最初からOAuth 1.0aを有効にして設定
3. 新しいAPI Key/Secretを取得して環境変数を更新