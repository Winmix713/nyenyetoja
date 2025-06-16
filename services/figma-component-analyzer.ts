import type { ParsedDocument, ParsedComponent, ComponentVariant } from "./figma-node-parser"

export interface ComponentAnalysis {
  id: string
  name: string
  category: ComponentCategory
  complexity: ComponentComplexity
  reusability: ReusabilityScore
  patterns: DesignPattern[]
  suggestions: OptimizationSuggestion[]
  dependencies: ComponentDependency[]
  variants: ComponentVariantAnalysis[]
}

export interface ComponentCategory {
  primary: string
  secondary: string[]
  confidence: number
}

export interface ComponentComplexity {
  score: number
  level: "simple" | "medium" | "complex"
  factors: ComplexityFactor[]
}

export interface ReusabilityScore {
  score: number
  level: "low" | "medium" | "high"
  reasons: string[]
}

export interface DesignPattern {
  name: string
  confidence: number
  description: string
  examples: string[]
}

export interface OptimizationSuggestion {
  type: "performance" | "accessibility" | "maintainability" | "design"
  priority: "low" | "medium" | "high"
  title: string
  description: string
  impact: string
}

export interface ComponentDependency {
  id: string
  name: string
  type: "component" | "style" | "asset"
  required: boolean
}

export interface ComponentVariantAnalysis {
  name: string
  properties: Record<string, any>
  usage: number
  complexity: number
}

export interface ComplexityFactor {
  factor: string
  impact: number
  description: string
}

export class FigmaComponentAnalyzer {
  private static readonly COMPLEXITY_WEIGHTS = {
    childCount: 0.1,
    nestingDepth: 0.2,
    uniqueStyles: 0.15,
    interactions: 0.25,
    variants: 0.3,
  }

  private static readonly PATTERN_LIBRARY = [
    {
      name: "Card Pattern",
      keywords: ["card", "tile", "panel"],
      structure: ["container", "header", "content", "footer"],
    },
    {
      name: "Button Pattern",
      keywords: ["button", "btn", "cta", "action"],
      structure: ["text", "icon"],
    },
    {
      name: "Form Pattern",
      keywords: ["form", "input", "field", "select"],
      structure: ["label", "input", "validation"],
    },
    {
      name: "Navigation Pattern",
      keywords: ["nav", "menu", "tab", "breadcrumb"],
      structure: ["items", "links", "indicators"],
    },
    {
      name: "Modal Pattern",
      keywords: ["modal", "dialog", "popup", "overlay"],
      structure: ["backdrop", "container", "header", "content", "actions"],
    },
  ]

  static analyzeComponents(document: ParsedDocument): ComponentAnalysis[] {
    console.log(`🔍 Analyzing ${document.components.length} components...`)

    const analyses = document.components.map((component) => {
      return this.analyzeComponent(component, document)
    })

    console.log(`✅ Component analysis complete`)
    return analyses
  }

  static analyzeComponent(component: ParsedComponent, document: ParsedDocument): ComponentAnalysis {
    const category = this.categorizeComponent(component)
    const complexity = this.calculateComplexity(component, document)
    const reusability = this.assessReusability(component, document)
    const patterns = this.identifyPatterns(component)
    const suggestions = this.generateSuggestions(component, complexity, patterns)
    const dependencies = this.analyzeDependencies(component, document)
    const variants = this.analyzeVariants(component)

    return {
      id: component.id,
      name: component.name,
      category,
      complexity,
      reusability,
      patterns,
      suggestions,
      dependencies,
      variants,
    }
  }

