import crypto from 'crypto'
import { TwitterApi } from 'twitter-api-v2'
import { TwitterAuthData, TwitterPostResponse, TwitterMetrics } from '@/types/database'

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || ''
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || ''
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/twitter/callback`

export class TwitterService {
  private static instance: TwitterService
  
  private constructor() {}

  public static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService()
    }
    return TwitterService.instance
  }

  // Generate PKCE code verifier and challenge
  private generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    
    return { codeVerifier, codeChallenge }
  }

  // Generate OAuth 2.0 authorization URL
  public generateAuthUrl(state: string): { url: string; codeVerifier: string } {
    const { codeVerifier, codeChallenge } = this.generatePKCE()
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
    
    return { url, codeVerifier }
  }

  // Exchange authorization code for access token
  public async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<TwitterAuthData> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: TWITTER_CLIENT_ID,
      client_secret: TWITTER_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    })

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const data = await response.json()
    
    // Get user info
    const userInfo = await this.getUserInfo(data.access_token)
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      user_id: userInfo.id,
      username: userInfo.username,
    }
  }

  // Refresh access token
  public async refreshToken(refreshToken: string): Promise<TwitterAuthData> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: TWITTER_CLIENT_ID,
      client_secret: TWITTER_CLIENT_SECRET,
      refresh_token: refreshToken,
    })

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    const data = await response.json()
    
    // Get user info with new token
    const userInfo = await this.getUserInfo(data.access_token)
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      user_id: userInfo.id,
      username: userInfo.username,
    }
  }

  // Get user information
  private async getUserInfo(accessToken: string): Promise<{ id: string; username: string }> {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user info')
    }

    const data = await response.json()
    return {
      id: data.data.id,
      username: data.data.username,
    }
  }

  // Create Twitter client
  private createClient(accessToken: string): TwitterApi {
    return new TwitterApi(accessToken)
  }

  // Post a tweet
  public async postTweet(
    accessToken: string,
    content: string,
    mediaIds?: string[]
  ): Promise<TwitterPostResponse> {
    const client = this.createClient(accessToken)
    
    const tweetData: any = {
      text: content,
    }

    if (mediaIds && mediaIds.length > 0) {
      tweetData.media = {
        media_ids: mediaIds,
      }
    }

    try {
      const response = await client.v2.tweet(tweetData)
      return {
        data: {
          id: response.data.id,
          text: response.data.text,
        },
      }
    } catch (error: any) {
      console.error('Tweet posting error:', error)
      throw new Error(`Failed to post tweet: ${error.message}`)
    }
  }

  // Get tweet metrics
  public async getTweetMetrics(
    accessToken: string,
    tweetId: string
  ): Promise<TwitterMetrics> {
    const client = this.createClient(accessToken)
    
    try {
      const response = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'non_public_metrics', 'organic_metrics'],
      })

      const metrics = response.data.public_metrics || {} as any
      const nonPublicMetrics = response.data.non_public_metrics || {} as any
      const organicMetrics = response.data.organic_metrics || {} as any

      return {
        impressions: organicMetrics.impression_count || nonPublicMetrics.impression_count || 0,
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        quotes: metrics.quote_count || 0,
        bookmarks: metrics.bookmark_count || 0,
        url_link_clicks: organicMetrics.url_link_clicks || 0,
        user_profile_clicks: organicMetrics.user_profile_clicks || 0,
      }
    } catch (error: any) {
      console.error('Error fetching tweet metrics:', error)
      return {
        impressions: 0,
        likes: 0,
        retweets: 0,
        replies: 0,
        quotes: 0,
        bookmarks: 0,
        url_link_clicks: 0,
        user_profile_clicks: 0,
      }
    }
  }

  // Get user account metrics
  public async getAccountMetrics(accessToken: string, userId: string) {
    const client = this.createClient(accessToken)
    
    try {
      const response = await client.v2.user(userId, {
        'user.fields': ['public_metrics'],
      })

      const metrics = response.data.public_metrics || {}

      return {
        followers_count: metrics.followers_count || 0,
        following_count: metrics.following_count || 0,
        tweets_count: metrics.tweet_count || 0,
        listed_count: metrics.listed_count || 0,
      }
    } catch (error: any) {
      console.error('Error fetching account metrics:', error)
      return {
        followers_count: 0,
        following_count: 0,
        tweets_count: 0,
        listed_count: 0,
      }
    }
  }

  // Upload media (for images/videos)
  public async uploadMedia(accessToken: string, mediaBuffer: Buffer, mediaType: string): Promise<string> {
    const client = this.createClient(accessToken)
    
    try {
      const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType: mediaType })
      return mediaId
    } catch (error: any) {
      console.error('Media upload error:', error)
      throw new Error(`Failed to upload media: ${error.message}`)
    }
  }

  // Validate token
  public async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken)
      return true
    } catch {
      return false
    }
  }
}

export const twitterService = TwitterService.getInstance()