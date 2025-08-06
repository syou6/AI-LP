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

    // Get user's Twitter connection status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('twitter_user_id, twitter_username, twitter_token_expires_at')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({
        connected: false,
        error: 'User not found'
      })
    }

    // Check if Twitter is connected and token is not expired
    const connected = !!(
      userData.twitter_user_id && 
      userData.twitter_username &&
      userData.twitter_token_expires_at &&
      new Date(userData.twitter_token_expires_at) > new Date()
    )

    const expired = userData.twitter_token_expires_at && 
      new Date(userData.twitter_token_expires_at) <= new Date()

    return NextResponse.json({
      connected,
      twitter_user_id: userData.twitter_user_id,
      twitter_username: userData.twitter_username,
      expired
    })

  } catch (error: any) {
    console.error('Twitter verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify Twitter connection' },
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

    // Remove Twitter connection
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
      console.error('Error removing Twitter connection:', updateError)
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