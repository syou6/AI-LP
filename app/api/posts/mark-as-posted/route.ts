import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { content, posted_at, platform } = await request.json()
    
    // 現在のユーザーを取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 投稿を記録
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userData.id,
        content: content,
        status: 'published',
        published_at: posted_at || new Date().toISOString(),
        // 手動投稿のため、twitter_post_idは null
        twitter_post_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (postError) {
      console.error('Error saving post:', postError)
      return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      postId: post.id,
      message: '投稿を記録しました'
    })
    
  } catch (error: any) {
    console.error('Mark as posted error:', error)
    return NextResponse.json({
      error: 'Failed to mark as posted',
      message: error.message
    }, { status: 500 })
  }
}