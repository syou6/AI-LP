import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterService } from '@/lib/twitter-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { searchParams } = new URL(request.url)
    
    // Get OAuth parameters
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // Check for OAuth errors
    if (error) {
      console.error('Twitter OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=oauth_denied', request.url)
      )
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_parameters', request.url)
      )
    }
    
    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get('twitter_oauth_state')?.value
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value
    const userId = request.cookies.get('twitter_user_id')?.value
    
    if (!storedState || !codeVerifier || !userId || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=invalid_state', request.url)
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
        new URL('/dashboard/settings?error=database_error', request.url)
      )
    }
    
    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL('/dashboard/settings?success=twitter_connected', request.url)
    )
    
    response.cookies.delete('twitter_oauth_state')
    response.cookies.delete('twitter_code_verifier')
    response.cookies.delete('twitter_user_id')
    
    return response
    
  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=oauth_failed', request.url)
    )
  }
}