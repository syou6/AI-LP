import { TwitterApi } from 'twitter-api-v2'
import { TwitterAuthData } from '@/types/database'

// OAuth 1.0a用の環境変数
const API_KEY = process.env.TWITTER_API_KEY || process.env.TWITTER_CLIENT_ID || ''
const API_SECRET = process.env.TWITTER_API_SECRET || process.env.TWITTER_CLIENT_SECRET || ''
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-lp-yrhn.vercel.app'}/api/auth/twitter-oauth1/callback`

export class TwitterOAuth1Service {
  private static instance: TwitterOAuth1Service
  
  private constructor() {}

  public static getInstance(): TwitterOAuth1Service {
    if (!TwitterOAuth1Service.instance) {
      TwitterOAuth1Service.instance = new TwitterOAuth1Service()
    }
    return TwitterOAuth1Service.instance
  }

  // OAuth 1.0a認証リンクを生成
  public async generateAuthLink(): Promise<{ url: string; oauth_token: string; oauth_token_secret: string }> {
    const client = new TwitterApi({
      appKey: API_KEY,
      appSecret: API_SECRET,
    })

    try {
      const authLink = await client.generateAuthLink(CALLBACK_URL, {
        linkMode: 'authorize', // 'authenticate'より厳格
      })

      console.log('OAuth 1.0a auth link generated:', {
        url: authLink.url,
        oauth_token: authLink.oauth_token,
        callback_url: CALLBACK_URL,
      })

      return {
        url: authLink.url,
        oauth_token: authLink.oauth_token,
        oauth_token_secret: authLink.oauth_token_secret,
      }
    } catch (error: any) {
      console.error('Failed to generate auth link:', error)
      throw new Error(`Auth link generation failed: ${error.message}`)
    }
  }

  // アクセストークンとシークレットを取得
  public async getAccessToken(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string
  ): Promise<TwitterAuthData> {
    const client = new TwitterApi({
      appKey: API_KEY,
      appSecret: API_SECRET,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    })

    try {
      const { client: loggedClient, accessToken, accessSecret } = await client.login(oauth_verifier)
      
      // ユーザー情報を取得
      const user = await loggedClient.v2.me()

      console.log('OAuth 1.0a login successful:', {
        userId: user.data.id,
        username: user.data.username,
      })

      return {
        access_token: accessToken,
        refresh_token: accessSecret, // OAuth 1.0aではaccess_secretをrefresh_tokenとして保存
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // OAuth 1.0aトークンは無期限
        user_id: user.data.id,
        username: user.data.username,
      }
    } catch (error: any) {
      console.error('Failed to get access token:', error)
      throw new Error(`Access token retrieval failed: ${error.message}`)
    }
  }

  // Twitter APIクライアントを作成
  public createClient(accessToken: string, accessSecret: string): TwitterApi {
    return new TwitterApi({
      appKey: API_KEY,
      appSecret: API_SECRET,
      accessToken: accessToken,
      accessSecret: accessSecret,
    })
  }

  // ツイートを投稿
  public async postTweet(
    accessToken: string,
    accessSecret: string,
    content: string,
    mediaIds?: string[]
  ) {
    const client = this.createClient(accessToken, accessSecret)
    
    try {
      const tweetData: any = {
        text: content,
      }

      if (mediaIds && mediaIds.length > 0) {
        tweetData.media = {
          media_ids: mediaIds,
        }
      }

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

  // ツイートのメトリクスを取得
  public async getTweetMetrics(
    accessToken: string,
    accessSecret: string,
    tweetId: string
  ) {
    const client = this.createClient(accessToken, accessSecret)
    
    try {
      const response = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics'],
      })

      const metrics = response.data.public_metrics || {}

      return {
        impressions: 0, // Free tierでは取得できない
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        quotes: metrics.quote_count || 0,
        bookmarks: metrics.bookmark_count || 0,
        url_link_clicks: 0, // Free tierでは取得できない
        user_profile_clicks: 0, // Free tierでは取得できない
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

  // アカウントメトリクスを取得
  public async getAccountMetrics(
    accessToken: string,
    accessSecret: string,
    userId: string
  ) {
    const client = this.createClient(accessToken, accessSecret)
    
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

  // メディアのアップロード
  public async uploadMedia(
    accessToken: string,
    accessSecret: string,
    mediaBuffer: Buffer,
    mediaType: string
  ): Promise<string> {
    const client = this.createClient(accessToken, accessSecret)
    
    try {
      const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType: mediaType })
      return mediaId
    } catch (error: any) {
      console.error('Media upload error:', error)
      throw new Error(`Failed to upload media: ${error.message}`)
    }
  }

  // トークンの検証
  public async validateToken(accessToken: string, accessSecret: string): Promise<boolean> {
    try {
      const client = this.createClient(accessToken, accessSecret)
      await client.v2.me()
      return true
    } catch {
      return false
    }
  }
}

export const twitterOAuth1Service = TwitterOAuth1Service.getInstance()