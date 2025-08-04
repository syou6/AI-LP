'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  target_audience?: string
  brand_voice?: string
  hashtags?: string[]
}

interface ContentVariation {
  content: string
  variation_number: number
  hashtags: string[]
}

export default function NewPostPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [variations, setVariations] = useState<ContentVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [customContent, setCustomContent] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const generateContent = async () => {
    if (!prompt && !selectedProduct) {
      setError('Please provide a prompt or select a product')
      return
    }

    setGenerating(true)
    setError('')
    setVariations([])

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          product_id: selectedProduct || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      setVariations(data.variations)
      setSelectedVariation(0) // Select first variation by default
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const publishPost = async (publishImmediately: boolean = true) => {
    const content = selectedVariation !== null 
      ? variations[selectedVariation].content 
      : customContent

    if (!content.trim()) {
      setError('Please provide content or select a generated variation')
      return
    }

    if (!publishImmediately && !scheduledFor) {
      setError('Please select a date and time for scheduling')
      return
    }

    setPublishing(true)
    setError('')
    setSuccess('')

    try {
      const hashtags = selectedVariation !== null 
        ? variations[selectedVariation].hashtags 
        : []

      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          product_id: selectedProduct || undefined,
          scheduled_for: !publishImmediately ? scheduledFor : undefined,
          publish_immediately: publishImmediately,
          hashtags,
          ai_prompt: prompt || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish post')
      }

      if (data.scheduled) {
        setSuccess('Post scheduled successfully!')
      } else if (data.published) {
        setSuccess('Post published successfully!')
      }

      // Reset form after success
      setTimeout(() => {
        router.push('/dashboard/posts')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setPublishing(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes in the future
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate AI-powered content or create your own post
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Content Generation Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">AI Content Generation</h2>
            <p className="card-description">
              Generate engaging content using AI based on your products or custom prompts
            </p>
          </div>
          <div className="card-content space-y-4">
            {/* Product Selection */}
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                Select Product (Optional)
              </label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="input"
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No products found. <a href="/dashboard/products" className="text-blue-600 hover:text-blue-500">Create one first</a>.
                </p>
              )}
            </div>

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Content Prompt
              </label>
              <textarea
                id="prompt"
                rows={3}
                className="textarea"
                placeholder="Describe what you want to post about... (e.g., 'Share a tip about productivity', 'Announce our new feature', 'Create engaging content about our product benefits')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button
              onClick={generateContent}
              disabled={generating || (!prompt && !selectedProduct)}
              className="btn-primary"
            >
              {generating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating variations...
                </div>
              ) : (
                'Generate Content Variations'
              )}
            </button>
          </div>
        </div>

        {/* Generated Variations */}
        {variations.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Generated Variations</h2>
              <p className="card-description">
                Choose your favorite variation or use it as inspiration
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedVariation === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVariation(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation === index}
                            onChange={() => setSelectedVariation(index)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-900">
                            Variation {variation.variation_number}
                          </label>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{variation.content}</p>
                        {variation.hashtags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {variation.hashtags.map((hashtag, hashIndex) => (
                              <span
                                key={hashIndex}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                #{hashtag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-sm text-gray-500">
                        {variation.content.length} chars
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Content */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Custom Content</h2>
            <p className="card-description">
              Write your own content or edit the generated variations
            </p>
          </div>
          <div className="card-content">
            <textarea
              rows={4}
              className="textarea"
              placeholder="Write your own content here..."
              value={customContent}
              onChange={(e) => {
                setCustomContent(e.target.value)
                setSelectedVariation(null) // Deselect variations when typing custom content
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                {customContent.length}/280 characters
              </div>
              {customContent.length > 280 && (
                <div className="text-sm text-red-600">
                  Content exceeds Twitter limit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Publishing Options</h2>
            <p className="card-description">
              Choose when to publish your post
            </p>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label htmlFor="scheduled" className="block text-sm font-medium text-gray-700 mb-2">
                Schedule for later (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduled"
                className="input"
                min={getMinDateTime()}
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
              {scheduledFor && (
                <p className="text-sm text-gray-500 mt-1">
                  Post will be published on {new Date(scheduledFor).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => publishPost(true)}
                disabled={publishing || (!selectedVariation && !customContent.trim())}
                className="btn-primary flex-1"
              >
                {publishing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  'Publish Now'
                )}
              </button>

              {scheduledFor && (
                <button
                  onClick={() => publishPost(false)}
                  disabled={publishing || (!selectedVariation && !customContent.trim())}
                  className="btn-outline flex-1"
                >
                  {publishing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Scheduling...
                    </div>
                  ) : (
                    'Schedule Post'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {(selectedVariation !== null || customContent.trim()) && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Preview</h2>
              <p className="card-description">How your post will look</p>
            </div>
            <div className="card-content">
              <div className="bg-white border rounded-lg p-4 max-w-md mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                    You
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-gray-900">Your Name</span>
                      <span className="text-gray-500">@your_handle</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500">now</span>
                    </div>
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {selectedVariation !== null ? variations[selectedVariation].content : customContent}
                    </div>
                    {selectedVariation !== null && variations[selectedVariation].hashtags.length > 0 && (
                      <div className="mt-2 text-blue-600">
                        {variations[selectedVariation].hashtags.map(hashtag => `#${hashtag}`).join(' ')}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 text-gray-500 max-w-md">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm">Reply</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <span className="text-sm">Retweet</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm">Like</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span className="text-sm">Share</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}