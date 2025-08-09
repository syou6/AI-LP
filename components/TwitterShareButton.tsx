'use client'

import { useState } from 'react'

interface TwitterShareButtonProps {
  content: string
  hashtags?: string[]
  onPostComplete?: (postId: string) => void
}

export default function TwitterShareButton({ 
  content, 
  hashtags = [],
  onPostComplete 
}: TwitterShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isPosted, setIsPosted] = useState(false)

  // ハッシュタグを含むフルコンテンツを作成
  const fullContent = hashtags.length > 0 
    ? `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    : content

  // クリップボードにコピー
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullContent)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Twitter投稿画面を開く
  const openTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullContent)}`
    window.open(tweetUrl, '_blank', 'width=550,height=420')
    
    // 投稿完了マークのボタンを表示
    setTimeout(() => {
      if (!isPosted) {
        const confirmed = window.confirm('Twitterに投稿しましたか？')
        if (confirmed) {
          markAsPosted()
        }
      }
    }, 3000)
  }

  // 投稿済みとしてマーク
  const markAsPosted = async () => {
    setIsPosted(true)
    
    // 投稿履歴をデータベースに保存
    const response = await fetch('/api/posts/mark-as-posted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: fullContent,
        posted_at: new Date().toISOString(),
        platform: 'twitter'
      })
    })

    if (response.ok) {
      const data = await response.json()
      if (onPostComplete) {
        onPostComplete(data.postId)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* コンテンツプレビュー */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">投稿内容：</p>
        <p className="whitespace-pre-wrap text-gray-800">{fullContent}</p>
        <p className="text-xs text-gray-500 mt-2">
          文字数: {fullContent.length} / 280
        </p>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isCopied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isCopied ? '✓ コピーしました' : '📋 コピー'}
        </button>

        <button
          onClick={openTwitter}
          disabled={isPosted}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isPosted
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isPosted ? '✓ 投稿済み' : '🐦 Twitterで投稿'}
        </button>

        {!isPosted && (
          <button
            onClick={markAsPosted}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            投稿済みにする
          </button>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className="text-sm text-gray-500">
        <p>💡 ヒント：</p>
        <ul className="list-disc list-inside ml-2">
          <li>「Twitterで投稿」をクリックすると投稿画面が開きます</li>
          <li>投稿後は「投稿済みにする」をクリックして記録してください</li>
          <li>投稿履歴は分析ページで確認できます</li>
        </ul>
      </div>
    </div>
  )
}