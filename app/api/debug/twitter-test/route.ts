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

    // Test Twitter OAuth URL generation
    const clientId = process.env.TWITTER_CLIENT_ID
    const redirectUri = process.env.TWITTER_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'}/api/auth/twitter/callback`
    
    // Generate test OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access',
      state: 'test_state',
      code_challenge: 'test_challenge',
      code_challenge_method: 'S256',
    })

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    
    // Manually test the Twitter API endpoint
    let apiTestResult = {
      status: 'unknown',
      message: '',
    }

    try {
      // Test if we can reach Twitter's OAuth endpoint
      const testResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }).toString(),
      })

      apiTestResult = {
        status: testResponse.ok ? 'success' : 'failed',
        message: testResponse.ok 
          ? 'Twitter APIに正常に接続できました' 
          : `APIエラー: ${testResponse.status} ${testResponse.statusText}`,
      }

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        apiTestResult.message += ` - ${errorText}`
      }

    } catch (error: any) {
      apiTestResult = {
        status: 'error',
        message: `接続エラー: ${error.message}`,
      }
    }

    return NextResponse.json({
      status: 'OK',
      config: {
        clientId: clientId ? `設定済み (${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)})` : '未設定',
        redirectUri,
        scope: 'tweet.read tweet.write users.read offline.access',
      },
      authUrl,
      apiTest: apiTestResult,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Twitter test endpoint error:', error)
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error.message },
      { status: 500 }
    )
  }
}