import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterService } from '@/lib/twitter-service'
import crypto from 'crypto'

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

    // Check environment variables
    const clientId = process.env.TWITTER_CLIENT_ID
    const clientSecret = process.env.TWITTER_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      console.error('Twitter環境変数が設定されていません:', {
        clientId: clientId ? '設定済み' : '未設定',
        clientSecret: clientSecret ? '設定済み' : '未設定',
      })
      return NextResponse.json(
        { error: 'Twitter APIの設定が不完全です。環境変数を確認してください。' },
        { status: 500 }
      )
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')
    
    // Generate OAuth URL with PKCE
    const { url, codeVerifier } = twitterService.generateAuthUrl(state)
    
    console.log('Twitter OAuth URL生成成功:', url)
    
    // Store state and code verifier in cookies for verification
    const response = NextResponse.json(
      { url },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 600, // 10 minutes
      path: '/',
    })
    
    response.cookies.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 600, // 10 minutes
      path: '/',
    })
    
    response.cookies.set('twitter_user_id', user.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 600, // 10 minutes
      path: '/',
    })
    
    return response
    
  } catch (error: any) {
    console.error('Twitter OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    )
  }
}