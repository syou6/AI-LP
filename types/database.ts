export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          twitter_user_id: string | null
          twitter_username: string | null
          twitter_access_token: string | null
          twitter_refresh_token: string | null
          twitter_token_expires_at: string | null
          subscription_tier: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          twitter_user_id?: string | null
          twitter_username?: string | null
          twitter_access_token?: string | null
          twitter_refresh_token?: string | null
          twitter_token_expires_at?: string | null
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          twitter_user_id?: string | null
          twitter_username?: string | null
          twitter_access_token?: string | null
          twitter_refresh_token?: string | null
          twitter_token_expires_at?: string | null
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_audience: string | null
          brand_voice: string | null
          hashtags: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_audience?: string | null
          brand_voice?: string | null
          hashtags?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_audience?: string | null
          brand_voice?: string | null
          hashtags?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          content: string
          status: PostStatus
          twitter_post_id: string | null
          media_urls: string[] | null
          hashtags: string[] | null
          scheduled_for: string | null
          published_at: string | null
          ai_prompt: string | null
          variation_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          content: string
          status?: PostStatus
          twitter_post_id?: string | null
          media_urls?: string[] | null
          hashtags?: string[] | null
          scheduled_for?: string | null
          published_at?: string | null
          ai_prompt?: string | null
          variation_number?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string | null
          content?: string
          status?: PostStatus
          twitter_post_id?: string | null
          media_urls?: string[] | null
          hashtags?: string[] | null
          scheduled_for?: string | null
          published_at?: string | null
          ai_prompt?: string | null
          variation_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          post_id: string
          user_id: string
          impressions: number
          likes: number
          retweets: number
          replies: number
          quotes: number
          bookmarks: number
          url_link_clicks: number
          user_profile_clicks: number
          engagement_rate: number
          synced_at: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          impressions?: number
          likes?: number
          retweets?: number
          replies?: number
          quotes?: number
          bookmarks?: number
          url_link_clicks?: number
          user_profile_clicks?: number
          engagement_rate?: number
          synced_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          impressions?: number
          likes?: number
          retweets?: number
          replies?: number
          quotes?: number
          bookmarks?: number
          url_link_clicks?: number
          user_profile_clicks?: number
          engagement_rate?: number
          synced_at?: string
          created_at?: string
        }
      }
      account_analytics: {
        Row: {
          id: string
          user_id: string
          followers_count: number
          following_count: number
          tweets_count: number
          listed_count: number
          total_impressions: number
          total_engagements: number
          synced_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          followers_count?: number
          following_count?: number
          tweets_count?: number
          listed_count?: number
          total_impressions?: number
          total_engagements?: number
          synced_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          followers_count?: number
          following_count?: number
          tweets_count?: number
          listed_count?: number
          total_impressions?: number
          total_engagements?: number
          synced_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_posts_with_analytics: {
        Args: {
          user_uuid: string
        }
        Returns: {
          post_id: string
          content: string
          status: PostStatus
          published_at: string | null
          impressions: number
          likes: number
          retweets: number
          replies: number
          engagement_rate: number
        }[]
      }
      get_dashboard_stats: {
        Args: {
          user_uuid: string
        }
        Returns: {
          total_posts: number
          published_posts: number
          scheduled_posts: number
          total_impressions: number
          total_engagements: number
          avg_engagement_rate: number
        }
      }
    }
    Enums: {
      post_status: PostStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

export type Analytics = Database['public']['Tables']['analytics']['Row']
export type AnalyticsInsert = Database['public']['Tables']['analytics']['Insert']
export type AnalyticsUpdate = Database['public']['Tables']['analytics']['Update']

export type AccountAnalytics = Database['public']['Tables']['account_analytics']['Row']
export type AccountAnalyticsInsert = Database['public']['Tables']['account_analytics']['Insert']
export type AccountAnalyticsUpdate = Database['public']['Tables']['account_analytics']['Update']

// Extended types with relations
export type PostWithAnalytics = Post & {
  analytics?: Analytics
  product?: Product
}

export type ProductWithPosts = Product & {
  posts?: Post[]
}

// API Response types
export interface DashboardStats {
  total_posts: number
  published_posts: number
  scheduled_posts: number
  total_impressions: number
  total_engagements: number
  avg_engagement_rate: number
}

export interface TwitterAuthData {
  access_token: string
  refresh_token: string
  expires_at: string
  user_id: string
  username: string
}

export interface TwitterPostResponse {
  data: {
    id: string
    text: string
  }
}

export interface TwitterMetrics {
  impressions: number
  likes: number
  retweets: number
  replies: number
  quotes: number
  bookmarks: number
  url_link_clicks: number
  user_profile_clicks: number
}

export interface AIContentVariation {
  content: string
  variation_number: number
  hashtags: string[]
}

export interface ContentGenerationRequest {
  product_id?: string
  prompt?: string
  brand_voice?: string
  target_audience?: string
  hashtags?: string[]
}