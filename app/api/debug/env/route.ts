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

    // Check environment variables (without exposing actual values)
    const envStatus = {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 設定済み' : '❌ 未設定',
      
      // Twitter
      TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID ? '✅ 設定済み' : '❌ 未設定',
      TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET ? '✅ 設定済み' : '❌ 未設定',
      TWITTER_REDIRECT_URI: process.env.TWITTER_REDIRECT_URI || '自動設定',
      
      // App
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app',
      
      // Others
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ 設定済み' : '❌ 未設定',
      CRON_SECRET: process.env.CRON_SECRET ? '✅ 設定済み' : '❌ 未設定',
      
      // Runtime
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || 'ローカル',
    }

    // Twitter API設定の詳細チェック
    const twitterConfigDetails = {
      clientIdLength: process.env.TWITTER_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.TWITTER_CLIENT_SECRET?.length || 0,
      redirectUri: process.env.TWITTER_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'}/api/auth/twitter/callback`,
    }

    return NextResponse.json({
      status: 'OK',
      environment: envStatus,
      twitterConfig: twitterConfigDetails,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug endpoint failed' },
      { status: 500 }
    )
  }
}