-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  twitter_user_id VARCHAR(255),
  twitter_username VARCHAR(255),
  twitter_access_token TEXT,
  twitter_refresh_token TEXT,
  twitter_token_expires_at TIMESTAMP WITH TIME ZONE,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_audience TEXT,
  brand_voice TEXT,
  hashtags TEXT[], -- Array of hashtags
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status post_status DEFAULT 'draft',
  twitter_post_id VARCHAR(255),
  media_urls TEXT[],
  hashtags TEXT[],
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  ai_prompt TEXT,
  variation_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table for post metrics
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  quotes INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  url_link_clicks INTEGER DEFAULT 0,
  user_profile_clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create account analytics table for overall Twitter account metrics
CREATE TABLE public.account_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  tweets_count INTEGER DEFAULT 0,
  listed_count INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_product_id ON public.posts(product_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_for ON public.posts(scheduled_for);
CREATE INDEX idx_posts_published_at ON public.posts(published_at);
CREATE INDEX idx_analytics_post_id ON public.analytics(post_id);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_account_analytics_user_id ON public.account_analytics(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Users can view own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON public.analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Account analytics policies
CREATE POLICY "Users can view own account analytics" ON public.account_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own account analytics" ON public.account_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account analytics" ON public.account_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_posts_with_analytics(user_uuid UUID)
RETURNS TABLE (
  post_id UUID,
  content TEXT,
  status post_status,
  published_at TIMESTAMP WITH TIME ZONE,
  impressions INTEGER,
  likes INTEGER,
  retweets INTEGER,
  replies INTEGER,
  engagement_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.status,
    p.published_at,
    COALESCE(a.impressions, 0),
    COALESCE(a.likes, 0),
    COALESCE(a.retweets, 0),
    COALESCE(a.replies, 0),
    COALESCE(a.engagement_rate, 0)
  FROM public.posts p
  LEFT JOIN public.analytics a ON p.id = a.post_id
  WHERE p.user_id = user_uuid
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  total_posts INTEGER;
  published_posts INTEGER;
  scheduled_posts INTEGER;
  total_impressions INTEGER;
  total_engagements INTEGER;
  avg_engagement_rate DECIMAL;
BEGIN
  SELECT COUNT(*) INTO total_posts
  FROM public.posts
  WHERE user_id = user_uuid;

  SELECT COUNT(*) INTO published_posts
  FROM public.posts
  WHERE user_id = user_uuid AND status = 'published';

  SELECT COUNT(*) INTO scheduled_posts
  FROM public.posts
  WHERE user_id = user_uuid AND status = 'scheduled';

  SELECT 
    COALESCE(SUM(impressions), 0),
    COALESCE(SUM(likes + retweets + replies + quotes), 0),
    COALESCE(AVG(engagement_rate), 0)
  INTO total_impressions, total_engagements, avg_engagement_rate
  FROM public.analytics
  WHERE user_id = user_uuid;

  RETURN json_build_object(
    'total_posts', total_posts,
    'published_posts', published_posts,
    'scheduled_posts', scheduled_posts,
    'total_impressions', total_impressions,
    'total_engagements', total_engagements,
    'avg_engagement_rate', avg_engagement_rate
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;