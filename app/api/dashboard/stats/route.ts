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

    // Use the database function to get stats
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_dashboard_stats', { user_uuid: user.id })

    if (statsError) {
      console.error('Error fetching dashboard stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard stats' },
        { status: 500 }
      )
    }

    // Get recent posts activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentPosts, error: recentError } = await supabase
      .from('posts')
      .select('published_at, status')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (recentError) {
      console.error('Error fetching recent posts:', recentError)
    }

    // Group recent posts by day
    const dailyActivity: Record<string, { published: number; scheduled: number; draft: number }> = {}
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyActivity[dateStr] = { published: 0, scheduled: 0, draft: 0 }
    }

    recentPosts?.forEach(post => {
      let dateStr: string
      
      if (post.status === 'published' && post.published_at) {
        dateStr = new Date(post.published_at).toISOString().split('T')[0]
      } else {
        // For non-published posts, use creation date (we don't have created_at in select, so skip)
        return
      }

      if (dailyActivity[dateStr]) {
        if (post.status === 'published') {
          dailyActivity[dateStr].published++
        } else if (post.status === 'scheduled') {
          dailyActivity[dateStr].scheduled++
        } else if (post.status === 'draft') {
          dailyActivity[dateStr].draft++
        }
      }
    })

    const activityData = Object.entries(dailyActivity).map(([date, counts]) => ({
      date,
      ...counts,
    }))

    // Get upcoming scheduled posts
    const { data: upcomingPosts, error: upcomingError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        scheduled_for,
        products(name)
      `)
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(5)

    if (upcomingError) {
      console.error('Error fetching upcoming posts:', upcomingError)
    }

    // Get top performing posts (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: topPosts, error: topPostsError } = await supabase
      .from('analytics')
      .select(`
        engagement_rate,
        impressions,
        likes,
        retweets,
        posts(id, content, published_at)
      `)
      .eq('user_id', user.id)
      .gte('posts.published_at', thirtyDaysAgo.toISOString())
      .order('engagement_rate', { ascending: false })
      .limit(5)

    if (topPostsError) {
      console.error('Error fetching top posts:', topPostsError)
    }

    // Get user's Twitter connection status
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('twitter_username, twitter_user_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
    }

    return NextResponse.json({
      success: true,
      stats: statsData,
      activity: activityData,
      upcoming_posts: upcomingPosts || [],
      top_posts: topPosts || [],
      twitter_connected: !!(userProfile?.twitter_user_id),
      twitter_username: userProfile?.twitter_username,
    })

  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}