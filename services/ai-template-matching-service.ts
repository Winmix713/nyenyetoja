import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { COMPONENT_TEMPLATES, type ComponentTemplate } from "@/lib/component-templates"
import type { FigmaNode } from "./figma-api-service"

export interface TemplateMatch {
  template: ComponentTemplate
  confidence: number
  reasoning: string
  suggestedModifications: string[]
  compatibilityScore: number
}

export interface DesignPattern {
  type:
    | "hero"
    | "navigation"
    | "card-grid"
    | "form"
    | "pricing"
    | "testimonial"
    | "footer"
    | "dashboard"
    | "product-showcase"
  confidence: number
  elements: string[]
  layout: "horizontal" | "vertical" | "grid" | "flex"
  complexity: "low" | "medium" | "high"
}

export interface SmartRecommendation {
  primaryMatches: TemplateMatch[]
  alternativeMatches: TemplateMatch[]
  hybridSuggestions: {
    baseTemplate: ComponentTemplate
    additionalComponents: ComponentTemplate[]
    integrationStrategy: string
  }[]
  designPatterns: DesignPattern[]
  customizationTips: string[]
}

export class AITemplateMatchingService {
  /**
   * Analyze Figma design and find matching templates using AI
   */
  static async findMatchingTemplates(
    figmaNodes: FigmaNode[],
    figmaData: any,
    userContext?: {
      industry?: string
      projectType?: string
      targetAudience?: string
    },
  ): Promise<SmartRecommendation> {
    try {
      // Step 1: Analyze design patterns
      const patterns = await this.analyzeDesignPatterns(figmaNodes, figmaData)

      // Step 2: Find template matches
      const templateMatches = await this.matchTemplates(patterns, figmaNodes, userContext)

      // Step 3: Generate hybrid suggestions
      const hybridSuggestions = await this.generateHybridSuggestions(patterns, templateMatches)

      // Step 4: Provide customization tips
      const customizationTips = await this.generateCustomizationTips(patterns, templateMatches)

      return {
        primaryMatches: templateMatches.slice(0, 3),
        alternativeMatches: templateMatches.slice(3, 6),
        hybridSuggestions,
        designPatterns: patterns,
        customizationTips,
      }
    } catch (error) {
      console.error("❌ AI Template Matching failed:", error)
      return this.getFallbackRecommendations(figmaNodes)
    }
  }

