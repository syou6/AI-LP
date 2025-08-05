# Supabaseメール認証の有効化手順

## エラー: "Email signups are disabled"

このエラーは、Supabaseプロジェクトでメール認証が無効になっているために発生します。

### 解決手順：

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard にアクセス
   - プロジェクトを選択

2. **メールプロバイダーを有効化**
   - 左メニューから「Authentication」をクリック
   - 「Providers」タブを選択
   - 「Email」セクションを探す
   - **「Enable Email Provider」をONに切り替える**

3. **URL設定を確認**
   - 「Authentication」→「URL Configuration」
   - 以下のURLが設定されているか確認：
     - Site URL: `https://makerting-app.vercel.app`
     - Redirect URLs:
       - `https://makerting-app.vercel.app`
       - `https://makerting-app.vercel.app/auth/callback`
       - `https://ai-lp-yrhn.vercel.app` (現在のデプロイURL)
       - `https://ai-lp-yrhn.vercel.app/auth/callback`

4. **メール確認設定（オプション）**
   - 開発中はメール確認を無効にすると便利です
   - 「Authentication」→「Settings」
   - 「Enable email confirmations」を**OFF**に設定
   - これにより、登録後すぐにログインできるようになります

5. **保存を忘れずに**
   - 設定変更後は必ず「Save」ボタンをクリック

### 設定後の確認

1. ブラウザをリフレッシュ
2. 新規登録を再度試す
3. コンソールでエラーが解消されているか確認

### その他の注意点

- URLが`ai-lp-yrhn.vercel.app`になっているので、この新しいURLもSupabaseの許可リストに追加する必要があります
- プライバシーポリシー（/privacy）と利用規約（/terms）ページが404エラーになっていますが、これは別の問題なので後で対応可能です