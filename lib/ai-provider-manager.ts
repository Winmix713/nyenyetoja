import { GroqClient } from "./groq-client"
import { getOpenAIModel } from "./openai-client"
import { generateText, generateObject } from "ai"

export type AIProvider = "openai" | "groq"

export interface AIProviderConfig {
  provider: AIProvider
  model: string
  apiKey?: string
}

export interface GenerationOptions {
  maxTokens?: number
  temperature?: number
  provider?: AIProvider
  model?: string
}

export class AIProviderManager {
  private static instance: AIProviderManager
  private groqClient: GroqClient
  private defaultProvider: AIProvider = "groq" // Default to free option

  constructor() {
    this.groqClient = new GroqClient()
  }

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager()
    }
    return AIProviderManager.instance
  }

  setDefaultProvider(provider: AIProvider) {
    this.defaultProvider = provider
  }

  getDefaultProvider(): AIProvider {
    return this.defaultProvider
  }

  async generateText(
    prompt: string,
    options: GenerationOptions = {},
  ): Promise<{
    text: string
    provider: AIProvider
    model: string
    tokens?: number
  }> {
    const provider = options.provider || this.defaultProvider

    try {
      if (provider === "groq") {
        const text = await this.groqClient.generateText(prompt, {
          model: options.model || "llama-3.1-70b-versatile",
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        })

        return {
          text,
          provider: "groq",
          model: options.model || "llama-3.1-70b-versatile",
        }
      } else {
        // OpenAI
        const model = getOpenAIModel()
        const result = await generateText({
          model,
          prompt,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        })

        return {
          text: result.text,
          provider: "openai",
          model: "gpt-4o",
          tokens: result.usage?.totalTokens,
        }
      }
    } catch (error) {
      // Fallback to alternative provider
      if (provider === "openai") {
        console.warn("OpenAI failed, falling back to Groq")
        return this.generateText(prompt, { ...options, provider: "groq" })
      } else {
        console.warn("Groq failed, falling back to OpenAI")
        return this.generateText(prompt, { ...options, provider: "openai" })
      }
    }
  }

  async generateObject<T>(
    prompt: string,
    schema: any,
    options: GenerationOptions = {},
  ): Promise<{
    object: T
    provider: AIProvider
    model: string
  }> {
    const provider = options.provider || this.defaultProvider

    try {
      if (provider === "groq") {
        const object = await this.groqClient.generateObject<T>(prompt, schema, {
          model: options.model || "llama-3.1-70b-versatile",
          temperature: options.temperature,
        })

        return {
          object,
          provider: "groq",
          model: options.model || "llama-3.1-70b-versatile",
        }
      } else {
        // OpenAI
        const model = getOpenAIModel()
        const result = await generateObject({
          model,
          schema,
          prompt,
          temperature: options.temperature,
        })

        return {
          object: result.object,
          provider: "openai",
          model: "gpt-4o",
        }
      }
    } catch (error) {
      // Fallback to alternative provider
      if (provider === "openai") {
        console.warn("OpenAI failed, falling back to Groq")
        return this.generateObject(prompt, schema, { ...options, provider: "groq" })
      } else {
        console.warn("Groq failed, falling back to OpenAI")
        return this.generateObject(prompt, schema, { ...options, provider: "openai" })
      }
    }
  }

  getAvailableProviders(): Array<{
    id: AIProvider
    name: string
    description: string
    cost: string
    speed: string
    models: Array<{ id: string; name: string; description: string }>
  }> {
    return [
      {
        id: "groq",
        name: "Groq (Free)",
        description: "Ultra-fast inference with generous free tier",
        cost: "Free",
        speed: "Very Fast",
        models: GroqClient.getAvailableModels(),
      },
      {
        id: "openai",
        name: "OpenAI",
        description: "Most capable AI models, premium quality",
        cost: "Paid",
        speed: "Fast",
        models: [
          {
            id: "gpt-4o",
            name: "GPT-4o",
            description: "Most capable model for complex tasks",
            contextLength: 128000,
          },
          {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini",
            description: "Cost-effective model for simpler tasks",
            contextLength: 128000,
          },
        ],
      },
    ]
  }

  async testProvider(provider: AIProvider): Promise<boolean> {
    try {
      const result = await this.generateText('Say "Hello" if you can hear me.', {
        provider,
        maxTokens: 10,
      })
      return result.text.toLowerCase().includes("hello")
    } catch (error) {
      return false
    }
  }
}

export const aiProviderManager = AIProviderManager.getInstance()
