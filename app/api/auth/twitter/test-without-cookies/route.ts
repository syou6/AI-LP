import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Store state in database instead of cookies
    const state = Math.random().toString(36).substring(7)
    const codeVerifier = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    
    // Save to database
    const { error: dbError } = await supabase
      .from('twitter_auth_sessions')
      .insert({
        user_id: user.id,
        state: state,
        code_verifier: codeVerifier,
        created_at: new Date().toISOString(),
      })
    
    if (dbError) {
      // テーブルが存在しない場合は、Cookieなしで続行
      console.log('Database save skipped:', dbError)
    }

    const clientId = process.env.TWITTER_CLIENT_ID || ''
    const redirectUri = 'https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback'
    
    // シンプルなOAuth URL（PKCEなし）
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: state,
    })

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    
    // 直接リダイレクト
    return NextResponse.redirect(authUrl)
    
  } catch (error: any) {
    console.error('Twitter OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    )
  }
}