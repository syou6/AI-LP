# Supabase RLSポリシー修正ガイド

## エラー: 406 (Not Acceptable)

このエラーは、Row Level Security (RLS) ポリシーが原因です。

## 修正手順

### 1. Supabase SQL Editorにアクセス
https://app.supabase.com/project/jepczzqulgibekmulamg/sql

### 2. 以下のSQLを実行

```sql
-- RLSポリシーの確認
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- 一時的にRLSを無効化（開発中のみ）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- または、より安全な方法：SELECTポリシーを追加
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- サービスロールでのアクセスを許可
CREATE POLICY "Service role can access all users" 
ON users FOR ALL 
USING (auth.role() = 'service_role');
```

### 3. 本番環境向けの適切なRLSポリシー

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role can access all users" ON users;

-- 新しいポリシーを作成
-- ユーザーは自分のプロフィールを表示・更新できる
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- 新規ユーザーの作成を許可
CREATE POLICY "Enable insert for authenticated users only" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);
```

## 一時的な回避策

開発中は以下のコマンドでRLSを無効化できます：

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;
```

**注意**: 本番環境では必ずRLSを有効にしてください。