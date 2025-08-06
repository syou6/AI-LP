'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  target_audience?: string
  brand_voice?: string
  hashtags?: string[]
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_audience: '',
    brand_voice: '',
    hashtags: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '商品の取得に失敗しました')
      }

      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const hashtags = formData.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const body = {
        ...formData,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      }

      const response = await fetch(
        editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products',
        {
          method: editingProduct ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '商品の保存に失敗しました')
      }

      // Refresh products list
      await fetchProducts()

      // Reset form
      setShowForm(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        target_audience: '',
        brand_voice: '',
        hashtags: '',
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      target_audience: product.target_audience || '',
      brand_voice: product.brand_voice || '',
      hashtags: product.hashtags?.join(', ') || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('この商品を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '商品の削除に失敗しました')
      }

      // Refresh products list
      await fetchProducts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      target_audience: '',
      brand_voice: '',
      hashtags: '',
    })
    setError('')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="card-content">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI生成用の商品情報を管理します
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            新規商品を追加
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">
              {editingProduct ? '商品を編集' : '新規商品を追加'}
            </h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  商品名 *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  商品説明 *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  className="textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
                  ターゲットオーディエンス
                </label>
                <input
                  type="text"
                  id="target_audience"
                  className="input"
                  placeholder="例: 20-30代のビジネスパーソン"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="brand_voice" className="block text-sm font-medium text-gray-700 mb-2">
                  ブランドボイス
                </label>
                <input
                  type="text"
                  id="brand_voice"
                  className="input"
                  placeholder="例: フレンドリー、プロフェッショナル、革新的"
                  value={formData.brand_voice}
                  onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
                  ハッシュタグ
                </label>
                <input
                  type="text"
                  id="hashtags"
                  className="input"
                  placeholder="カンマ区切りで入力 (例: AI, マーケティング, 自動化)"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingProduct ? '更新' : '追加'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-outline">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">商品がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            最初の商品を追加して始めましょう。
          </p>
          <div className="mt-6">
            <button onClick={() => setShowForm(true)} className="btn-primary">
              新規商品を追加
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {product.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      {product.target_audience && (
                        <div className="flex items-start">
                          <span className="font-medium mr-2">ターゲット:</span>
                          <span>{product.target_audience}</span>
                        </div>
                      )}
                      {product.brand_voice && (
                        <div className="flex items-start">
                          <span className="font-medium mr-2">ボイス:</span>
                          <span>{product.brand_voice}</span>
                        </div>
                      )}
                      {product.hashtags && product.hashtags.length > 0 && (
                        <div className="flex items-start">
                          <span className="font-medium mr-2">タグ:</span>
                          <div className="flex flex-wrap gap-1">
                            {product.hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn-ghost text-xs"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn-ghost text-xs text-red-600 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}