# Supabaseデータベース移行ガイド

## データベーステーブルの作成手順

### 1. Supabaseダッシュボードへアクセス
1. [Supabase Dashboard](https://app.supabase.com/project/jepczzqulgibekmulamg)にログイン
2. 左側メニューから「SQL Editor」を選択

### 2. スキーマの適用
1. `supabase/schema.sql`の内容をコピー
2. SQL Editorに貼り付け
3. 「RUN」ボタンをクリックして実行

### 3. デモアカウントの作成
SQL Editorで以下のクエリを実行：

```sql
-- まずauth.usersにユーザーを作成（Supabaseが自動的に処理）
-- 次にpublic.usersに対応するレコードを作成
INSERT INTO public.users (id, email, full_name, subscription_tier)
VALUES (
  'f7c9a3d4-8b5e-4a6c-9d2e-1a3b5c7e9f11'::uuid,
  'demo@example.com',
  'デモユーザー',
  'premium'
);
```

### 4. デモアカウントの認証設定
1. Supabaseダッシュボードで「Authentication」→「Users」に移動
2. 「Invite user」をクリック
3. Email: `demo@example.com`を入力
4. 送信されたメールのリンクをコピー
5. パスワード設定ページで`demo123456`を設定

### 5. 環境変数の確認
以下の環境変数がVercelに設定されていることを確認：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## トラブルシューティング

### エラー: "Email signups are disabled"
1. Supabase Dashboard → Authentication → Providers
2. Emailプロバイダーを有効化
3. 「Confirm email」をオフに設定（開発環境の場合）

### エラー: "relation does not exist"
上記のスキーマ適用手順を実行してください。

### エラー: "permission denied"
Row Level Security (RLS)が正しく設定されているか確認してください。