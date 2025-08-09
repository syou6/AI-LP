import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 環境変数チェック
    const apiKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CLIENT_ID
    const apiSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CLIENT_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    const callbackUrl = `${appUrl}/api/auth/twitter-oauth1/callback`
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        error: 'Twitter API credentials not configured',
        setup: {
          apiKey: apiKey ? 'SET' : 'MISSING',
          apiSecret: apiSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 })
    }

    // OAuth 1.0aテスト用のHTMLページを返す
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>X (Twitter) OAuth 1.0a連携テスト</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .info {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #856404;
          }
          .success {
            background: #d4edda;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #155724;
          }
          pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            background: #1d9bf0;
            color: white;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            margin: 10px 0;
          }
          .button:hover {
            background: #1a8cd8;
          }
          .error {
            background: #f8d7da;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #721c24;
          }
          code {
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🐦 X (Twitter) OAuth 1.0a 連携テスト</h1>
          
          <div class="warning">
            <h2>⚠️ Free Tier制限について</h2>
            <p>現在、Twitter APIの<strong>Free tier</strong>を使用しています。</p>
            <ul>
              <li>OAuth 1.0aのみ利用可能（OAuth 2.0は利用不可）</li>
              <li>月間1,500ツイート投稿制限</li>
              <li>詳細な分析データは取得不可</li>
            </ul>
          </div>

          <div class="info">
            <h2>📋 現在の設定</h2>
            <pre>
API Key (OAuth 1.0a): ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}
API Secret: ${apiSecret ? '設定済み' : 'NOT SET'}
Callback URL: ${callbackUrl}
認証タイプ: OAuth 1.0a (3-legged OAuth)
            </pre>
          </div>

          <div class="info">
            <h2>🔧 Developer Portal確認事項</h2>
            <ol>
              <li><a href="https://developer.twitter.com/en/apps" target="_blank">Twitter Developer Portal</a>を開く</li>
              <li>アプリの「Settings」タブを確認</li>
              <li>「User authentication settings」で以下を確認：
                <ul>
                  <li>OAuth 1.0aが有効</li>
                  <li>Callback URLsに以下が登録されている：
                    <code>${callbackUrl}</code>
                  </li>
                  <li>App permissionsが「Read and write」</li>
                </ul>
              </li>
            </ol>
          </div>

          <div class="success">
            <h2>🚀 テスト実行</h2>
            <p>下のボタンをクリックしてOAuth 1.0a認証をテストします：</p>
            <a href="/api/auth/twitter-oauth1?test=true" class="button">X連携をテスト（OAuth 1.0a）</a>
            
            <p style="margin-top: 20px;">
              <strong>注意：</strong>このボタンをクリックすると、Twitterの認証画面にリダイレクトされます。
            </p>
          </div>

          <div class="info">
            <h2>❓ エラーが出る場合の対処法</h2>
            <ul>
              <li><strong>「Callback URL not approved」</strong><br>
                → Developer PortalでCallback URLを追加してください</li>
              <li><strong>「Invalid oauth_consumer_key」</strong><br>
                → API KeyとAPI Secretを確認してください</li>
              <li><strong>「Read-only application cannot POST」</strong><br>
                → App permissionsを「Read and write」に変更してください</li>
              <li><strong>「Rate limit exceeded」</strong><br>
                → Free tierの制限に達しています（月1,500ツイート）</li>
            </ul>
          </div>

          <div class="warning">
            <h2>📈 アップグレードの検討</h2>
            <p>より多くの機能が必要な場合は、<strong>Basic tier</strong>（月額$100）へのアップグレードを検討してください：</p>
            <ul>
              <li>OAuth 2.0のサポート</li>
              <li>月間10,000ツイート投稿</li>
              <li>詳細な分析データへのアクセス</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test endpoint error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}