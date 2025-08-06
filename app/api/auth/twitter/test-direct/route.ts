import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Twitterの認証URLに直接リダイレクト
    const clientId = process.env.TWITTER_CLIENT_ID || ''
    const redirectUri = encodeURIComponent('https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback')
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: 'test123',
      code_challenge: 'challenge123',
      code_challenge_method: 'plain', // PKCEを一時的にplainに
    })

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    
    return NextResponse.redirect(authUrl)
    
  } catch (error: any) {
    console.error('Direct Twitter auth error:', error)
    return NextResponse.json(
      { error: 'Failed to redirect to Twitter' },
      { status: 500 }
    )
  }
}