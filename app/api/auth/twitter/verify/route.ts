import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterService } from '@/lib/twitter-service'

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

    // Get user's Twitter credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('twitter_user_id, twitter_username, twitter_access_token, twitter_token_expires_at')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { connected: false, error: 'User data not found' },
        { status: 404 }
      )
    }

    // Check if user has Twitter credentials
    if (!userData.twitter_access_token || !userData.twitter_user_id) {
      return NextResponse.json({ connected: false })
    }

    // Check if token is still valid
    const isValid = await twitterService.validateToken(userData.twitter_access_token)
    
    if (!isValid) {
      // Try to refresh the token if it's expired
      if (userData.twitter_token_expires_at) {
        const expiresAt = new Date(userData.twitter_token_expires_at)
        const now = new Date()
        
        if (now >= expiresAt) {
          return NextResponse.json({ 
            connected: false, 
            expired: true,
            error: 'Token expired' 
          })
        }
      }
      
      return NextResponse.json({ 
        connected: false, 
        error: 'Invalid token' 
      })
    }

    return NextResponse.json({
      connected: true,
      twitter_user_id: userData.twitter_user_id,
      twitter_username: userData.twitter_username,
    })

  } catch (error: any) {
    console.error('Twitter verification error:', error)
    return NextResponse.json(
      { connected: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Remove Twitter credentials from user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        twitter_user_id: null,
        twitter_username: null,
        twitter_access_token: null,
        twitter_refresh_token: null,
        twitter_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error disconnecting Twitter:', updateError)
      return NextResponse.json(
        { error: 'Failed to disconnect Twitter' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Twitter disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter' },
      { status: 500 }
    )
  }
}