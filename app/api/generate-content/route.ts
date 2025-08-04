import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { aiContentGenerator } from '@/lib/ai-content-generator'
import { ContentGenerationRequest } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ContentGenerationRequest = await request.json()
    
    // Validate request
    if (!body.prompt && !body.product_id) {
      return NextResponse.json(
        { error: 'Either prompt or product_id is required' },
        { status: 400 }
      )
    }

    let product = null
    
    // Get product information if product_id is provided
    if (body.product_id) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', body.product_id)
        .eq('user_id', user.id)
        .single()

      if (productError || !productData) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      product = productData
    }

    // Generate content variations
    const variations = await aiContentGenerator.generateContentVariations(body, product)
    
    if (variations.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate content variations' },
        { status: 500 }
      )
    }

    // Return the generated variations
    return NextResponse.json({
      success: true,
      variations,
      product: product ? {
        id: product.id,
        name: product.name,
        description: product.description,
      } : null,
    })

  } catch (error: any) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

// Get content ideas for a product
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const count = parseInt(searchParams.get('count') || '5')

    let product = null
    
    // Get product information if product_id is provided
    if (productId) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single()

      if (productError || !productData) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      product = productData
    }

    // Generate content ideas
    const ideas = await aiContentGenerator.generateContentIdeas(product, count)
    
    return NextResponse.json({
      success: true,
      ideas,
      product: product ? {
        id: product.id,
        name: product.name,
        description: product.description,
      } : null,
    })

  } catch (error: any) {
    console.error('Content ideas generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content ideas' },
      { status: 500 }
    )
  }
}