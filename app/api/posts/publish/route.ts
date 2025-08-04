import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { twitterService } from '@/lib/twitter-service'
import { schedulingService } from '@/lib/scheduling-service'

interface PublishRequest {
  content: string
  product_id?: string
  scheduled_for?: string // ISO string
  media_urls?: string[]
  hashtags?: string[]
  ai_prompt?: string
  publish_immediately?: boolean
}

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

    const body: PublishRequest = await request.json()
    
    // Validate request
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get user's Twitter credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        twitter_access_token,
        twitter_refresh_token,
        twitter_token_expires_at
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      )
    }

    if (!userData.twitter_access_token) {
      return NextResponse.json(
        { error: 'Twitter account not connected' },
        { status: 400 }
      )
    }

    // If scheduled_for is provided, schedule the post
    if (body.scheduled_for && !body.publish_immediately) {
      const scheduledFor = new Date(body.scheduled_for)
      const now = new Date()

      if (scheduledFor <= now) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }

      try {
        const postId = await schedulingService.schedulePost(
          user.id,
          body.content,
          scheduledFor,
          body.product_id,
          body.media_urls,
          body.hashtags,
          body.ai_prompt
        )

        return NextResponse.json({
          success: true,
          scheduled: true,
          post_id: postId,
          scheduled_for: body.scheduled_for,
        })
      } catch (error: any) {
        console.error('Error scheduling post:', error)
        return NextResponse.json(
          { error: 'Failed to schedule post' },
          { status: 500 }
        )
      }
    }

    // Publish immediately
    try {
      // Check if token needs refresh
      let accessToken = userData.twitter_access_token
      
      if (userData.twitter_token_expires_at) {
        const expiresAt = new Date(userData.twitter_token_expires_at)
        const now = new Date()
        
        if (now >= expiresAt && userData.twitter_refresh_token) {
          const refreshedTokens = await twitterService.refreshToken(userData.twitter_refresh_token)
          
          // Update user tokens
          await supabase
            .from('users')
            .update({
              twitter_access_token: refreshedTokens.access_token,
              twitter_refresh_token: refreshedTokens.refresh_token,
              twitter_token_expires_at: refreshedTokens.expires_at,
            })
            .eq('id', user.id)

          accessToken = refreshedTokens.access_token
        }
      }

      // Post to Twitter
      const twitterResponse = await twitterService.postTweet(
        accessToken,
        body.content,
        body.media_urls
      )

      // Save post to database
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          product_id: body.product_id || null,
          content: body.content,
          status: 'published',
          twitter_post_id: twitterResponse.data.id,
          media_urls: body.media_urls || null,
          hashtags: body.hashtags || null,
          ai_prompt: body.ai_prompt || null,
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (postError) {
        console.error('Error saving post to database:', postError)
        // Post was published to Twitter but failed to save to DB
        return NextResponse.json({
          success: true,
          published: true,
          twitter_post_id: twitterResponse.data.id,
          warning: 'Post published but failed to save to database',
        })
      }

      return NextResponse.json({
        success: true,
        published: true,
        post_id: post.id,
        twitter_post_id: twitterResponse.data.id,
        published_at: post.published_at,
      })

    } catch (error: any) {
      console.error('Error publishing post:', error)
      
      // Save as failed post in database
      try {
        await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            product_id: body.product_id || null,
            content: body.content,
            status: 'failed',
            media_urls: body.media_urls || null,
            hashtags: body.hashtags || null,
            ai_prompt: body.ai_prompt || null,
          })
      } catch (dbError) {
        console.error('Error saving failed post:', dbError)
      }

      return NextResponse.json(
        { error: `Failed to publish post: ${error.message}` },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Post publish error:', error)
    return NextResponse.json(
      { error: 'Failed to process publish request' },
      { status: 500 }
    )
  }
}