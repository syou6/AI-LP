import { createRouteClient } from './supabase-server'
import { twitterService } from './twitter-service'
import { Post, PostUpdate } from '@/types/database'

export class SchedulingService {
  private static instance: SchedulingService

  private constructor() {}

  public static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService()
    }
    return SchedulingService.instance
  }

  // Get posts that are scheduled and ready to be published
  public async getPostsReadyForPublishing(): Promise<Post[]> {
    const supabase = createRouteClient()
    const now = new Date().toISOString()

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        users!inner(
          twitter_access_token,
          twitter_refresh_token,
          twitter_token_expires_at
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50) // Process in batches

    if (error) {
      console.error('Error fetching scheduled posts:', error)
      throw new Error('Failed to fetch scheduled posts')
    }

    return posts || []
  }

  // Publish a scheduled post
  public async publishScheduledPost(post: Post & { users: any }): Promise<boolean> {
    const supabase = createRouteClient()

    try {
      // Check if user has valid Twitter tokens
      const user = post.users
      if (!user.twitter_access_token) {
        await this.markPostAsFailed(post.id, 'No Twitter access token')
        return false
      }

      // Check if token is expired and refresh if needed
      let accessToken = user.twitter_access_token
      if (user.twitter_token_expires_at) {
        const expiresAt = new Date(user.twitter_token_expires_at)
        const now = new Date()
        
        if (now >= expiresAt && user.twitter_refresh_token) {
          try {
            const refreshedTokens = await twitterService.refreshToken(user.twitter_refresh_token)
            
            // Update user tokens in database
            await supabase
              .from('users')
              .update({
                twitter_access_token: refreshedTokens.access_token,
                twitter_refresh_token: refreshedTokens.refresh_token,
                twitter_token_expires_at: refreshedTokens.expires_at,
              })
              .eq('id', post.user_id)

            accessToken = refreshedTokens.access_token
          } catch (refreshError) {
            console.error('Failed to refresh Twitter token:', refreshError)
            await this.markPostAsFailed(post.id, 'Failed to refresh Twitter token')
            return false
          }
        }
      }

      // Post to Twitter
      const twitterResponse = await twitterService.postTweet(
        accessToken,
        post.content,
        post.media_urls || undefined
      )

      // Update post as published
      const updateData: PostUpdate = {
        status: 'published',
        twitter_post_id: twitterResponse.data.id,
        published_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)

      if (updateError) {
        console.error('Error updating post status:', updateError)
        return false
      }

      console.log(`Successfully published post ${post.id} to Twitter`)
      return true

    } catch (error: any) {
      console.error(`Error publishing post ${post.id}:`, error)
      await this.markPostAsFailed(post.id, error.message)
      return false
    }
  }

  // Mark a post as failed with error message
  private async markPostAsFailed(postId: string, errorMessage: string): Promise<void> {
    const supabase = createRouteClient()

    try {
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          // Store error in a hypothetical error_message field, or log it
        })
        .eq('id', postId)

      console.error(`Post ${postId} marked as failed: ${errorMessage}`)
    } catch (error) {
      console.error('Error marking post as failed:', error)
    }
  }

  // Process all scheduled posts (called by cron job)
  public async processScheduledPosts(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
    }

    try {
      const postsToPublish = await this.getPostsReadyForPublishing()
      results.processed = postsToPublish.length

      console.log(`Found ${postsToPublish.length} posts ready for publishing`)

      for (const post of postsToPublish) {
        try {
          const success = await this.publishScheduledPost(post as any)
          if (success) {
            results.successful++
          } else {
            results.failed++
          }
        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error)
          results.failed++
        }

        // Add a small delay between posts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`Processing complete: ${results.successful} successful, ${results.failed} failed`)
      return results

    } catch (error) {
      console.error('Error in processScheduledPosts:', error)
      throw error
    }
  }

  // Schedule a post for future publishing
  public async schedulePost(
    userId: string,
    content: string,
    scheduledFor: Date,
    productId?: string,
    mediaUrls?: string[],
    hashtags?: string[],
    aiPrompt?: string
  ): Promise<string> {
    const supabase = createRouteClient()

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        product_id: productId || null,
        content,
        status: 'scheduled',
        scheduled_for: scheduledFor.toISOString(),
        media_urls: mediaUrls || null,
        hashtags: hashtags || null,
        ai_prompt: aiPrompt || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error scheduling post:', error)
      throw new Error('Failed to schedule post')
    }

    return post.id
  }

  // Cancel a scheduled post
  public async cancelScheduledPost(postId: string, userId: string): Promise<boolean> {
    const supabase = createRouteClient()

    const { error } = await supabase
      .from('posts')
      .update({ status: 'draft' })
      .eq('id', postId)
      .eq('user_id', userId)
      .eq('status', 'scheduled')

    if (error) {
      console.error('Error canceling scheduled post:', error)
      return false
    }

    return true
  }

  // Get user's scheduled posts
  public async getUserScheduledPosts(userId: string): Promise<Post[]> {
    const supabase = createRouteClient()

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Error fetching user scheduled posts:', error)
      throw new Error('Failed to fetch scheduled posts')
    }

    return posts || []
  }

  // Reschedule a post
  public async reschedulePost(
    postId: string,
    userId: string,
    newScheduledFor: Date
  ): Promise<boolean> {
    const supabase = createRouteClient()

    const { error } = await supabase
      .from('posts')
      .update({ 
        scheduled_for: newScheduledFor.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', userId)
      .eq('status', 'scheduled')

    if (error) {
      console.error('Error rescheduling post:', error)
      return false
    }

    return true
  }

  // Get optimal posting times based on user's historical data
  public async getOptimalPostingTimes(userId: string): Promise<{
    bestHours: number[];
    bestDays: string[];
  }> {
    const supabase = createRouteClient()

    // This is a simplified version - in a real app you'd analyze engagement patterns
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select(`
        engagement_rate,
        posts!inner(published_at)
      `)
      .eq('user_id', userId)
      .not('posts.published_at', 'is', null)
      .order('engagement_rate', { ascending: false })
      .limit(100)

    if (error || !analytics || analytics.length === 0) {
      // Return default optimal times if no data available
      return {
        bestHours: [9, 12, 15, 18], // 9 AM, 12 PM, 3 PM, 6 PM
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
      }
    }

    // Analyze the data to find patterns
    const hourCounts: Record<number, { count: number; totalEngagement: number }> = {}
    const dayCounts: Record<string, { count: number; totalEngagement: number }> = {}

    analytics.forEach((item: any) => {
      if (item.posts?.published_at) {
        const publishedAt = new Date(item.posts.published_at)
        const hour = publishedAt.getHours()
        const day = publishedAt.toLocaleDateString('en-US', { weekday: 'long' })

        // Track hours
        if (!hourCounts[hour]) {
          hourCounts[hour] = { count: 0, totalEngagement: 0 }
        }
        hourCounts[hour].count++
        hourCounts[hour].totalEngagement += item.engagement_rate || 0

        // Track days
        if (!dayCounts[day]) {
          dayCounts[day] = { count: 0, totalEngagement: 0 }
        }
        dayCounts[day].count++
        dayCounts[day].totalEngagement += item.engagement_rate || 0
      }
    })

    // Get best hours (top 4)
    const bestHours = Object.entries(hourCounts)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgEngagement: data.totalEngagement / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 4)
      .map(item => item.hour)

    // Get best days (top 3)
    const bestDays = Object.entries(dayCounts)
      .map(([day, data]) => ({
        day,
        avgEngagement: data.totalEngagement / data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 3)
      .map(item => item.day)

    return {
      bestHours: bestHours.length > 0 ? bestHours : [9, 12, 15, 18],
      bestDays: bestDays.length > 0 ? bestDays : ['Tuesday', 'Wednesday', 'Thursday'],
    }
  }
}

export const schedulingService = SchedulingService.getInstance()