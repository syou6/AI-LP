#!/bin/bash

# Supabase
echo "NEXT_PUBLIC_SUPABASE_URL=https://jepczzqulgibekmulamg.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGN6enF1bGdpYmVrbXVsYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTgxMjQsImV4cCI6MjA2OTc5NDEyNH0.Hqdjn33nHC4i3ebASPjmII28r_RIgM4L8lKM8sQJFZk" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGN6enF1bGdpYmVrbXVsYW1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIxODEyNCwiZXhwIjoyMDY5Nzk0MTI0fQ.oPqS9DKdg4yIf7fFFMrnYDxsnsZwPMcD3J8EDBJONBc" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Twitter
echo "TWITTER_CLIENT_ID=TU9oOEhqcUdMNlNQRGhqMWFSSjg6MTpjaQ" | vercel env add TWITTER_CLIENT_ID production
echo "TWITTER_CLIENT_SECRET=zlq0pNjUY92Go_ksx38zLB6sua2TsuifjShHem_RdYcKHbzJJ8" | vercel env add TWITTER_CLIENT_SECRET production

# Gemini
echo "GEMINI_API_KEY=AIzaSyAb8YDOGDd6ed9cgCsIGF0ZVCrAqCf1pgs" | vercel env add GEMINI_API_KEY production

# Cron
echo "CRON_SECRET=my-super-secret-key-123456" | vercel env add CRON_SECRET production

# App URL (Vercelのドメインに更新)
echo "NEXT_PUBLIC_APP_URL=https://makerting-app.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

# NextAuth URL for Twitter callbacks
echo "NEXTAUTH_URL=https://makerting-app.vercel.app" | vercel env add NEXTAUTH_URL production

echo "環境変数の追加が完了しました！"