  private static categorizeComponent(component: ParsedComponent): ComponentCategory {
    const name = component.name.toLowerCase()
    const description = component.description.toLowerCase()
    const text = `${name} ${description}`

    const categories = [
      { name: "buttons", keywords: ["button", "btn", "cta", "action", "submit"], weight: 1 },
      { name: "forms", keywords: ["input", "field", "form", "select", "checkbox", "radio"], weight: 1 },
      { name: "navigation", keywords: ["nav", "menu", "tab", "breadcrumb", "pagination"], weight: 1 },
      { name: "cards", keywords: ["card", "tile", "panel", "item"], weight: 1 },
      { name: "overlays", keywords: ["modal", "dialog", "popup", "tooltip", "dropdown"], weight: 1 },
      { name: "layout", keywords: ["container", "wrapper", "grid", "flex", "section"], weight: 0.8 },
      { name: "media", keywords: ["image", "video", "avatar", "icon", "logo"], weight: 0.8 },
      { name: "feedback", keywords: ["alert", "notification", "toast", "badge", "status"], weight: 0.9 },
      { name: "data", keywords: ["table", "list", "chart", "graph", "data"], weight: 0.9 },
    ]

    const scores = categories.map((category) => {
      const matches = category.keywords.filter((keyword) => text.includes(keyword)).length
      return {
        name: category.name,
        score: matches * category.weight,
      }
    })

    scores.sort((a, b) => b.score - a.score)

    const primary = scores[0]?.score > 0 ? scores[0].name : "general"
    const secondary = scores
      .slice(1, 3)
      .filter((s) => s.score > 0)
      .map((s) => s.name)
    const confidence = Math.min(primary === "general" ? 0.3 : scores[0].score / 3, 1)

    return {
      primary,
      secondary,
      confidence,
    }
  }

  private static calculateComplexity(component: ParsedComponent, document: ParsedDocument): ComponentComplexity {
    const factors: ComplexityFactor[] = []
    let totalScore = 0

    // Child count factor
    const childCount = this.getComponentChildCount(component, document)
    const childFactor = Math.min(childCount / 10, 1) * this.COMPLEXITY_WEIGHTS.childCount
    factors.push({
      factor: "Child Elements",
      impact: childFactor,
      description: `Component has ${childCount} child elements`,
    })
    totalScore += childFactor

    // Nesting depth factor
    const nestingDepth = this.getComponentNestingDepth(component, document)
    const nestingFactor = Math.min(nestingDepth / 5, 1) * this.COMPLEXITY_WEIGHTS.nestingDepth
    factors.push({
      factor: "Nesting Depth",
      impact: nestingFactor,
      description: `Maximum nesting depth of ${nestingDepth} levels`,
    })
    totalScore += nestingFactor

    // Unique styles factor
    const uniqueStyles = this.countUniqueStyles(component, document)
    const stylesFactor = Math.min(uniqueStyles / 20, 1) * this.COMPLEXITY_WEIGHTS.uniqueStyles
    factors.push({
      factor: "Unique Styles",
      impact: stylesFactor,
      description: `Uses ${uniqueStyles} unique style properties`,
    })
    totalScore += stylesFactor

    // Variants factor
    const variantsFactor = Math.min(component.variants.length / 5, 1) * this.COMPLEXITY_WEIGHTS.variants
    factors.push({
      factor: "Variants",
      impact: variantsFactor,
      description: `Has ${component.variants.length} variants`,
    })
    totalScore += variantsFactor

    const score = Math.min(totalScore, 1)
    const level = score < 0.3 ? "simple" : score < 0.7 ? "medium" : "complex"

    return {
      score,
      level,
      factors,
    }
  }

  private static assessReusability(component: ParsedComponent, document: ParsedDocument): ReusabilityScore {
    const reasons: string[] = []
    let score = 0.5 // Base score

    // Check for parameterization
    if (component.props.length > 0) {
      score += 0.2
      reasons.push(`Has ${component.props.length} configurable properties`)
    }

    // Check for variants
    if (component.variants.length > 1) {
      score += 0.15
      reasons.push(`Supports ${component.variants.length} variants`)
    }

    // Check naming convention
    if (this.hasGoodNaming(component.name)) {
      score += 0.1
      reasons.push("Follows good naming conventions")
    }

    // Check for documentation
    if (component.description.length > 10) {
      score += 0.05
      reasons.push("Has documentation")
    }

    // Penalize overly complex components
    const complexity = this.calculateComplexity(component, document)
    if (complexity.level === "complex") {
      score -= 0.2
      reasons.push("High complexity may limit reusability")
    }

    score = Math.max(0, Math.min(1, score))
    const level = score < 0.4 ? "low" : score < 0.7 ? "medium" : "high"

    return {
      score,
      level,
      reasons,
    }
  }

