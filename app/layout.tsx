import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AIマーケティングツール - SNS運用を自動化',
  description: 'AIでTwitterコンテンツを自動生成。投稿のスケジューリングと詳細な分析でSNSマーケティングを効率化。無料で始められます。',
  keywords: 'AIマーケティング, SNS自動化, Twitter運用, コンテンツ生成, スケジュール投稿, SNS分析',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content="AIマーケティングツール - SNS運用を自動化" />
        <meta property="og:description" content="AIでTwitterコンテンツを自動生成。投稿のスケジューリングと詳細な分析でSNSマーケティングを効率化。" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AIマーケティングツール - SNS運用を自動化" />
        <meta name="twitter:description" content="AIでTwitterコンテンツを自動生成。投稿のスケジューリングと詳細な分析でSNSマーケティングを効率化。" />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}