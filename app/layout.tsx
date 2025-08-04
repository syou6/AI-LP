import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Marketing Tool - Automate Your Social Media with AI',
  description: 'Generate engaging social media content with AI, schedule posts, and track analytics. Boost your marketing with automated Twitter content creation.',
  keywords: 'AI marketing, social media automation, Twitter marketing, content generation, social media scheduling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content="AI Marketing Tool - Automate Your Social Media" />
        <meta property="og:description" content="Generate engaging social media content with AI, schedule posts, and track analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Marketing Tool - Automate Your Social Media" />
        <meta name="twitter:description" content="Generate engaging social media content with AI, schedule posts, and track analytics." />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}