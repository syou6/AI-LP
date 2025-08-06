import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // パラメータをJSONで表示
  return NextResponse.json({
    message: 'Twitter OAuth Callback received',
    params: {
      code: code ? `${code.substring(0, 10)}...` : null,
      state: state,
      error: error,
    },
    next_step: code ? 'codeパラメータを受け取りました。トークン交換が可能です。' : 'エラーが発生しました。',
    timestamp: new Date().toISOString(),
  })
}