  /**
   * Analyze design patterns using AI
   */
  private static async analyzeDesignPatterns(nodes: FigmaNode[], figmaData: any): Promise<DesignPattern[]> {
    const prompt = `
Analyze this Figma design structure and identify UI patterns:

Design Info:
- Total nodes: ${nodes.length}
- Node types: ${[...new Set(nodes.map((n) => n.type))].join(", ")}
- Layout modes: ${[...new Set(nodes.filter((n) => n.layoutMode).map((n) => n.layoutMode))].join(", ")}

Sample structure:
${JSON.stringify(
  nodes.slice(0, 5).map((n) => ({
    name: n.name,
    type: n.type,
    layoutMode: n.layoutMode,
    children: n.children?.length || 0,
    hasText: !!n.characters,
    dimensions: n.absoluteBoundingBox
      ? `${Math.round(n.absoluteBoundingBox.width)}x${Math.round(n.absoluteBoundingBox.height)}`
      : null,
  })),
  null,
  2,
)}

Identify UI patterns and return JSON:
{
  "patterns": [
    {
      "type": "hero|navigation|card-grid|form|pricing|testimonial|footer|dashboard|product-showcase",
      "confidence": 0-100,
      "elements": ["list of key elements found"],
      "layout": "horizontal|vertical|grid|flex",
      "complexity": "low|medium|high"
    }
  ]
}
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
    })

    try {
      const analysis = JSON.parse(text)
      return analysis.patterns || []
    } catch {
      return this.getFallbackPatterns(nodes)
    }
  }

  /**
   * Match templates based on identified patterns
   */
  private static async matchTemplates(
    patterns: DesignPattern[],
    nodes: FigmaNode[],
    userContext?: any,
  ): Promise<TemplateMatch[]> {
    const matches: TemplateMatch[] = []

    for (const template of COMPONENT_TEMPLATES) {
      const match = await this.calculateTemplateMatch(template, patterns, nodes, userContext)
      if (match.confidence > 30) {
        // Only include reasonable matches
        matches.push(match)
      }
    }

    // Sort by confidence score
    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate how well a template matches the design
   */
  private static async calculateTemplateMatch(
    template: ComponentTemplate,
    patterns: DesignPattern[],
    nodes: FigmaNode[],
    userContext?: any,
  ): Promise<TemplateMatch> {
    const prompt = `
Analyze how well this template matches the design patterns:

Template: ${template.name}
Category: ${template.category}
Description: ${template.description}
Tags: ${template.tags.join(", ")}
Complexity: ${template.complexity}

Design Patterns Found:
${JSON.stringify(patterns, null, 2)}

User Context: ${JSON.stringify(userContext || {}, null, 2)}

Rate the match and provide analysis in JSON:
{
  "confidence": 0-100,
  "reasoning": "detailed explanation of why this template matches",
  "suggestedModifications": ["list of modifications needed"],
  "compatibilityScore": 0-100
}
`

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2,
      })

      const analysis = JSON.parse(text)

      return {
        template,
        confidence: analysis.confidence || 0,
        reasoning: analysis.reasoning || "AI analysis unavailable",
        suggestedModifications: analysis.suggestedModifications || [],
        compatibilityScore: analysis.compatibilityScore || 0,
      }
    } catch (error) {
      return {
        template,
        confidence: this.calculateBasicMatch(template, patterns),
        reasoning: "Basic pattern matching used",
        suggestedModifications: ["Review and customize as needed"],
        compatibilityScore: 50,
      }
    }
  }

  /**
   * Generate hybrid template suggestions
   */
  private static async generateHybridSuggestions(
    patterns: DesignPattern[],
    matches: TemplateMatch[],
  ): Promise<SmartRecommendation["hybridSuggestions"]> {
    if (matches.length < 2) return []

    const topMatches = matches.slice(0, 3)
    const suggestions = []

    for (const baseMatch of topMatches) {
      const complementaryTemplates = matches
        .filter((m) => m.template.category !== baseMatch.template.category)
        .slice(0, 2)

      if (complementaryTemplates.length > 0) {
        suggestions.push({
          baseTemplate: baseMatch.template,
          additionalComponents: complementaryTemplates.map((m) => m.template),
          integrationStrategy: `Use ${baseMatch.template.name} as the main component and integrate ${complementaryTemplates.map((m) => m.template.name).join(" and ")} for enhanced functionality`,
        })
      }
    }

    return suggestions.slice(0, 2)
  }

  /**
   * Generate customization tips
   */
  private static async generateCustomizationTips(
    patterns: DesignPattern[],
    matches: TemplateMatch[],
  ): Promise<string[]> {
    if (matches.length === 0) return []

    const topMatch = matches[0]
    const prompt = `
Based on this template match, provide customization tips:

Template: ${topMatch.template.name}
Match Confidence: ${topMatch.confidence}%
Reasoning: ${topMatch.reasoning}

Design Patterns: ${patterns.map((p) => p.type).join(", ")}

Provide 3-5 specific customization tips as a JSON array:
["tip1", "tip2", "tip3"]
`

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.4,
      })

      return JSON.parse(text)
    } catch {
      return [
        "Adjust colors to match your brand palette",
        "Customize typography for better readability",
        "Optimize spacing for your content length",
        "Add responsive breakpoints for mobile devices",
      ]
    }
  }

  /**
   * Fallback recommendations when AI fails
   */
  private static getFallbackRecommendations(nodes: FigmaNode[]): SmartRecommendation {
    const nodeCount = nodes.length
    const hasText = nodes.some((n) => n.characters)
    const hasImages = nodes.some((n) => n.type === "IMAGE")

    // Simple heuristic matching
    let recommendedTemplates = COMPONENT_TEMPLATES.slice(0, 3)

    if (hasText && hasImages && nodeCount > 20) {
      recommendedTemplates = COMPONENT_TEMPLATES.filter(
        (t) => t.category === "Cards" || t.category === "Dashboard",
      ).slice(0, 3)
    } else if (hasText && nodeCount < 10) {
      recommendedTemplates = COMPONENT_TEMPLATES.filter(
        (t) => t.category === "Forms" || t.category === "Buttons",
      ).slice(0, 3)
    }

    return {
      primaryMatches: recommendedTemplates.map((template) => ({
        template,
        confidence: 60,
        reasoning: "Basic pattern matching based on design complexity",
        suggestedModifications: ["Customize colors and typography"],
        compatibilityScore: 70,
      })),
      alternativeMatches: [],
      hybridSuggestions: [],
      designPatterns: this.getFallbackPatterns(nodes),
      customizationTips: [
        "Review the generated code for accuracy",
        "Test responsive behavior on different screen sizes",
        "Optimize for your specific use case",
      ],
    }
  }

  /**
   * Fallback pattern analysis
   */
  private static getFallbackPatterns(nodes: FigmaNode[]): DesignPattern[] {
    const patterns: DesignPattern[] = []

    const hasLayout = nodes.some((n) => n.layoutMode)
    const hasText = nodes.some((n) => n.characters)
    const nodeCount = nodes.length

    if (hasLayout && hasText) {
      patterns.push({
        type: nodeCount > 30 ? "dashboard" : "card-grid",
        confidence: 60,
        elements: ["layout", "text", "containers"],
        layout: "flex",
        complexity: nodeCount > 50 ? "high" : "medium",
      })
    }

    return patterns
  }

  /**
   * Basic template matching without AI
   */
  private static calculateBasicMatch(template: ComponentTemplate, patterns: DesignPattern[]): number {
    let score = 30 // Base score

    // Category matching
    for (const pattern of patterns) {
      if (template.category.toLowerCase().includes(pattern.type)) {
        score += 20
      }
    }

    // Complexity matching
    const avgComplexity =
      patterns.reduce((sum, p) => {
        const complexityScore = p.complexity === "low" ? 1 : p.complexity === "medium" ? 2 : 3
        return sum + complexityScore
      }, 0) / patterns.length

    const templateComplexityScore = template.complexity === "low" ? 1 : template.complexity === "medium" ? 2 : 3

    if (Math.abs(avgComplexity - templateComplexityScore) < 0.5) {
      score += 15
    }

    return Math.min(score, 95) // Cap at 95%
  }

  /**
   * Get template recommendations for specific design patterns
   */
  static getTemplatesByPattern(patternType: DesignPattern["type"]): ComponentTemplate[] {
    const patternToCategory: Record<DesignPattern["type"], string[]> = {
      hero: ["Cards", "Layout"],
      navigation: ["Navigation"],
      "card-grid": ["Cards", "Data Display"],
      form: ["Forms"],
      pricing: ["Cards", "E-commerce"],
      testimonial: ["Cards"],
      footer: ["Navigation", "Layout"],
      dashboard: ["Dashboard", "Data Display"],
      "product-showcase": ["E-commerce", "Cards"],
    }

    const relevantCategories = patternToCategory[patternType] || []

    return COMPONENT_TEMPLATES.filter((template) => relevantCategories.includes(template.category)).sort(
      (a, b) => b.rating - a.rating,
    )
  }
}
