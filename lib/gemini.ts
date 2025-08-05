import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export class GeminiService {
  private static instance: GeminiService
  private model: any

  private constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  public async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error: any) {
      console.error('Gemini API error:', error)
      throw new Error(`Content generation failed: ${error.message}`)
    }
  }

  public async generateMultipleVariations(
    prompt: string,
    count: number = 3
  ): Promise<string[]> {
    const variations: string[] = []
    
    for (let i = 0; i < count; i++) {
      try {
        const variationPrompt = `${prompt}\n\nCreate variation ${i + 1} with a different approach and tone while maintaining the core message.`
        const content = await this.generateContent(variationPrompt)
        variations.push(content.trim())
      } catch (error) {
        console.error(`Error generating variation ${i + 1}:`, error)
        // Continue with other variations even if one fails
      }
    }

    return variations
  }

  public async generateHashtags(
    content: string,
    targetAudience?: string,
    productName?: string
  ): Promise<string[]> {
    const prompt = `
      Generate 5-10 relevant hashtags for this social media content:
      "${content}"
      
      ${targetAudience ? `Target audience: ${targetAudience}` : ''}
      ${productName ? `Product/Brand: ${productName}` : ''}
      
      Return only the hashtags separated by commas, without the # symbol.
      Focus on popular, relevant hashtags that will help with discoverability.
    `

    try {
      const result = await this.generateContent(prompt)
      const hashtags = result
        .split(',')
        .map(tag => tag.trim().replace('#', ''))
        .filter(tag => tag.length > 0)
        .slice(0, 10) // Limit to 10 hashtags
      
      return hashtags
    } catch (error) {
      console.error('Error generating hashtags:', error)
      return []
    }
  }

  public async improveContent(
    content: string,
    brandVoice?: string,
    targetAudience?: string
  ): Promise<string> {
    const prompt = `
      Improve this social media content while keeping it concise and engaging:
      "${content}"
      
      ${brandVoice ? `Brand voice: ${brandVoice}` : ''}
      ${targetAudience ? `Target audience: ${targetAudience}` : ''}
      
      Requirements:
      - Keep it under 280 characters for Twitter
      - Make it more engaging and compelling
      - Maintain the original message
      - Use appropriate tone for the target audience
      - Include a call-to-action if appropriate
      
      Return only the improved content without additional commentary.
    `

    try {
      const improved = await this.generateContent(prompt)
      return improved.trim()
    } catch (error) {
      console.error('Error improving content:', error)
      return content // Return original if improvement fails
    }
  }
}

export const geminiService = GeminiService.getInstance()