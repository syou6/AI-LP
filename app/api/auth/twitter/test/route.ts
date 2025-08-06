import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // 環境変数チェック
    const clientId = process.env.TWITTER_CLIENT_ID
    const clientSecret = process.env.TWITTER_CLIENT_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    const redirectUri = `${appUrl}/api/auth/twitter/test/callback`
    
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Twitter API credentials not configured',
        setup: {
          clientId: clientId ? 'SET' : 'MISSING',
          clientSecret: clientSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 })
    }

    // PKCE対応のOAuth URLを生成（Twitter OAuth 2.0では必須）
    const state = crypto.randomBytes(16).toString('hex')
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    
    // HTMLページとして返す（直接リダイレクトをテスト）
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>X連携テスト</title>
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
          .error {
            background: #fee;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #c00;
          }
          .success {
            background: #efe;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #060;
          }
          pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
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
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🐦 X（Twitter）連携テスト</h1>
          
          <div class="info">
            <h2>📋 現在の設定</h2>
            <pre>
Client ID: ${clientId.substring(0, 10)}...
Redirect URI: ${redirectUri}
Scope: tweet.read tweet.write users.read offline.access
State: ${state}
PKCE: Enabled (code_challenge_method: S256)
            </pre>
          </div>

          <div class="info">
            <h2>🔧 Developer Portal確認事項</h2>
            <ol>
              <li><a href="https://developer.twitter.com/en/apps" target="_blank">Twitter Developer Portal</a>を開く</li>
              <li>アプリの「Settings」→「User authentication settings」を確認</li>
              <li>OAuth 2.0が有効になっていることを確認</li>
              <li>Callback URLsに以下を追加：
                <pre>${redirectUri}</pre>
              </li>
              <li>App permissionsで必要な権限が設定されていることを確認</li>
            </ol>
          </div>

          <div class="success">
            <h2>🚀 テスト実行</h2>
            <p>下のボタンをクリックしてX認証をテストします：</p>
            <a href="${authUrl}" class="button">X連携をテスト</a>
            
            <h3>手動でテストする場合のURL：</h3>
            <pre style="word-break: break-all;">${authUrl}</pre>
          </div>

          <div class="info">
            <h2>❓ エラーが出る場合</h2>
            <ul>
              <li>「アプリにアクセスを許可できません」→ Callback URLの設定を確認</li>
              <li>「Invalid client」→ Client IDを確認</li>
              <li>「Unauthorized」→ App permissionsを確認</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `
    
    const responseWithCookie = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
    
    // PKCEのcode_verifierとstateをcookieに保存
    responseWithCookie.cookies.set('test_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 600,
      path: '/'
    })
    
    responseWithCookie.cookies.set('test_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 600,
      path: '/'
    })
    
    return responseWithCookie
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test endpoint error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}