import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 環境変数をチェック
    const apiKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CLIENT_ID || ''
    const apiSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CLIENT_SECRET || ''
    const callbackUrl = process.env.TWITTER_CALLBACK_URL || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'}/api/auth/twitter-oauth1/callback`

    // OAuth 1.0a用のリクエストトークンを手動で取得
    const oauthTimestamp = Math.floor(Date.now() / 1000).toString()
    const oauthNonce = Math.random().toString(36).substring(2, 15)
    
    // OAuth 1.0aパラメータ
    const oauthParams = {
      oauth_callback: encodeURIComponent(callbackUrl),
      oauth_consumer_key: apiKey,
      oauth_nonce: oauthNonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: oauthTimestamp,
      oauth_version: '1.0'
    }

    // シグネチャベースストリングを作成
    const paramString = Object.keys(oauthParams)
      .sort()
      .map(key => `${key}=${oauthParams[key as keyof typeof oauthParams]}`)
      .join('&')

    const signatureBaseString = [
      'POST',
      encodeURIComponent('https://api.twitter.com/oauth/request_token'),
      encodeURIComponent(paramString)
    ].join('&')

    // HMAC-SHA1でシグネチャを生成
    const crypto = require('crypto')
    const signingKey = `${encodeURIComponent(apiSecret)}&`
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBaseString)
      .digest('base64')

    // Authorizationヘッダーを作成
    const authHeader = 'OAuth ' + [
      `oauth_callback="${encodeURIComponent(callbackUrl)}"`,
      `oauth_consumer_key="${apiKey}"`,
      `oauth_nonce="${oauthNonce}"`,
      `oauth_signature="${encodeURIComponent(signature)}"`,
      `oauth_signature_method="HMAC-SHA1"`,
      `oauth_timestamp="${oauthTimestamp}"`,
      `oauth_version="1.0"`
    ].join(', ')

    console.log('Debug OAuth 1.0a request:', {
      apiKey: apiKey.substring(0, 10) + '...',
      callbackUrl,
      authHeader: authHeader.substring(0, 50) + '...'
    })

    // Twitter OAuth 1.0a request_tokenエンドポイントを呼び出す
    const response = await fetch('https://api.twitter.com/oauth/request_token', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'OAuth 1.0a request failed',
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        debug: {
          apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
          apiKeyLength: apiKey.length,
          apiSecretSet: !!apiSecret,
          callbackUrl,
          authHeaderPreview: authHeader.substring(0, 100) + '...'
        }
      }, { status: 500 })
    }

    // レスポンスをパース
    const params = new URLSearchParams(responseText)
    const oauthToken = params.get('oauth_token')
    const oauthTokenSecret = params.get('oauth_token_secret')
    const oauthCallbackConfirmed = params.get('oauth_callback_confirmed')

    return NextResponse.json({
      success: true,
      message: 'OAuth 1.0a request token obtained successfully',
      data: {
        oauth_token: oauthToken,
        oauth_token_secret: oauthTokenSecret ? '***hidden***' : null,
        oauth_callback_confirmed: oauthCallbackConfirmed,
        auth_url: `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`
      },
      debug: {
        apiKey: apiKey.substring(0, 10) + '...',
        callbackUrl
      }
    })

  } catch (error: any) {
    console.error('Debug test error:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}