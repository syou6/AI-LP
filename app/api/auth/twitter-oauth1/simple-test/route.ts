import { NextRequest, NextResponse } from 'next/server'
import { twitterOAuth1Service } from '@/lib/twitter-oauth1-service'

export async function GET(request: NextRequest) {
  try {
    // 環境変数チェック
    const apiKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CLIENT_ID
    const apiSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CLIENT_SECRET
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        error: 'Twitter API credentials not configured',
        setup: {
          apiKey: apiKey ? 'SET' : 'MISSING',
          apiSecret: apiSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 })
    }

    // OAuth 1.0a認証リンクを直接生成（認証不要）
    const authData = await twitterOAuth1Service.generateAuthLink()
    
    // レスポンスを作成
    const response = NextResponse.redirect(authData.url)
    
    // OAuth tokenとsecretをcookieに保存
    response.cookies.set('twitter_oauth_token', authData.oauth_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10分
      path: '/'
    })
    
    response.cookies.set('twitter_oauth_token_secret', authData.oauth_token_secret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10分
      path: '/'
    })
    
    // テスト用の仮ユーザーID
    response.cookies.set('twitter_user_id', 'test-user-' + Date.now(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10分
      path: '/'
    })
    
    return response
    
  } catch (error: any) {
    console.error('Twitter OAuth 1.0a simple test error:', error)
    return NextResponse.json({
      error: 'OAuth test failed',
      message: error.message,
      details: error.stack
    }, { status: 500 })
  }
}