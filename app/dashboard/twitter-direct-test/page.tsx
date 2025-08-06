'use client'

export default function TwitterDirectTestPage() {
  const clientId = 'TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ'
  const redirectUri = 'https://ai-lp-yrhn.vercel.app/api/auth/twitter/simple-callback'
  const state = 'test_' + Date.now()
  
  // 最もシンプルなOAuth URL
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}`

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Twitter OAuth直接テスト</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cookieを使用せずに直接Twitter認証をテストします
        </p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">テスト1: シンプルなコールバック</h2>
          </div>
          <div className="card-content">
            <p className="text-sm text-gray-600 mb-4">
              このテストでは、Twitterから返されるパラメータを確認します。
            </p>
            <a
              href={authUrl}
              className="btn-primary inline-block"
            >
              Twitterで認証（シンプルコールバック）
            </a>
            <p className="text-xs text-gray-500 mt-2">
              コールバック先: /api/auth/twitter/simple-callback
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">テスト2: Cookieなし認証</h2>
          </div>
          <div className="card-content">
            <p className="text-sm text-gray-600 mb-4">
              Cookieを使用せずに認証フローをテストします。
            </p>
            <a
              href="/api/auth/twitter/test-without-cookies"
              className="btn-primary inline-block"
            >
              Twitterで認証（Cookieなし）
            </a>
            <p className="text-xs text-gray-500 mt-2">
              エンドポイント: /api/auth/twitter/test-without-cookies
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">OAuth URL詳細</h2>
          </div>
          <div className="card-content">
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-xs font-mono break-all">{authUrl}</p>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="font-medium">Client ID:</span>
                <span className="ml-2 font-mono text-xs">{clientId}</span>
              </div>
              <div>
                <span className="font-medium">Redirect URI:</span>
                <span className="ml-2 font-mono text-xs">{redirectUri}</span>
              </div>
              <div>
                <span className="font-medium">State:</span>
                <span className="ml-2 font-mono text-xs">{state}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">期待される結果</h2>
          </div>
          <div className="card-content">
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-medium text-gray-900">成功した場合</h3>
                <p className="text-gray-700">
                  Twitterの認証画面が表示され、承認後にコールバックURLにリダイレクトされます。
                  codeパラメータが含まれているはずです。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">失敗した場合</h3>
                <ul className="list-disc list-inside text-gray-700 mt-1">
                  <li>Invalid client_id: OAuth 2.0が有効でない</li>
                  <li>Invalid redirect_uri: URLが一致しない</li>
                  <li>Invalid scope: 権限が無効</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}