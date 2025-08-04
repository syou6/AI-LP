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

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (postId) {
      // Get analytics for a specific post
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select(`
          *,
          posts(id, content, published_at, twitter_post_id)
        `)
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .order('synced_at', { ascending: false })
        .limit(1)

      if (analyticsError) {
        console.error('Error fetching post analytics:', analyticsError)
        return NextResponse.json(
          { error: 'Failed to fetch analytics' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        analytics: analytics?.[0] || null,
      })
    }

    // Get overall analytics for user's posts
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select(`
        *,
        posts(id, content, published_at, twitter_post_id, product_id)
      `)
      .eq('user_id', user.id)
      .gte('posts.published_at', dateFrom.toISOString())
      .order('posts.published_at', { ascending: false })
      .limit(limit)

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalPosts = analytics?.length || 0
    const totalImpressions = analytics?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0
    const totalEngagements = analytics?.reduce((sum, a) => 
      sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0) + (a.quotes || 0) + (a.bookmarks || 0), 0
    ) || 0
    const avgEngagementRate = totalPosts > 0 
      ? analytics?.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / totalPosts 
      : 0

    // Get top performing posts
    const topPosts = analytics
      ?.sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 5) || []

    // Group analytics by date for chart data
    const dailyStats: Record<string, {
      date: string
      impressions: number
      engagements: number
      posts: number
    }> = {}

    analytics?.forEach(item => {
      if (item.posts?.published_at) {
        const date = new Date(item.posts.published_at).toISOString().split('T')[0]
        
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            impressions: 0,
            engagements: 0,
            posts: 0,
          }
        }

        dailyStats[date].impressions += item.impressions || 0
        dailyStats[date].engagements += (item.likes || 0) + (item.retweets || 0) + 
          (item.replies || 0) + (item.quotes || 0) + (item.bookmarks || 0)
        dailyStats[date].posts += 1
      }
    })

    const chartData = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json({
      success: true,
      summary: {
        total_posts: totalPosts,
        total_impressions: totalImpressions,
        total_engagements: totalEngagements,
        avg_engagement_rate: Math.round(avgEngagementRate * 100) / 100,
      },
      analytics: analytics || [],
      top_posts: topPosts,
      chart_data: chartData,
      period_days: days,
    })

  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}