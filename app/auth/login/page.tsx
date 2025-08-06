'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Create user profile if it doesn't exist
        const { error: profileError } = await supabaseClient
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }

        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    // デモアカウントの認証情報を自動入力
    setEmail('demo@example.com')
    setPassword('demo123456')
    setError('デモアカウントの情報を入力しました。「ログイン」ボタンをクリックしてください。')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AIマーケティング</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            おかえりなさい
          </h2>
          <p className="text-gray-600">
            アカウントにログインして続ける
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-content">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className={`${error.includes('デモアカウントの情報を入力しました') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'} px-4 py-3 rounded-md border`}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="メールアドレスを入力"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    ログイン状態を保持
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500">
                    パスワードをお忘れですか？
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ログイン中...
                  </div>
                ) : (
                  'ログイン'
                )}
              </button>
            </form>

            {/* デモアカウント */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                デモアカウント情報を入力
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                ※ デモアカウントが事前に作成されている必要があります
              </p>
            </div>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              無料でアカウント作成
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}