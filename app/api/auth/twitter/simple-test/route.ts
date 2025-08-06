import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID || ''
  const redirectUri = 'https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback'
  
  // 最もシンプルなOAuth URLを作成
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read&state=test123`
  
  return NextResponse.json({
    message: 'このURLをブラウザに直接貼り付けてください',
    authUrl,
    debugInfo: {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : '未設定',
      redirectUri,
    }
  })
}