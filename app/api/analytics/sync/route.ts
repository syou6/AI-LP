import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterService } from '@/lib/twitter-service'

// This endpoint syncs Twitter metrics for published posts
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { post_id } = body

    if (post_id) {
      // Sync specific post
      const result = await syncSinglePost(supabase, user.id, post_id)
      return NextResponse.json(result)
    } else {
      // Sync all user's published posts that haven't been synced recently
      const result = await syncUserPosts(supabase, user.id)
      return NextResponse.json(result)
    }

  } catch (error: any) {
    console.error('Analytics sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync analytics' },
      { status: 500 }
    )
  }
}

// Cron job endpoint (protected by Vercel cron secret)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createRouteClient()
    
    // Get all users with Twitter connections who have published posts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        twitter_access_token,
        twitter_refresh_token,
        twitter_token_expires_at,
        twitter_user_id
      `)
      .not('twitter_access_token', 'is', null)
      .not('twitter_user_id', 'is', null)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    const results = {
      users_processed: 0,
      posts_synced: 0,
      errors: 0,
    }

    for (const user of users || []) {
      try {
        const syncResult = await syncUserPosts(supabase, user.id)
        results.users_processed++
        results.posts_synced += syncResult.synced || 0
        if (!syncResult.success) {
          results.errors++
        }
      } catch (error) {
        console.error(`Error syncing user ${user.id}:`, error)
        results.errors++
      }

      // Add delay between users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return NextResponse.json({
      success: true,
      results,
    })

  } catch (error: any) {
    console.error('Cron analytics sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync analytics' },
      { status: 500 }
    )
  }
}

async function syncSinglePost(supabase: any, userId: string, postId: string) {
  try {
    // Get the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('twitter_post_id', 'is', null)
      .single()

    if (postError || !post) {
      return { success: false, error: 'Post not found or not published' }
    }

    // Get user's Twitter credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        twitter_access_token,
        twitter_refresh_token,
        twitter_token_expires_at
      `)
      .eq('id', userId)
      .single()

    if (userError || !userData?.twitter_access_token) {
      return { success: false, error: 'Twitter credentials not found' }
    }

    // Check token expiry and refresh if needed
    let accessToken = userData.twitter_access_token
    
    if (userData.twitter_token_expires_at) {
      const expiresAt = new Date(userData.twitter_token_expires_at)
      const now = new Date()
      
      if (now >= expiresAt && userData.twitter_refresh_token) {
        const refreshedTokens = await twitterService.refreshToken(userData.twitter_refresh_token)
        
        await supabase
          .from('users')
          .update({
            twitter_access_token: refreshedTokens.access_token,
            twitter_refresh_token: refreshedTokens.refresh_token,
            twitter_token_expires_at: refreshedTokens.expires_at,
          })
          .eq('id', userId)

        accessToken = refreshedTokens.access_token
      }
    }

    // Get metrics from Twitter
    const metrics = await twitterService.getTweetMetrics(accessToken, post.twitter_post_id)
    
    // Calculate engagement rate
    const totalEngagements = metrics.likes + metrics.retweets + metrics.replies + 
      metrics.quotes + metrics.bookmarks
    const engagementRate = metrics.impressions > 0 
      ? (totalEngagements / metrics.impressions) * 100 
      : 0

    // Check if analytics record exists
    const { data: existingAnalytics } = await supabase
      .from('analytics')
      .select('id')
      .eq('post_id', postId)
      .single()

    if (existingAnalytics) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('analytics')
        .update({
          impressions: metrics.impressions,
          likes: metrics.likes,
          retweets: metrics.retweets,
          replies: metrics.replies,
          quotes: metrics.quotes,
          bookmarks: metrics.bookmarks,
          url_link_clicks: metrics.url_link_clicks,
          user_profile_clicks: metrics.user_profile_clicks,
          engagement_rate: engagementRate,
          synced_at: new Date().toISOString(),
        })
        .eq('id', existingAnalytics.id)

      if (updateError) {
        console.error('Error updating analytics:', updateError)
        return { success: false, error: 'Failed to update analytics' }
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('analytics')
        .insert({
          post_id: postId,
          user_id: userId,
          impressions: metrics.impressions,
          likes: metrics.likes,
          retweets: metrics.retweets,
          replies: metrics.replies,
          quotes: metrics.quotes,
          bookmarks: metrics.bookmarks,
          url_link_clicks: metrics.url_link_clicks,
          user_profile_clicks: metrics.user_profile_clicks,
          engagement_rate: engagementRate,
          synced_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error inserting analytics:', insertError)
        return { success: false, error: 'Failed to create analytics' }
      }
    }

    return { 
      success: true, 
      synced: 1,
      metrics: {
        impressions: metrics.impressions,
        engagements: totalEngagements,
        engagement_rate: engagementRate,
      }
    }

  } catch (error: any) {
    console.error('Error syncing single post:', error)
    return { success: false, error: error.message }
  }
}

async function syncUserPosts(supabase: any, userId: string) {
  try {
    // Get posts that need syncing (published posts that haven't been synced in the last hour)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        twitter_post_id,
        published_at
      `)
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('twitter_post_id', 'is', null)
      .limit(50) // Limit to avoid overwhelming the API

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return { success: false, error: 'Failed to fetch posts' }
    }

    if (!posts || posts.length === 0) {
      return { success: true, synced: 0 }
    }

    // Filter posts that need syncing
    const { data: existingAnalytics } = await supabase
      .from('analytics')
      .select('post_id, synced_at')
      .eq('user_id', userId)
      .in('post_id', posts.map((p: any) => p.id))

    const analyticsMap = new Map(
      existingAnalytics?.map((a: any) => [a.post_id, new Date(a.synced_at)]) || []
    )

    const postsToSync = posts.filter((post: any) => {
      const lastSynced = analyticsMap.get(post.id)
      return !lastSynced || lastSynced < oneHourAgo
    })

    let syncedCount = 0
    
    for (const post of postsToSync) {
      try {
        const result = await syncSinglePost(supabase, userId, post.id)
        if (result.success) {
          syncedCount++
        }
      } catch (error) {
        console.error(`Error syncing post ${post.id}:`, error)
      }

      // Small delay between posts
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return { 
      success: true, 
      synced: syncedCount,
      total_posts: posts.length,
    }

  } catch (error: any) {
    console.error('Error syncing user posts:', error)
    return { success: false, error: error.message }
  }
}