  private static identifyPatterns(component: ParsedComponent): DesignPattern[] {
    const patterns: DesignPattern[] = []
    const name = component.name.toLowerCase()
    const description = component.description.toLowerCase()

    this.PATTERN_LIBRARY.forEach((pattern) => {
      const keywordMatches = pattern.keywords.filter(
        (keyword) => name.includes(keyword) || description.includes(keyword),
      ).length

      if (keywordMatches > 0) {
        const confidence = Math.min(keywordMatches / pattern.keywords.length, 1)

        patterns.push({
          name: pattern.name,
          confidence,
          description: `Matches ${keywordMatches} pattern keywords`,
          examples: pattern.structure,
        })
      }
    })

    return patterns.sort((a, b) => b.confidence - a.confidence)
  }

  private static generateSuggestions(
    component: ParsedComponent,
    complexity: ComponentComplexity,
    patterns: DesignPattern[],
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // Complexity suggestions
    if (complexity.level === "complex") {
      suggestions.push({
        type: "maintainability",
        priority: "high",
        title: "Consider Breaking Down Complex Component",
        description: "This component has high complexity. Consider splitting it into smaller, more focused components.",
        impact: "Improved maintainability and reusability",
      })
    }

    // Accessibility suggestions
    if (!this.hasAccessibilityProps(component)) {
      suggestions.push({
        type: "accessibility",
        priority: "medium",
        title: "Add Accessibility Properties",
        description: "Consider adding ARIA labels, roles, and other accessibility properties.",
        impact: "Better accessibility for users with disabilities",
      })
    }

    // Performance suggestions
    if (this.hasLargeAssets(component)) {
      suggestions.push({
        type: "performance",
        priority: "medium",
        title: "Optimize Large Assets",
        description: "Some assets in this component are large. Consider optimization or lazy loading.",
        impact: "Faster loading times and better performance",
      })
    }

    // Design system suggestions
    if (patterns.length === 0) {
      suggestions.push({
        type: "design",
        priority: "low",
        title: "Consider Design System Patterns",
        description:
          "This component doesn't match common design patterns. Consider aligning with established patterns.",
        impact: "Better consistency and user experience",
      })
    }

    return suggestions
  }

  private static analyzeDependencies(component: ParsedComponent, document: ParsedDocument): ComponentDependency[] {
    const dependencies: ComponentDependency[] = []

    // Find component dependencies (nested components)
    // This would require traversing the component structure
    // For now, return empty array as this requires more complex analysis

    return dependencies
  }

  private static analyzeVariants(component: ParsedComponent): ComponentVariantAnalysis[] {
    return component.variants.map((variant) => ({
      name: variant.name,
      properties: variant.properties,
      usage: 0, // Would need usage analytics
      complexity: this.calculateVariantComplexity(variant),
    }))
  }

  // Helper methods
  private static getComponentChildCount(component: ParsedComponent, document: ParsedDocument): number {
    // This would require finding the component in the document structure
    // For now, return estimated count based on props
    return component.props.length * 2 + 5
  }

  private static getComponentNestingDepth(component: ParsedComponent, document: ParsedDocument): number {
    // Estimate nesting depth based on component complexity
    return Math.min(component.props.length + 2, 8)
  }

  private static countUniqueStyles(component: ParsedComponent, document: ParsedDocument): number {
    // Estimate unique styles based on component properties
    return component.props.length * 3 + 10
  }

  private static hasGoodNaming(name: string): boolean {
    // Check for PascalCase and descriptive naming
    return /^[A-Z][a-zA-Z0-9]*$/.test(name) && name.length > 3
  }

  private static hasAccessibilityProps(component: ParsedComponent): boolean {
    const accessibilityProps = ["aria-label", "role", "tabindex", "alt"]
    return component.props.some((prop) =>
      accessibilityProps.some((accProp) => prop.name.toLowerCase().includes(accProp)),
    )
  }

  private static hasLargeAssets(component: ParsedComponent): boolean {
    // This would require analyzing actual assets
    // For now, return false as placeholder
    return false
  }

  private static calculateVariantComplexity(variant: ComponentVariant): number {
    return Object.keys(variant.properties).length * 0.1
  }
}
