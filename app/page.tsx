'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseClient } from '@/lib/supabase-client'

export default function LandingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event: any, session: any) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AIマーケティング</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="btn-primary"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="btn-ghost"
                >
                  ログイン
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="btn-primary"
                >
                  無料で始める
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AIの力で{' '}
            <span className="gradient-text">SNSマーケティングを自動化</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            魅力的なTwitterコンテンツをAIで生成し、投稿を自動スケジューリング。
            パフォーマンスを詳細に分析できるマーケティングプラットフォーム。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link 
                href="/dashboard" 
                className="btn-primary text-lg px-8 py-4 h-auto"
              >
                ダッシュボードへ
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/signup" 
                  className="btn-primary text-lg px-8 py-4 h-auto"
                >
                  無料トライアルを開始
                </Link>
                <Link 
                  href="#features" 
                  className="btn-outline text-lg px-8 py-4 h-auto"
                >
                  詳しく見る
                </Link>
              </>
            )}
          </div>
          
          <div className="mt-12 text-sm text-gray-500">
            ✨ クレジットカード不要 • 🚀 2分で設定完了 • 📈 無料で分析機能を利用可能
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SNSマーケティングに必要なすべての機能
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AIを活用したプラットフォームがコンテンツ作成、スケジューリング、分析を自動化。
              ビジネスの成長に集中できます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AIコンテンツ生成</h3>
              <p className="text-gray-600">
                高度なAIを使用して、あらゆるトピックに対して3つのユニークなコンテンツを生成。
                A/Bテストや新鮮なコンテンツの維持に最適です。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">スマートスケジューリング</h3>
              <p className="text-gray-600">
                エンゲージメントが最も高い時間に投稿を自動スケジューリング。
                一度設定すれば、あとはお任せください。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">詳細な分析機能</h3>
              <p className="text-gray-600">
                エンゲージメント、インプレッション、成長指標を追跡。
                コンテンツ戦略を最適化するための洞察を獲得。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              使い方
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              たった3ステップで簡単に始められます
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Twitterを連携</h3>
              <p className="text-gray-600">
                OAuth 2.0認証で安全にTwitterアカウントを連携します。
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">コンテンツを生成</h3>
              <p className="text-gray-600">
                AIを使って、ブランドとターゲット層に合わせた魅力的な投稿を作成。
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">スケジュール＆分析</h3>
              <p className="text-gray-600">
                投稿をスケジュールし、詳細な分析でパフォーマンスを追跡。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 hero-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            SNS戦略を変革する準備はできましたか？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            すでに数千人のマーケターがAIを活用してSNSプレゼンスを拡大しています。
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
              >
                無料トライアルを開始
              </Link>
              <Link 
                href="/auth/login" 
                className="text-white border-2 border-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold">AIマーケティング</span>
            </div>
            
            <div className="flex space-x-8">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                利用規約
              </Link>
              <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                サポート
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 AIマーケティングツール. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}