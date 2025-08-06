-- Supabase RLSポリシー修正スクリプト
-- usersテーブルの406エラーを解決

-- 1. まず既存のポリシーを確認（必要に応じて削除）
-- DROP POLICY IF EXISTS "Users can view own profile" ON users;
-- DROP POLICY IF EXISTS "Users can update own profile" ON users;
-- DROP POLICY IF EXISTS "Enable read access for users" ON users;
-- DROP POLICY IF EXISTS "Enable update for users" ON users;

-- 2. RLSを有効化（既に有効な場合はスキップ）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. 認証されたユーザーが自分のプロフィールを読み取れるポリシー
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (
  auth.uid() = id
);

-- 4. 認証されたユーザーが自分のプロフィールを更新できるポリシー
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- 5. 認証されたユーザーが自分のプロフィールを挿入できるポリシー
CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
WITH CHECK (
  auth.uid() = id
);

-- 6. サービスロールからのアクセスを許可（必要に応じて）
-- これはサーバーサイドからのアクセス用
CREATE POLICY "Service role has full access" 
ON users FOR ALL 
USING (
  auth.role() = 'service_role'
);

-- 確認用クエリ
-- SELECT * FROM pg_policies WHERE tablename = 'users';