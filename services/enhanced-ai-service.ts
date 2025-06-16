import { aiProviderManager, type AIProvider } from "@/lib/ai-provider-manager"
import { aiCostManager } from "@/lib/ai-cost-manager"
import { z } from "zod"

export interface DesignAnalysis {
  complexity: "low" | "medium" | "high"
  componentTypes: string[]
  layoutPattern: "flexbox" | "grid" | "absolute" | "hybrid"
  designSystem: {
    colors: string[]
    typography: string[]
    spacing: string[]
  }
  recommendations: string[]
  estimatedComponents: number
}

export interface GeneratedComponent {
  name: string
  code: string
  description: string
  props: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  dependencies: string[]
}

const DesignAnalysisSchema = z.object({
  complexity: z.enum(["low", "medium", "high"]),
  componentTypes: z.array(z.string()),
  layoutPattern: z.enum(["flexbox", "grid", "absolute", "hybrid"]),
  designSystem: z.object({
    colors: z.array(z.string()),
    typography: z.array(z.string()),
    spacing: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
  estimatedComponents: z.number(),
})

const ComponentSchema = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string(),
  props: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string(),
    }),
  ),
  dependencies: z.array(z.string()),
})

export class EnhancedAIService {
  async analyzeDesign(
    designData: any,
    options: { provider?: AIProvider; model?: string } = {},
  ): Promise<DesignAnalysis & { usedProvider: AIProvider; usedModel: string }> {
    // Check cost limits for paid providers
    if (options.provider === "openai") {
      const limitCheck = aiCostManager.checkLimits()
      if (!limitCheck.canProceed) {
        console.warn("OpenAI cost limit exceeded, switching to Groq")
        options.provider = "groq"
      }
    }

    const prompt = `
Analyze this design data and provide structured insights for React component generation:

Design Data: ${JSON.stringify(designData, null, 2)}

Analyze the design and provide:
1. Complexity assessment (low/medium/high)
2. Component types that should be created
3. Best layout strategy (flexbox/grid/absolute/hybrid)
4. Design system tokens (colors, typography, spacing)
5. Recommendations for implementation
6. Estimated number of components needed

Focus on practical React development considerations.
`

    try {
      const result = await aiProviderManager.generateObject<DesignAnalysis>(prompt, DesignAnalysisSchema, {
        provider: options.provider,
        model: options.model,
        temperature: 0.3,
      })

      // Track usage for paid providers
      if (result.provider === "openai") {
        aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(JSON.stringify(result.object).length / 4))
      }

      return {
        ...result.object,
        usedProvider: result.provider,
        usedModel: result.model,
      }
    } catch (error) {
      console.error("Design analysis failed:", error)
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async generateReactComponent(
    componentName: string,
    requirements: string,
    designContext?: any,
    options: { provider?: AIProvider; model?: string } = {},
  ): Promise<GeneratedComponent & { usedProvider: AIProvider; usedModel: string }> {
    // Check cost limits for paid providers
    if (options.provider === "openai") {
      const limitCheck = aiCostManager.checkLimits()
      if (!limitCheck.canProceed) {
        console.warn("OpenAI cost limit exceeded, switching to Groq")
        options.provider = "groq"
      }
    }

    const prompt = `
Generate a React component with TypeScript and Tailwind CSS:

Component Name: ${componentName}
Requirements: ${requirements}
${designContext ? `Design Context: ${JSON.stringify(designContext, null, 2)}` : ""}

Create a complete, production-ready React component that:
1. Uses TypeScript with proper interfaces
2. Implements Tailwind CSS for styling
3. Follows React best practices
4. Includes proper accessibility attributes
5. Is responsive and mobile-friendly
6. Has clear prop definitions
7. Includes JSDoc comments

Generate clean, maintainable code that a developer can immediately use.
`

    try {
      const result = await aiProviderManager.generateObject<GeneratedComponent>(prompt, ComponentSchema, {
        provider: options.provider,
        model: options.model,
        temperature: 0.2,
      })

      // Track usage for paid providers
      if (result.provider === "openai") {
        aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(JSON.stringify(result.object).length / 4))
      }

      return {
        ...result.object,
        usedProvider: result.provider,
        usedModel: result.model,
      }
    } catch (error) {
      console.error("Component generation failed:", error)
      throw new Error(`Component generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async optimizeCode(
    code: string,
    optimizationType: "performance" | "accessibility" | "maintainability" = "performance",
    options: { provider?: AIProvider; model?: string } = {},
  ): Promise<{ code: string; usedProvider: AIProvider; usedModel: string }> {
    // Check cost limits for paid providers
    if (options.provider === "openai") {
      const limitCheck = aiCostManager.checkLimits()
      if (!limitCheck.canProceed) {
        console.warn("OpenAI cost limit exceeded, switching to Groq")
        options.provider = "groq"
      }
    }

    const prompt = `
Optimize this React component code for ${optimizationType}:

${code}

Provide optimized code that:
${
  optimizationType === "performance"
    ? `
- Minimizes re-renders
- Uses proper memoization
- Optimizes bundle size
- Improves runtime performance
`
    : optimizationType === "accessibility"
      ? `
- Adds proper ARIA attributes
- Ensures keyboard navigation
- Improves screen reader support
- Follows WCAG guidelines
`
      : `
- Improves code readability
- Adds better error handling
- Enhances type safety
- Follows best practices
`
}

Return only the optimized code, no explanations.
`

    try {
      const result = await aiProviderManager.generateText(prompt, {
        provider: options.provider,
        model: options.model,
        temperature: 0.1,
      })

      // Track usage for paid providers
      if (result.provider === "openai") {
        aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(result.text.length / 4))
      }

      return {
        code: result.text,
        usedProvider: result.provider,
        usedModel: result.model,
      }
    } catch (error) {
      console.error("Code optimization failed:", error)
      throw new Error(`Code optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async generateSuggestions(
    code: string,
    options: { provider?: AIProvider; model?: string } = {},
  ): Promise<{ suggestions: string[]; usedProvider: AIProvider; usedModel: string }> {
    // Always prefer free provider for suggestions
    if (!options.provider) {
      options.provider = "groq"
    }

    const prompt = `
Analyze this React component and provide 3-5 specific improvement suggestions:

${code}

Focus on:
1. Code quality improvements
2. Performance optimizations
3. Accessibility enhancements
4. Best practice implementations
5. Potential bugs or issues

Provide actionable, specific suggestions as a JSON array of strings.
`

    try {
      const result = await aiProviderManager.generateText(prompt, {
        provider: options.provider,
        model: options.model,
        temperature: 0.4,
      })

      // Track usage for paid providers
      if (result.provider === "openai") {
        aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(result.text.length / 4))
      }

      // Try to parse as JSON, fallback to simple array
      let suggestions: string[]
      try {
        suggestions = JSON.parse(result.text)
      } catch {
        suggestions = result.text.split("\n").filter((line) => line.trim().length > 0)
      }

      return {
        suggestions,
        usedProvider: result.provider,
        usedModel: result.model,
      }
    } catch (error) {
      console.error("Suggestions generation failed:", error)
      return {
        suggestions: ["Failed to generate suggestions. Please try again."],
        usedProvider: options.provider || "groq",
        usedModel: options.model || "llama-3.1-70b-versatile",
      }
    }
  }
}

export const enhancedAIService = new EnhancedAIService()
