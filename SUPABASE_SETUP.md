# Supabase設定ガイド

## 新規登録ができない場合の確認事項

### 1. Supabaseダッシュボードで確認する設定

#### Authentication設定
1. [Supabaseダッシュボード](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択
3. 左メニューから「Authentication」→「Providers」を選択
4. 「Email」が有効になっているか確認
   - Email provider: **Enabled**である必要があります
   - Confirm email: 開発中は**Disabled**にすると便利です

#### URL設定
1. 「Authentication」→「URL Configuration」を選択
2. 以下のURLを追加：
   - Site URL: `https://makerting-app.vercel.app`
   - Redirect URLs: 
     - `https://makerting-app.vercel.app`
     - `https://makerting-app.vercel.app/auth/callback`
     - `http://localhost:3000` (開発用)
     - `http://localhost:3000/auth/callback` (開発用)

#### メール設定
1. 「Authentication」→「Email Templates」を選択
2. 確認メールを無効にする場合：
   - 「Settings」→「Auth settings」
   - 「Enable email confirmations」を**OFF**に

### 2. データベーステーブルの確認

以下のSQLを実行して`users`テーブルが存在するか確認：

```sql
-- usersテーブルの確認
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- なければ作成
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- RLSポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のプロフィールを読み書きできるポリシー
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. 環境変数の確認

Vercelの環境変数が正しく設定されているか確認：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. よくあるエラーと対処法

#### "Invalid email"
- メールアドレスの形式が正しいか確認
- Supabaseのメールプロバイダーが有効か確認

#### "User already registered"
- 既に同じメールアドレスで登録されている
- Supabaseダッシュボードの「Authentication」→「Users」で確認

#### "Database error"
- `users`テーブルが存在しない
- RLSポリシーが設定されていない

#### "Network error"
- Supabase URLが正しいか確認
- CORSの設定を確認

### 5. デバッグ方法

ブラウザの開発者ツールで：
1. Networkタブを開く
2. 新規登録を試みる
3. Supabaseへのリクエストを確認
4. エラーレスポンスの詳細を確認

### 6. テスト用アカウント

開発中は以下のメールアドレス形式でテスト：
- `test+1@example.com`
- `test+2@example.com`
（+記号を使うと同じメールアドレスで複数アカウント作成可能）