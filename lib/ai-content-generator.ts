import { geminiService } from './gemini'
import { AIContentVariation, ContentGenerationRequest, Product } from '@/types/database'

export class AIContentGenerator {
  private static instance: AIContentGenerator

  private constructor() {}

  public static getInstance(): AIContentGenerator {
    if (!AIContentGenerator.instance) {
      AIContentGenerator.instance = new AIContentGenerator()
    }
    return AIContentGenerator.instance
  }

  public async generateContentVariations(
    request: ContentGenerationRequest,
    product?: Product
  ): Promise<AIContentVariation[]> {
    const prompt = this.buildPrompt(request, product)
    
    try {
      const variations = await geminiService.generateMultipleVariations(prompt, 3)
      const results: AIContentVariation[] = []

      for (let i = 0; i < variations.length; i++) {
        const content = variations[i]
        
        // Generate hashtags for each variation
        const hashtags = await geminiService.generateHashtags(
          content,
          request.target_audience || product?.target_audience || undefined,
          product?.name
        )

        results.push({
          content: content,
          variation_number: i + 1,
          hashtags: hashtags,
        })
      }

      return results
    } catch (error) {
      console.error('Error generating content variations:', error)
      throw new Error('Failed to generate content variations')
    }
  }

  public async generateSingleContent(
    request: ContentGenerationRequest,
    product?: Product
  ): Promise<AIContentVariation> {
    const prompt = this.buildPrompt(request, product)
    
    try {
      const content = await geminiService.generateContent(prompt)
      
      // Generate hashtags
      const hashtags = await geminiService.generateHashtags(
        content,
        request.target_audience || product?.target_audience || undefined,
        product?.name
      )

      return {
        content: content.trim(),
        variation_number: 1,
        hashtags: hashtags,
      }
    } catch (error) {
      console.error('Error generating single content:', error)
      throw new Error('Failed to generate content')
    }
  }

  public async improveExistingContent(
    content: string,
    brandVoice?: string,
    targetAudience?: string
  ): Promise<string> {
    try {
      return await geminiService.improveContent(content, brandVoice, targetAudience)
    } catch (error) {
      console.error('Error improving content:', error)
      throw new Error('Failed to improve content')
    }
  }

  private buildPrompt(request: ContentGenerationRequest, product?: Product): string {
    let prompt = 'Create engaging social media content for Twitter'

    // Add product context
    if (product) {
      prompt += `\n\nProduct Information:
- Name: ${product.name}
- Description: ${product.description || 'N/A'}
- Target Audience: ${product.target_audience || 'General audience'}
- Brand Voice: ${product.brand_voice || 'Professional and friendly'}`
    }

    // Add request-specific information
    if (request.prompt) {
      prompt += `\n\nSpecific Request: ${request.prompt}`
    }

    // Add overrides from request
    if (request.brand_voice) {
      prompt += `\n\nBrand Voice Override: ${request.brand_voice}`
    }

    if (request.target_audience) {
      prompt += `\n\nTarget Audience Override: ${request.target_audience}`
    }

    // Add requirements
    prompt += `\n\nRequirements:
- Keep it under 280 characters for Twitter
- Make it engaging and compelling
- Include relevant emojis if appropriate
- Create content that encourages engagement (likes, retweets, replies)
- Avoid generic marketing speak
- Be authentic and valuable to the audience
- Include a subtle call-to-action when appropriate
- Don't include hashtags in the main content (they will be generated separately)`

    // Add content type suggestions
    prompt += `\n\nContent Types to Consider:
- Educational/Tips
- Behind-the-scenes
- User-generated content inspiration
- Questions to spark engagement
- Industry insights
- Personal stories/experiences
- Product benefits (subtle, not salesy)
- Trending topics related to the product/industry`

    prompt += `\n\nReturn only the social media content without any additional commentary or formatting.`

    return prompt
  }

  public async generateContentFromTemplate(
    template: string,
    variables: Record<string, string>
  ): Promise<string> {
    let content = template

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      content = content.replace(new RegExp(placeholder, 'g'), value)
    })

    // Use AI to make the content more natural and engaging
    const prompt = `
      Improve this social media content template to make it more natural and engaging:
      "${content}"
      
      Requirements:
      - Keep it under 280 characters
      - Make it sound natural, not templated
      - Maintain any important information
      - Add engaging elements
      
      Return only the improved content.
    `

    try {
      return await geminiService.generateContent(prompt)
    } catch (error) {
      console.error('Error generating content from template:', error)
      return content // Return original if AI improvement fails
    }
  }

  public async generateContentIdeas(
    product?: Product,
    count: number = 5
  ): Promise<string[]> {
    const prompt = `
      Generate ${count} social media content ideas for:
      ${product ? `
      Product: ${product.name}
      Description: ${product.description || 'N/A'}
      Target Audience: ${product.target_audience || 'General audience'}
      Brand Voice: ${product.brand_voice || 'Professional and friendly'}
      ` : 'General business/product marketing'}
      
      Requirements:
      - Each idea should be a brief description (1-2 sentences)
      - Focus on different content types (educational, entertaining, promotional, etc.)
      - Make them specific and actionable
      - Ensure they would work well on Twitter
      
      Format: Return each idea on a new line, numbered 1-${count}.
    `

    try {
      const response = await geminiService.generateContent(prompt)
      return response
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count)
    } catch (error) {
      console.error('Error generating content ideas:', error)
      return []
    }
  }
}

export const aiContentGenerator = AIContentGenerator.getInstance()