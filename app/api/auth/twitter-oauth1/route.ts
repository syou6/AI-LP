import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterOAuth1Service } from '@/lib/twitter-oauth1-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    
    // テストモードのチェック（?test=true パラメータがある場合は認証をスキップ）
    const { searchParams } = new URL(request.url)
    const isTestMode = searchParams.get('test') === 'true'
    
    let userId: string
    
    if (isTestMode) {
      // テストモードの場合は仮のユーザーIDを使用
      userId = 'test-user-' + Date.now()
      console.log('Test mode enabled, using temporary userId:', userId)
    } else {
      // 通常モード：現在のユーザーを取得
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.redirect(new URL('/login?error=not_authenticated', baseUrl))
      }
      
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (userError || !userData) {
        return NextResponse.redirect(new URL('/dashboard/settings?error=user_not_found', baseUrl))
      }
      
      userId = userData.id
    }
    
    // OAuth 1.0a認証リンクを生成
    const authData = await twitterOAuth1Service.generateAuthLink()
    
    console.log('OAuth 1.0a auth initiated:', {
      userId: userId,
      oauth_token: authData.oauth_token,
      redirect_url: authData.url
    })
    
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
    
    response.cookies.set('twitter_user_id', userId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10分
      path: '/'
    })
    
    return response
    
  } catch (error: any) {
    console.error('Twitter OAuth 1.0a init error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=oauth_init_failed&message=${encodeURIComponent(error.message)}`, baseUrl)
    )
  }
}