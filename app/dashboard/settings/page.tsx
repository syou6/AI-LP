'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface TwitterStatus {
  connected: boolean
  twitter_user_id?: string
  twitter_username?: string
  expired?: boolean
  error?: string
}

export default function SettingsPage() {
  const [twitterStatus, setTwitterStatus] = useState<TwitterStatus>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const searchParams = useSearchParams()

  useEffect(() => {
    checkTwitterStatus()
    
    // Check for URL parameters (from OAuth callback)
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'twitter_connected') {
      setMessage('Twitterアカウントを接続しました！')
      setMessageType('success')
    } else if (error) {
      const errorMessages = {
        oauth_denied: 'Twitter接続がキャンセルされました。',
        missing_parameters: 'Twitterからの無効なOAuthレスポンスです。',
        invalid_state: 'セキュリティ検証に失敗しました。もう一度お試しください。',
        database_error: 'Twitter接続の保存に失敗しました。',
        oauth_failed: 'Twitter接続に失敗しました。もう一度お試しください。',
        token_exchange_failed: 'Twitterトークンの取得に失敗しました。APIキーの設定を確認してください。',
      }
      let errorMessage = errorMessages[error as keyof typeof errorMessages] || 'Twitter接続中にエラーが発生しました。'
      
      // 詳細なエラー情報があれば追加
      const details = searchParams.get('details')
      if (details) {
        errorMessage += ` (詳細: ${details})`
      }
      
      setMessage(errorMessage)
      setMessageType('error')
    }

    // Clear URL parameters after showing message
    if (success || error) {
      const timer = setTimeout(() => {
        setMessage('')
        setMessageType('')
        window.history.replaceState({}, '', '/dashboard/settings')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const checkTwitterStatus = async () => {
    try {
      const response = await fetch('/api/auth/twitter/verify')
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Twitter status check failed:', errorData)
        setTwitterStatus({ 
          connected: false, 
          error: response.status === 404 
            ? 'API接続エラー: 環境変数の設定を確認してください' 
            : errorData.error || '接続状態の確認に失敗しました' 
        })
        return
      }
      const data = await response.json()
      setTwitterStatus(data)
    } catch (error) {
      console.error('Error checking Twitter status:', error)
      setTwitterStatus({ connected: false, error: '接続状態の確認に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const connectTwitter = async () => {
    setConnecting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/auth/twitter', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const data = await response.json()
        console.error('Twitter connection failed:', data)
        throw new Error(
          response.status === 404 
            ? 'API接続エラー: 環境変数の設定を確認してください' 
            : data.error || 'Twitter接続の開始に失敗しました'
        )
      }

      const data = await response.json()
      if (!data.url) {
        throw new Error('認証URLの生成に失敗しました')
      }

      // Redirect to Twitter OAuth
      window.location.href = data.url
    } catch (error: any) {
      setMessage(error.message)
      setMessageType('error')
      setConnecting(false)
    }
  }

  const disconnectTwitter = async () => {
    setDisconnecting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('/api/auth/twitter/verify', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Twitterの切断に失敗しました')
      }

      setTwitterStatus({ connected: false })
      setMessage('Twitterアカウントを切断しました。')
      setMessageType('success')
    } catch (error: any) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          アカウント設定と連携を管理します
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-md ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Twitter Integration */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Twitter連携</h2>
            <p className="card-description">
              Twitterアカウントを接続して投稿の公開と分析を追跡します
            </p>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">接続状態を確認中...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Twitter</h3>
                      {twitterStatus.connected ? (
                        <div className="space-y-1">
                          <p className="text-sm text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            接続済み
                          </p>
                          {twitterStatus.twitter_username && (
                            <p className="text-sm text-gray-600">
                              @{twitterStatus.twitter_username}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            未接続
                          </p>
                          {twitterStatus.error && (
                            <p className="text-sm text-red-600">{twitterStatus.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {twitterStatus.connected ? (
                      <button
                        onClick={disconnectTwitter}
                        disabled={disconnecting}
                        className="btn-destructive"
                      >
                        {disconnecting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            切断中...
                          </div>
                        ) : (
                          '切断'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={connectTwitter}
                        disabled={connecting}
                        className="btn-primary"
                      >
                        {connecting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            接続中...
                          </div>
                        ) : (
                          'Twitterを接続'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {twitterStatus.expired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          接続が期限切れです
                        </h3>
                        <div className="mt-1 text-sm text-yellow-700">
                          <p>Twitterの接続が期限切れです。投稿を続けるには再接続してください。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!twitterStatus.connected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Twitterを接続する理由
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Twitterアカウントに直接投稿</li>
                            <li>最適なエンゲージメントのための投稿スケジュール</li>
                            <li>詳細な分析と指標の追跡</li>
                            <li>アカウントパフォーマンスの監視</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">アカウント設定</h2>
            <p className="card-description">
              アカウントの設定を管理します
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">メール通知</h3>
                  <p className="text-sm text-gray-500">投稿や分析に関する通知を受け取る</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">分析レポート</h3>
                  <p className="text-sm text-gray-500">投稿パフォーマンスの週次サマリー</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">サブスクリプション</h2>
            <p className="card-description">
              現在のプランと請求情報
            </p>
          </div>
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">無料プラン</h3>
                <p className="text-sm text-gray-500">
                  • 月に最大50件の投稿<br />
                  • 基本的な分析<br />
                  • Twitter連携
                </p>
              </div>
              <div>
                <button className="btn-outline">
                  プランをアップグレード
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-200">
          <div className="card-header">
            <h2 className="card-title text-red-700">危険ゾーン</h2>
            <p className="card-description">
              取り消し不可能な破壊的な操作
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">アカウント削除</h3>
                  <p className="text-sm text-gray-500">
                    アカウントと関連するすべてのデータを完全に削除します
                  </p>
                </div>
                <button className="btn-destructive">
                  アカウントを削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}