'use client'

import { useState } from 'react'

export default function TwitterTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testEnv = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/debug/env')
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testTwitter = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/debug/twitter-test')
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testOAuth = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/twitter')
      const data = await response.json()
      
      if (data.url) {
        setResult({ ...data, message: 'OAuth URLが正常に生成されました' })
      } else {
        setError('OAuth URLの生成に失敗しました')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Twitter連携デバッグページ</h1>
        <p className="mt-1 text-sm text-gray-500">
          Twitter APIの設定と接続をテストします
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testEnv}
            disabled={loading}
            className="btn-primary"
          >
            環境変数をチェック
          </button>
          
          <button
            onClick={testTwitter}
            disabled={loading}
            className="btn-primary"
          >
            Twitter APIをテスト
          </button>
          
          <button
            onClick={testOAuth}
            disabled={loading}
            className="btn-primary"
          >
            OAuth URLを生成
          </button>
        </div>

        {loading && (
          <div className="text-gray-600">テスト中...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">エラー</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">結果</h3>
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Twitter開発者ポータルで確認すべき項目</h2>
          </div>
          <div className="card-content">
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>アプリケーションの「User authentication settings」でOAuth 2.0が有効</li>
              <li>Type of App: 「Web App, Automated App or Bot」を選択</li>
              <li>App permissions: 「Read and write」を選択</li>
              <li>Callback URIsに以下が登録されているか：
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>https://ai-lp-yrhn.vercel.app</li>
                  <li>https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback</li>
                </ul>
              </li>
              <li>Keys and tokensタブで「OAuth 2.0 Client ID and Client Secret」が生成されているか</li>
            </ol>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">よくある問題</h2>
          </div>
          <div className="card-content">
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-medium text-gray-900">OAuth 1.0a vs OAuth 2.0</h3>
                <p className="text-gray-700">
                  Client IDが「xxxx:1:ci」形式の場合、これはOAuth 1.0aのAPI Keyです。
                  OAuth 2.0では別のClient IDが必要です。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">400 Bad Request</h3>
                <p className="text-gray-700">
                  Client IDまたはClient Secretが間違っている可能性があります。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">401 Unauthorized</h3>
                <p className="text-gray-700">
                  OAuth 2.0が有効になっていない、またはアプリケーションの権限が不足しています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}