import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET
  const redirectUri = process.env.TWITTER_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'}/api/auth/twitter/callback`
  
  return NextResponse.json({
    environment: {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET',
      clientSecret: clientSecret ? 'SET' : 'NOT SET',
      redirectUri: redirectUri,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app',
    },
    instructions: {
      step1: 'Twitter Developer Portalにアクセス: https://developer.twitter.com/en/apps',
      step2: 'アプリの設定を確認',
      step3: 'User authentication settingsで以下を確認:',
      oauth2_settings: {
        type: 'Web App, Automated App or Bot',
        callback_urls: [
          redirectUri,
          'https://ai-lp-yrhn.vercel.app/api/auth/twitter/callback',
          'http://localhost:3000/api/auth/twitter/callback'
        ],
        website_url: 'https://ai-lp-yrhn.vercel.app',
        permissions: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
      }
    },
    currentRedirectUri: redirectUri,
    cookies: {
      state: request.cookies.get('twitter_oauth_state')?.value || 'none',
      codeVerifier: request.cookies.get('twitter_code_verifier')?.value ? 'exists' : 'none',
      userId: request.cookies.get('twitter_user_id')?.value || 'none'
    }
  })
}