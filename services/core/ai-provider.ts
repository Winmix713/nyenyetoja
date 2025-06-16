import { ErrorHandler } from '@/lib/errors/error-handler'
import { CacheManager } from '@/lib/cache/cache-manager'

export interface AIConfig {
  provider: 'openai' | 'groq'
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
  timeout?: number
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIRequest {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface AIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason: string
}

export interface AIUsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  requestsByModel: Record<string, number>
  averageResponseTime: number
}

export abstract class AIProvider {
  protected config: AIConfig
  protected cache: CacheManager
  private usageStats: AIUsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    requestsByModel: {},
    averageResponseTime: 0
  }

  constructor(config: AIConfig) {
    this.config = config
    this.cache = CacheManager.getInstance()
  }

  abstract generateCompletion(request: AIRequest): Promise<AIResponse>
  
  /**
   * Generate code from design description
   */
  async generateCode(
    designDescription: string,
    framework: 'react' | 'vue' | 'angular' = 'react',
    options: {
      typescript?: boolean
      styleFramework?: 'tailwind' | 'css-modules' | 'styled-components'
      responsive?: boolean
      accessibility?: boolean
    } = {}
  ): Promise<string> {
    const {
      typescript = true,
      styleFramework = 'tailwind',
      responsive = true,
      accessibility = true
    } = options

    const prompt = this.buildCodeGenerationPrompt(
      designDescription,
      framework,
      { typescript, styleFramework, responsive, accessibility }
    )

    const cacheKey = `ai-code-${this.hashString(prompt)}`
    
    // Check cache first
    const cached = await this.cache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    const request: AIRequest = {
      messages: [
        {
          role: 'system',
          content: 'You are an expert frontend developer. Generate clean, production-ready code based on design descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent code generation
      maxTokens: 4000
    }

    const response = await this.generateCompletion(request)
    
    // Cache the result
    await this.cache.set(cacheKey, response.content, 3600) // 1 hour cache
    
    // Update usage stats
    this.updateUsageStats(response)

    return response.content
  }

  /**
   * Generate component analysis and recommendations
   */
  async analyzeDesign(designData: any): Promise<{
    components: string[]
    layout: string
    styling: string[]
    accessibility: string[]
    recommendations: string[]
  }> {
    const prompt = `
Analyze this Figma design data and provide:
1. Suggested React components to create
2. Layout strategy (flexbox, grid, etc.)
3. Styling approach recommendations
4. Accessibility considerations
5. General implementation recommendations

Design data: ${JSON.stringify(designData, null, 2)}

Respond in JSON format with the structure:
{
  "components": ["ComponentName1", "ComponentName2"],
  "layout": "Layout strategy description",
  "styling": ["Styling recommendation 1", "Styling recommendation 2"],
  "accessibility": ["Accessibility consideration 1"],
  "recommendations": ["General recommendation 1"]
}
`

    const request: AIRequest = {
      messages: [
        {
          role: 'system',
          content: 'You are a UI/UX expert and frontend architect. Analyze designs and provide actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      maxTokens: 2000
    }

    const response = await this.generateCompletion(request)
    
    try {
      return JSON.parse(response.content)
    } catch (error) {
      ErrorHandler.handle(error as Error, 'AIProvider.analyzeDesign - JSON parse')
      
      // Fallback response
      return {
        components: ['MainComponent'],
        layout: 'Flexbox layout recommended',
        styling: ['Use Tailwind CSS for styling'],
        accessibility: ['Add proper ARIA labels'],
        recommendations: ['Create responsive design']
      }
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): AIUsageStats {
    return { ...this.usageStats }
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      requestsByModel: {},
      averageResponseTime: 0
    }
  }

  /**
   * Build code generation prompt
   */
  private buildCodeGenerationPrompt(
    designDescription: string,
    framework: string,
    options: any
  ): string {
    return `
Generate a ${framework.toUpperCase()} component based on this design description:

${designDescription}

Requirements:
- Framework: ${framework}
- TypeScript: ${options.typescript ? 'Yes' : 'No'}
- Styling: ${options.styleFramework}
- Responsive: ${options.responsive ? 'Yes' : 'No'}
- Accessibility: ${options.accessibility ? 'Include ARIA labels and semantic HTML' : 'Basic accessibility'}

Please provide:
1. Clean, production-ready code
2. Proper component structure
3. Responsive design if requested
4. Accessibility features if requested
5. Comments for complex logic only

Return only the code without explanations.
`
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(response: AIResponse): void {
    this.usageStats.totalRequests++
    this.usageStats.totalTokens += response.usage.totalTokens
    this.usageStats.requestsByModel[response.model] = 
      (this.usageStats.requestsByModel[response.model] || 0) + 1
    
    // Calculate estimated cost (rough estimates)
    const costPerToken = this.config.provider === 'openai' ? 0.0001 : 0.00005
    this.usageStats.totalCost += response.usage.totalTokens * costPerToken
  }

  /**
   * Simple string hashing for cache keys
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider extends AIProvider {
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: request.messages,
          temperature: request.temperature ?? this.config.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? this.config.maxTokens ?? 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      // Update average response time
      this.usageStats.averageResponseTime = 
        (this.usageStats.averageResponseTime * this.usageStats.totalRequests + responseTime) / 
        (this.usageStats.totalRequests + 1)

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason,
      }
    } catch (error) {
      ErrorHandler.handle(error as Error, 'OpenAIProvider.generateCompletion')
      throw error
    }
  }
}

/**
 * Groq Provider Implementation
 */
export class GroqProvider extends AIProvider {
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: request.messages,
          temperature: request.temperature ?? this.config.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? this.config.maxTokens ?? 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      // Update average response time
      this.usageStats.averageResponseTime = 
        (this.usageStats.averageResponseTime * this.usageStats.totalRequests + responseTime) / 
        (this.usageStats.totalRequests + 1)

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason,
      }
    } catch (error) {
      ErrorHandler.handle(error as Error, 'GroqProvider.generateCompletion')
      throw error
    }
  }
}

/**
 * AI Provider Factory
 */
export class AIProviderFactory {
  static create(config: AIConfig): AIProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config)
      case 'groq':
        return new GroqProvider(config)
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }
  }
}

// Default provider instance
export const aiProvider = AIProviderFactory.create({
  provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as 'openai' | 'groq') || 'openai',
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000,
})