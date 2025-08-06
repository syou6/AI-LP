import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterService } from '@/lib/twitter-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { searchParams } = new URL(request.url)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    
    // Get OAuth parameters
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // Check for OAuth errors
    if (error) {
      console.error('Twitter OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=oauth_denied', baseUrl)
      )
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_parameters', baseUrl)
      )
    }
    
    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get('twitter_oauth_state')?.value
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value
    const userId = request.cookies.get('twitter_user_id')?.value
    
    console.log('Callback verification:', {
      receivedState: state,
      storedState: storedState ? 'exists' : 'missing',
      codeVerifier: codeVerifier ? 'exists' : 'missing',
      userId: userId ? 'exists' : 'missing',
      stateMatch: storedState === state
    })
    
    if (!storedState || !codeVerifier || !userId || storedState !== state) {
      console.error('State verification failed:', {
        storedState: storedState || 'none',
        receivedState: state,
        hasCodeVerifier: !!codeVerifier,
        hasUserId: !!userId
      })
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=invalid_state', baseUrl)
      )
    }
    
    // Exchange code for tokens
    const tokenData = await twitterService.exchangeCodeForToken(code, codeVerifier)
    
    // Update user with Twitter credentials
    const { error: updateError } = await supabase
      .from('users')
      .update({
        twitter_user_id: tokenData.user_id,
        twitter_username: tokenData.username,
        twitter_access_token: tokenData.access_token,
        twitter_refresh_token: tokenData.refresh_token,
        twitter_token_expires_at: tokenData.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    
    if (updateError) {
      console.error('Error updating user with Twitter data:', updateError)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=database_error', baseUrl)
      )
    }
    
    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=twitter_connected', baseUrl)
    )
    
    response.cookies.delete('twitter_oauth_state')
    response.cookies.delete('twitter_code_verifier')
    response.cookies.delete('twitter_user_id')
    
    return response
    
  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'
    
    // より詳細なエラーメッセージを提供
    let errorParam = 'oauth_failed'
    if (error.message.includes('Token exchange failed')) {
      errorParam = 'token_exchange_failed'
    } else if (error.message.includes('database')) {
      errorParam = 'database_error'
    }
    
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${errorParam}&details=${encodeURIComponent(error.message)}`, baseUrl)
    )
  }
}