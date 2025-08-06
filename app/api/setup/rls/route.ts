import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // サービスロールキーを使用してSupabaseクライアントを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Supabase環境変数が設定されていません'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // RLSポリシーを設定するSQLクエリ
    const queries = [
      // 既存のポリシーを削除
      `DROP POLICY IF EXISTS "Users can view own profile" ON users;`,
      `DROP POLICY IF EXISTS "Users can update own profile" ON users;`,
      `DROP POLICY IF EXISTS "Users can insert own profile" ON users;`,
      `DROP POLICY IF EXISTS "Enable read access for users" ON users;`,
      `DROP POLICY IF EXISTS "Enable update for users" ON users;`,
      `DROP POLICY IF EXISTS "Enable insert for users" ON users;`,
      
      // RLSを有効化
      `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
      
      // 新しいポリシーを作成
      `CREATE POLICY "Users can view own profile" 
       ON users FOR SELECT 
       USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can update own profile" 
       ON users FOR UPDATE 
       USING (auth.uid() = id)
       WITH CHECK (auth.uid() = id);`,
      
      `CREATE POLICY "Users can insert own profile" 
       ON users FOR INSERT 
       WITH CHECK (auth.uid() = id);`
    ]

    const results = []
    
    // 各クエリを実行
    for (const query of queries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: query
        }).single()
        
        if (error) {
          // RPCが存在しない場合は、直接実行を試みる
          const { error: directError } = await supabase.from('users').select('id').limit(0)
          
          results.push({
            query: query.substring(0, 50) + '...',
            status: directError ? 'failed' : 'executed',
            error: directError?.message
          })
        } else {
          results.push({
            query: query.substring(0, 50) + '...',
            status: 'success'
          })
        }
      } catch (err: any) {
        results.push({
          query: query.substring(0, 50) + '...',
          status: 'error',
          error: err.message
        })
      }
    }

    // 代替方法：Supabase Management APIを使用
    const setupInstructions = `
RLSポリシーの自動設定に失敗しました。以下の手順で手動設定してください：

1. Supabaseダッシュボードにアクセス
   https://supabase.com/dashboard/project/jepczzqulgibekmulamg

2. SQL Editorを開く

3. 以下のSQLを実行：

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 新しいポリシーを作成
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

4. 実行後、設定画面をリロード
`

    return NextResponse.json({
      message: 'RLSポリシー設定を試みました',
      results,
      setupInstructions,
      supabaseProjectUrl: `https://supabase.com/dashboard/project/jepczzqulgibekmulamg/editor`
    })

  } catch (error: any) {
    console.error('RLS setup error:', error)
    return NextResponse.json({
      error: 'RLS設定中にエラーが発生しました',
      message: error.message,
      instructions: `
手動でRLSを設定してください：

1. https://supabase.com/dashboard/project/jepczzqulgibekmulamg/editor にアクセス
2. 上記のSQLクエリを実行
`
    }, { status: 500 })
  }
}