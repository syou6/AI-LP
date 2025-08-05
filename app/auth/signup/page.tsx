'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting signup for:', email)
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Signup error:', error)
        // エラーメッセージを日本語に変換
        if (error.message.includes('Invalid email')) {
          setError('有効なメールアドレスを入力してください')
        } else if (error.message.includes('Password')) {
          setError('パスワードは6文字以上で入力してください')
        } else if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError('このメールアドレスは既に登録されています。ログインページからログインしてください。')
        } else if (error.message.includes('Email rate limit exceeded')) {
          setError('メール送信の制限に達しました。しばらく待ってから再度お試しください。')
        } else if (error.message.includes('Invalid login credentials')) {
          setError('認証情報が無効です。メールアドレスとパスワードを確認してください。')
        } else {
          setError(`エラーが発生しました: ${error.message}`)
        }
        return
      }

      if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true)
      } else if (data.user) {
        // User is already confirmed, create profile and redirect
        const { error: profileError } = await supabaseClient
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName || null,
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }

        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('予期しないエラーが発生しました')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">AIマーケティング</span>
            </Link>
            
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              メールを確認してください
            </h2>
            <p className="text-gray-600 mb-8">
              <strong>{email}</strong>に確認リンクを送信しました。
              メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
            
            <div className="space-y-4">
              <Link href="/auth/login" className="btn-primary w-full">
                ログインへ
              </Link>
              <Link href="/" className="btn-ghost w-full">
                ホームに戻る
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              メールが届かない場合は、迷惑メールフォルダを確認するか{' '}
              <button 
                onClick={() => setSuccess(false)}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                もう一度お試しください
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AI Marketing</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            アカウントを作成
          </h2>
          <p className="text-gray-600">
            AIでSNS運用を自動化しましょう
          </p>
        </div>

        {/* Signup Form */}
        <div className="card">
          <div className="card-content">
            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  className="input"
                  placeholder="お名前を入力"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

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
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="パスワードを作成（6文字以上）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  6文字以上で入力してください
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    利用規約
                  </Link>
                  と
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    アカウント作成中...
                  </div>
                ) : (
                  'アカウントを作成'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Login link */}
        <div className="text-center">
          <p className="text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
              ログイン
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