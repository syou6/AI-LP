import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // パラメータを取得
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // HTMLレスポンスを生成
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>X連携テスト - コールバック</title>
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
        .success {
          background: #efe;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          color: #060;
        }
        .error {
          background: #fee;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          color: #c00;
        }
        .info {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        pre {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🐦 X連携テスト - コールバック結果</h1>
        
        ${error ? `
          <div class="error">
            <h2>❌ エラーが発生しました</h2>
            <p><strong>エラー:</strong> ${error}</p>
            <p><strong>詳細:</strong> ${errorDescription || 'なし'}</p>
            
            <h3>考えられる原因：</h3>
            <ul>
              <li>Callback URLがDeveloper Portalに登録されていない</li>
              <li>アプリの権限設定が不適切</li>
              <li>ユーザーが承認をキャンセルした</li>
            </ul>
          </div>
        ` : code ? `
          <div class="success">
            <h2>✅ 認証コード取得成功！</h2>
            <p>Xからの認証コードを正常に受け取りました。</p>
          </div>
          
          <div class="info">
            <h3>受け取ったパラメータ：</h3>
            <pre>
認証コード: ${code.substring(0, 20)}...
State: ${state || 'なし'}
            </pre>
            
            <h3>次のステップ：</h3>
            <p>この認証コードを使ってアクセストークンを取得します。</p>
            <p>本番環境では、この処理は自動的に行われます。</p>
          </div>
        ` : `
          <div class="error">
            <h2>⚠️ パラメータが取得できませんでした</h2>
            <p>認証コードもエラーも受け取れませんでした。</p>
          </div>
        `}
        
        <div class="info">
          <h3>🔍 デバッグ情報</h3>
          <pre>
完全なURL: ${request.url}
クエリパラメータ:
${Array.from(searchParams.entries()).map(([key, value]) => `  ${key}: ${value}`).join('\n') || '  なし'}
          </pre>
        </div>
        
        <a href="/api/auth/twitter/test" class="button">もう一度テスト</a>
        <a href="/dashboard/settings" class="button" style="background: #666; margin-left: 10px;">設定画面に戻る</a>
      </div>
    </body>
    </html>
  `
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}