'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err: any) {
      setError('予期しないエラーが発生しました')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
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
            パスワードをリセット
          </h2>
          <p className="text-gray-600">
            登録したメールアドレスを入力してください
          </p>
        </div>

        {/* Password Reset Form */}
        <div className="card">
          <div className="card-content">
            {success ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">メールを送信しました</h3>
                <p className="text-gray-600 mb-6">
                  パスワードリセットの手順をメールで送信しました。
                  メールボックスをご確認ください。
                </p>
                <Link href="/auth/login" className="btn-primary inline-block">
                  ログインページに戻る
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      送信中...
                    </div>
                  ) : (
                    'パスワードリセットメールを送信'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Back to login */}
        <div className="text-center">
          <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 text-sm">
            ← ログインに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}