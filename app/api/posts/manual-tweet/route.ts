import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, hashtags = [] } = await request.json()
    
    // ハッシュタグを追加
    const fullContent = hashtags.length > 0 
      ? `${content}\n\n${hashtags.map((tag: string) => `#${tag}`).join(' ')}`
      : content
    
    // Twitter投稿用URLを作成（Web Intent）
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullContent)}`
    
    return NextResponse.json({
      success: true,
      content: fullContent,
      tweetUrl,
      message: "「Twitterで投稿」をクリックして投稿してください"
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to prepare tweet',
      message: error.message
    }, { status: 500 })
  }
}