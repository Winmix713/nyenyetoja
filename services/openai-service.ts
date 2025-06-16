import { generateText, generateObject } from "ai"
import { getOpenAIModel } from "@/lib/openai-client"
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

export class OpenAIService {
  private model = getOpenAIModel()

  async analyzeDesign(designData: any): Promise<DesignAnalysis> {
    // Check cost limits
    const limitCheck = aiCostManager.checkLimits()
    if (!limitCheck.canProceed) {
      throw new Error(`Cost limit exceeded: ${limitCheck.reason}`)
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
      const result = await generateObject({
        model: this.model,
        schema: DesignAnalysisSchema,
        prompt,
        temperature: 0.3,
      })

      // Track usage (approximate)
      aiCostManager.trackUsage(
        Math.ceil(prompt.length / 4), // Rough token estimation
        Math.ceil(JSON.stringify(result.object).length / 4),
      )

      return result.object
    } catch (error) {
      console.error("Design analysis failed:", error)
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async generateReactComponent(
    componentName: string,
    requirements: string,
    designContext?: any,
  ): Promise<GeneratedComponent> {
    // Check cost limits
    const limitCheck = aiCostManager.checkLimits()
    if (!limitCheck.canProceed) {
      throw new Error(`Cost limit exceeded: ${limitCheck.reason}`)
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
      const result = await generateObject({
        model: this.model,
        schema: ComponentSchema,
        prompt,
        temperature: 0.2,
      })

      // Track usage
      aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(JSON.stringify(result.object).length / 4))

      return result.object
    } catch (error) {
      console.error("Component generation failed:", error)
      throw new Error(`Component generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async optimizeCode(
    code: string,
    optimizationType: "performance" | "accessibility" | "maintainability" = "performance",
  ): Promise<string> {
    const limitCheck = aiCostManager.checkLimits()
    if (!limitCheck.canProceed) {
      throw new Error(`Cost limit exceeded: ${limitCheck.reason}`)
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
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.1,
      })

      // Track usage
      aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(result.text.length / 4))

      return result.text
    } catch (error) {
      console.error("Code optimization failed:", error)
      throw new Error(`Code optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async generateSuggestions(code: string): Promise<string[]> {
    const limitCheck = aiCostManager.checkLimits()
    if (!limitCheck.canProceed) {
      return ["Cost limit reached. Please check your usage."]
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
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.4,
      })

      // Track usage
      aiCostManager.trackUsage(Math.ceil(prompt.length / 4), Math.ceil(result.text.length / 4))

      // Try to parse as JSON, fallback to simple array
      try {
        return JSON.parse(result.text)
      } catch {
        return result.text.split("\n").filter((line) => line.trim().length > 0)
      }
    } catch (error) {
      console.error("Suggestions generation failed:", error)
      return ["Failed to generate suggestions. Please try again."]
    }
  }
}

export const openaiService = new OpenAIService()
