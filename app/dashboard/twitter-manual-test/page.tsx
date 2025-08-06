'use client'

import { useState } from 'react'

export default function TwitterManualTestPage() {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [authUrl, setAuthUrl] = useState('')

  const generateUrl = () => {
    if (!clientId) {
      alert('Client IDを入力してください')
      return
    }

    const redirectUri = 'https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback'
    const state = 'test_' + Date.now()
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: state,
      code_challenge: 'challenge',
      code_challenge_method: 'plain',
    })

    const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    setAuthUrl(url)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(authUrl)
    alert('URLをクリップボードにコピーしました')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Twitter OAuth手動テスト</h1>
        <p className="mt-1 text-sm text-gray-500">
          手動でOAuth URLを生成してテストします
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client ID (OAuth 2.0)
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Secret (オプション - URLには含まれません)
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="生成したClient Secret"
          />
        </div>

        <div>
          <button
            onClick={generateUrl}
            className="btn-primary"
          >
            OAuth URLを生成
          </button>
        </div>

        {authUrl && (
          <div className="mt-4 space-y-2">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">生成されたURL:</h3>
              <p className="text-xs text-gray-600 break-all">{authUrl}</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={copyUrl}
                className="btn-secondary"
              >
                URLをコピー
              </button>
              
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                新しいタブで開く
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 card">
          <div className="card-header">
            <h2 className="card-title">デバッグ手順</h2>
          </div>
          <div className="card-content">
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>上記にClient IDを入力（TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ）</li>
              <li>「OAuth URLを生成」をクリック</li>
              <li>生成されたURLを新しいタブで開く</li>
              <li>エラーメッセージを確認</li>
              <li>もしエラーが出る場合：
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>「Invalid client_id」→ Client IDが間違っている</li>
                  <li>「Invalid redirect_uri」→ Callback URLが一致しない</li>
                  <li>「Invalid scope」→ 権限設定の問題</li>
                </ul>
              </li>
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
                <h3 className="font-medium text-gray-900">エラー: Invalid client_id</h3>
                <p className="text-gray-700">
                  OAuth 2.0のClient IDではなく、OAuth 1.0aのAPI Keyを使用している可能性があります。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">エラー: Invalid redirect_uri</h3>
                <p className="text-gray-700">
                  Twitter Developer PortalのCallback URLsと完全に一致する必要があります。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">エラー: Unauthorized client</h3>
                <p className="text-gray-700">
                  User authentication settingsでOAuth 2.0が有効になっていない可能性があります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}