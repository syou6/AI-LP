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
      .select(`
        twitter_access_token,
        twitter_refresh_token,
        twitter_token_expires_at,
        twitter_user_id
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      )
    }

    if (!userData.twitter_access_token || !userData.twitter_user_id) {
      return NextResponse.json(
        { error: 'Twitter account not connected' },
        { status: 400 }
      )
    }

    // Check if token needs refresh
    let accessToken = userData.twitter_access_token
    
    if (userData.twitter_token_expires_at) {
      const expiresAt = new Date(userData.twitter_token_expires_at)
      const now = new Date()
      
      if (now >= expiresAt && userData.twitter_refresh_token) {
        try {
          const refreshedTokens = await twitterService.refreshToken(userData.twitter_refresh_token)
          
          await supabase
            .from('users')
            .update({
              twitter_access_token: refreshedTokens.access_token,
              twitter_refresh_token: refreshedTokens.refresh_token,
              twitter_token_expires_at: refreshedTokens.expires_at,
            })
            .eq('id', user.id)

          accessToken = refreshedTokens.access_token
        } catch (refreshError) {
          console.error('Failed to refresh Twitter token:', refreshError)
          return NextResponse.json(
            { error: 'Twitter token expired and refresh failed' },
            { status: 401 }
          )
        }
      }
    }

    // Get account metrics from Twitter
    try {
      const accountMetrics = await twitterService.getAccountMetrics(accessToken, userData.twitter_user_id)
      
      // Save metrics to database
      const { error: insertError } = await supabase
        .from('account_analytics')
        .insert({
          user_id: user.id,
          followers_count: accountMetrics.followers_count,
          following_count: accountMetrics.following_count,
          tweets_count: accountMetrics.tweets_count,
          listed_count: accountMetrics.listed_count,
          synced_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error saving account analytics:', insertError)
      }

      // Get historical data from database
      const { data: historicalData, error: historyError } = await supabase
        .from('account_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('synced_at', { ascending: false })
        .limit(30) // Last 30 records

      if (historyError) {
        console.error('Error fetching historical data:', historyError)
      }

      // Calculate growth metrics
      let followerGrowth = 0
      let tweetGrowth = 0

      if (historicalData && historicalData.length > 1) {
        const latest = historicalData[0]
        const previous = historicalData[1]
        
        followerGrowth = latest.followers_count - previous.followers_count
        tweetGrowth = latest.tweets_count - previous.tweets_count
      }

      return NextResponse.json({
        success: true,
        current_metrics: {
          followers_count: accountMetrics.followers_count,
          following_count: accountMetrics.following_count,
          tweets_count: accountMetrics.tweets_count,
          listed_count: accountMetrics.listed_count,
        },
        growth_metrics: {
          follower_growth: followerGrowth,
          tweet_growth: tweetGrowth,
        },
        historical_data: historicalData || [],
        synced_at: new Date().toISOString(),
      })

    } catch (error: any) {
      console.error('Error fetching Twitter account metrics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch account metrics' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Account analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account analytics' },
      { status: 500 }
    )
  }
}