import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterOAuth1Service } from '@/lib/twitter-oauth1-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { searchParams } = new URL(request.url)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    
    // OAuth 1.0aのパラメータを取得
    const oauth_token = searchParams.get('oauth_token')
    const oauth_verifier = searchParams.get('oauth_verifier')
    const denied = searchParams.get('denied')
    
    // ユーザーが拒否した場合
    if (denied) {
      console.log('User denied Twitter OAuth access')
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=oauth_denied', baseUrl)
      )
    }
    
    if (!oauth_token || !oauth_verifier) {
      console.error('Missing OAuth parameters:', { oauth_token, oauth_verifier })
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_parameters', baseUrl)
      )
    }
    
    // Cookieから保存されたトークンを取得
    const storedToken = request.cookies.get('twitter_oauth_token')?.value
    const storedTokenSecret = request.cookies.get('twitter_oauth_token_secret')?.value
    const userId = request.cookies.get('twitter_user_id')?.value
    
    console.log('OAuth 1.0a callback verification:', {
      receivedToken: oauth_token,
      storedToken: storedToken ? 'exists' : 'missing',
      storedTokenSecret: storedTokenSecret ? 'exists' : 'missing',
      userId: userId ? 'exists' : 'missing',
      tokenMatch: storedToken === oauth_token
    })
    
    // トークンの検証
    if (!storedToken || !storedTokenSecret || !userId || storedToken !== oauth_token) {
      console.error('Token verification failed:', {
        storedToken: storedToken || 'none',
        receivedToken: oauth_token,
        hasTokenSecret: !!storedTokenSecret,
        hasUserId: !!userId
      })
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=invalid_token', baseUrl)
      )
    }
    
    // アクセストークンを取得
    const tokenData = await twitterOAuth1Service.getAccessToken(
      oauth_token,
      storedTokenSecret,
      oauth_verifier
    )
    
    console.log('Access token obtained:', {
      userId: tokenData.user_id,
      username: tokenData.username
    })
    
    // ユーザー情報をデータベースに保存
    const { error: updateError } = await supabase
      .from('users')
      .update({
        twitter_user_id: tokenData.user_id,
        twitter_username: tokenData.username,
        twitter_access_token: tokenData.access_token,
        twitter_refresh_token: tokenData.refresh_token, // OAuth 1.0aではaccess_secret
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error updating user with Twitter data:', updateError)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=database_error', baseUrl)
      )
    }
    
    // Cookieをクリア
    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=twitter_connected', baseUrl)
    )
    
    response.cookies.delete('twitter_oauth_token')
    response.cookies.delete('twitter_oauth_token_secret')
    response.cookies.delete('twitter_user_id')
    
    return response
    
  } catch (error: any) {
    console.error('Twitter OAuth 1.0a callback error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    
    let errorParam = 'oauth_failed'
    if (error.message.includes('Access token')) {
      errorParam = 'token_exchange_failed'
    } else if (error.message.includes('database')) {
      errorParam = 'database_error'
    }
    
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${errorParam}&details=${encodeURIComponent(error.message)}`, baseUrl)
    )
  }
}