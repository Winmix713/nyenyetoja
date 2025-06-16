import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { ParsedFigmaDesign, ParsedFrame } from "./figma-parser"

export interface AICodeGenerationRequest {
  design: ParsedFigmaDesign
  targetFramework: "react" | "vue" | "angular"
  styleFramework: "tailwind" | "css-modules" | "styled-components" | "emotion"
  preferences: {
    typescript: boolean
    responsive: boolean
    accessibility: boolean
    semanticHtml: boolean
    componentSplit: "single" | "multiple" | "auto"
  }
  customInstructions?: string
}

export interface AICodeGenerationResult {
  components: GeneratedComponent[]
  styles: GeneratedStylesheet[]
  assets: GeneratedAsset[]
  documentation: string
  suggestions: CodeSuggestion[]
  quality: {
    score: number
    accessibility: number
    performance: number
    maintainability: number
    issues: QualityIssue[]
  }
}

export interface GeneratedComponent {
  name: string
  filename: string
  code: string
  type: "component" | "page" | "layout"
  dependencies: string[]
  props: ComponentProp[]
  description: string
}

export interface GeneratedStylesheet {
  filename: string
  content: string
  type: "css" | "scss" | "tailwind"
  variables: StyleVariable[]
}

export interface GeneratedAsset {
  name: string
  type: "icon" | "image" | "font"
  content: string
  format: string
}

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: string
}

export interface StyleVariable {
  name: string
  value: string
  category: "color" | "spacing" | "typography" | "shadow" | "border"
  description: string
}

export interface CodeSuggestion {
  type: "improvement" | "optimization" | "accessibility" | "best-practice"
  title: string
  description: string
  code?: string
  priority: "low" | "medium" | "high"
}

export interface QualityIssue {
  type: "error" | "warning" | "info"
  category: "accessibility" | "performance" | "maintainability" | "security"
  message: string
  line?: number
  suggestion?: string
}

// Zod schemas for structured generation
const ComponentSchema = z.object({
  name: z.string().describe("Component name in PascalCase"),
  filename: z.string().describe("Filename with extension"),
  code: z.string().describe("Complete component code"),
  type: z.enum(["component", "page", "layout"]),
  dependencies: z.array(z.string()).describe("Required npm packages"),
  props: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string(),
      defaultValue: z.string().optional(),
    }),
  ),
  description: z.string().describe("Component purpose and usage"),
})

const StylesheetSchema = z.object({
  filename: z.string(),
  content: z.string(),
  type: z.enum(["css", "scss", "tailwind"]),
  variables: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      category: z.enum(["color", "spacing", "typography", "shadow", "border"]),
      description: z.string(),
    }),
  ),
})

const QualityAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
  maintainability: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      type: z.enum(["error", "warning", "info"]),
      category: z.enum(["accessibility", "performance", "maintainability", "security"]),
      message: z.string(),
      line: z.number().optional(),
      suggestion: z.string().optional(),
    }),
  ),
})

export class AICodeGenerator {
  private model = openai("gpt-4o")

  async generateCode(request: AICodeGenerationRequest): Promise<AICodeGenerationResult> {
    console.log(`🤖 Starting AI code generation for: ${request.design.name}`)
    const startTime = Date.now()

    try {
      // Step 1: Analyze design structure
      const designAnalysis = await this.analyzeDesignStructure(request.design)

      // Step 2: Generate component architecture
      const architecture = await this.generateComponentArchitecture(request, designAnalysis)

      // Step 3: Generate individual components
      const components = await this.generateComponents(request, architecture)

      // Step 4: Generate stylesheets
      const styles = await this.generateStylesheets(request, components)

      // Step 5: Generate documentation
      const documentation = await this.generateDocumentation(request, components)

      // Step 6: Analyze code quality
      const quality = await this.analyzeCodeQuality(components, styles)

      // Step 7: Generate suggestions
      const suggestions = await this.generateSuggestions(request, components, quality)

      const result: AICodeGenerationResult = {
        components,
        styles,
        assets: [], // TODO: Implement asset generation
        documentation,
        suggestions,
        quality,
      }

      const duration = Date.now() - startTime
      console.log(`✅ AI code generation completed in ${duration}ms`)
      console.log(`📊 Generated ${components.length} components with quality score: ${quality.score}`)

      return result
    } catch (error) {
      console.error(`❌ AI code generation failed:`, error)
      throw new Error(`Code generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private async analyzeDesignStructure(design: ParsedFigmaDesign) {
    const prompt = `
Analyze this Figma design structure and provide insights for code generation:

Design: ${design.name}
Pages: ${design.pages.length}
Components: ${design.components.length}
Total Nodes: ${design.metadata.nodeCount}

Page Structure:
${design.pages
  .map(
    (page) => `
- ${page.name}: ${page.frames.length} frames
  ${page.frames.map((frame) => `  - ${frame.name} (${frame.type}): ${frame.children.length} children`).join("\n")}
`,
  )
  .join("\n")}

Provide analysis in JSON format:
{
  "complexity": "low|medium|high",
  "patterns": ["list of UI patterns detected"],
  "componentSuggestions": ["suggested component breakdown"],
  "layoutStrategy": "flexbox|grid|hybrid",
  "responsiveNeeds": ["breakpoint suggestions"],
  "accessibilityConsiderations": ["a11y requirements"]
}
`

    const { text } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.3,
    })

    try {
      return JSON.parse(text)
    } catch {
      return {
        complexity: "medium",
        patterns: ["layout", "components"],
        componentSuggestions: ["Split into logical components"],
        layoutStrategy: "flexbox",
        responsiveNeeds: ["mobile", "tablet", "desktop"],
        accessibilityConsiderations: ["semantic HTML", "ARIA labels"],
      }
    }
  }

  private async generateComponentArchitecture(request: AICodeGenerationRequest, analysis: any) {
    const prompt = `
Based on this design analysis, create a component architecture:

Framework: ${request.targetFramework}
Style Framework: ${request.styleFramework}
TypeScript: ${request.preferences.typescript}
Component Split: ${request.preferences.componentSplit}

Design Analysis:
${JSON.stringify(analysis, null, 2)}

Design Structure:
${request.design.pages
  .map((page) => page.frames.map((frame) => `${frame.name}: ${frame.children.length} elements`).join("\n"))
  .join("\n")}

Create a component hierarchy that:
1. Follows ${request.targetFramework} best practices
2. Ensures reusability and maintainability
3. Implements proper separation of concerns
4. Considers responsive design needs

Return JSON with component structure:
{
  "components": [
    {
      "name": "ComponentName",
      "type": "component|page|layout",
      "purpose": "description",
      "children": ["child component names"],
      "props": ["prop names"],
      "complexity": "low|medium|high"
    }
  ],
  "dependencies": ["required packages"],
  "fileStructure": {
    "components/": ["component files"],
    "styles/": ["style files"],
    "types/": ["type definition files"]
  }
}
`

    const { text } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.2,
    })

    try {
      return JSON.parse(text)
    } catch {
      return {
        components: [
          {
            name: "MainComponent",
            type: "component",
            purpose: "Main component",
            children: [],
            props: [],
            complexity: "medium",
          },
        ],
        dependencies: ["react"],
        fileStructure: {
          "components/": ["MainComponent.tsx"],
          "styles/": ["styles.css"],
        },
      }
    }
  }

  private async generateComponents(request: AICodeGenerationRequest, architecture: any): Promise<GeneratedComponent[]> {
    const components: GeneratedComponent[] = []

    for (const componentSpec of architecture.components) {
      try {
        console.log(`🔧 Generating component: ${componentSpec.name}`)

        const component = await this.generateSingleComponent(request, componentSpec, architecture)
        components.push(component)
      } catch (error) {
        console.error(`❌ Failed to generate component ${componentSpec.name}:`, error)
        // Continue with other components
      }
    }

    return components
  }

  private async generateSingleComponent(
    request: AICodeGenerationRequest,
    componentSpec: any,
    architecture: any,
  ): Promise<GeneratedComponent> {
    const relevantFrames = this.findRelevantFrames(request.design, componentSpec.name)

    const prompt = `
Generate a ${request.targetFramework} component with the following specifications:

Component Name: ${componentSpec.name}
Type: ${componentSpec.type}
Purpose: ${componentSpec.purpose}
Framework: ${request.targetFramework}
Style Framework: ${request.styleFramework}
TypeScript: ${request.preferences.typescript}

Design Data:
${JSON.stringify(relevantFrames, null, 2)}

Requirements:
- ${request.preferences.responsive ? "Responsive design" : "Fixed layout"}
- ${request.preferences.accessibility ? "Full accessibility support" : "Basic accessibility"}
- ${request.preferences.semanticHtml ? "Semantic HTML elements" : "Standard HTML"}
- Clean, maintainable code
- Proper error handling
- Performance optimized

${request.customInstructions ? `Custom Instructions: ${request.customInstructions}` : ""}

Generate complete, production-ready code that:
1. Follows ${request.targetFramework} best practices
2. Uses ${request.styleFramework} for styling
3. Implements proper TypeScript types (if enabled)
4. Includes proper prop validation
5. Has good performance characteristics
6. Follows accessibility guidelines

Return the component code only, no explanations.
`

    const { object } = await generateObject({
      model: this.model,
      schema: ComponentSchema,
      prompt,
      temperature: 0.1,
    })

    return object
  }

  private async generateStylesheets(
    request: AICodeGenerationRequest,
    components: GeneratedComponent[],
  ): Promise<GeneratedStylesheet[]> {
    if (request.styleFramework === "tailwind") {
      // For Tailwind, we don't need separate stylesheets
      return []
    }

    const prompt = `
Generate ${request.styleFramework} stylesheets for these components:

Components:
${components.map((c) => `- ${c.name}: ${c.description}`).join("\n")}

Style Framework: ${request.styleFramework}
Responsive: ${request.preferences.responsive}

Create:
1. Main stylesheet with global styles
2. Component-specific styles (if needed)
3. CSS custom properties for design tokens
4. Responsive breakpoints
5. Accessibility styles

Focus on:
- Consistent design system
- Performance optimization
- Maintainable code structure
- Cross-browser compatibility
`

    const { object } = await generateObject({
      model: this.model,
      schema: StylesheetSchema,
      prompt,
      temperature: 0.2,
    })

    return [object]
  }

  private async generateDocumentation(
    request: AICodeGenerationRequest,
    components: GeneratedComponent[],
  ): Promise<string> {
    const prompt = `
Generate comprehensive documentation for this component library:

Project: ${request.design.name}
Framework: ${request.targetFramework}
Components: ${components.length}

Components:
${components
  .map(
    (c) => `
- ${c.name} (${c.type})
  Purpose: ${c.description}
  Props: ${c.props.map((p) => `${p.name}: ${p.type}`).join(", ")}
`,
  )
  .join("\n")}

Create documentation that includes:
1. Project overview
2. Installation instructions
3. Component usage examples
4. Props documentation
5. Styling guide
6. Accessibility notes
7. Browser support
8. Contributing guidelines

Format as Markdown.
`

    const { text } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.3,
    })

    return text
  }

  private async analyzeCodeQuality(components: GeneratedComponent[], styles: GeneratedStylesheet[]) {
    const allCode = components.map((c) => c.code).join("\n\n")
    const allStyles = styles.map((s) => s.content).join("\n\n")

    const prompt = `
Analyze the quality of this generated code:

Components Code:
${allCode.slice(0, 5000)}...

Styles Code:
${allStyles.slice(0, 2000)}...

Evaluate:
1. Code quality and best practices
2. Accessibility compliance
3. Performance considerations
4. Maintainability
5. Security issues

Provide scores (0-100) and specific issues found.
`

    const { object } = await generateObject({
      model: this.model,
      schema: QualityAnalysisSchema,
      prompt,
      temperature: 0.1,
    })

    return object
  }

  private async generateSuggestions(
    request: AICodeGenerationRequest,
    components: GeneratedComponent[],
    quality: any,
  ): Promise<CodeSuggestion[]> {
    const prompt = `
Based on the generated code and quality analysis, provide improvement suggestions:

Quality Scores:
- Overall: ${quality.score}
- Accessibility: ${quality.accessibility}
- Performance: ${quality.performance}
- Maintainability: ${quality.maintainability}

Issues Found:
${quality.issues.map((issue: any) => `- ${issue.type}: ${issue.message}`).join("\n")}

Provide 3-5 actionable suggestions for improvement, focusing on:
1. Code optimization
2. Accessibility enhancements
3. Performance improvements
4. Best practice implementations
5. Future maintainability

Format as JSON array of suggestions.
`

    const { text } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.4,
    })

    try {
      return JSON.parse(text)
    } catch {
      return [
        {
          type: "improvement",
          title: "Code Review",
          description: "Review generated code for optimization opportunities",
          priority: "medium",
        },
      ]
    }
  }

  private findRelevantFrames(design: ParsedFigmaDesign, componentName: string): ParsedFrame[] {
    // Find frames that match the component name or purpose
    const allFrames = design.pages.flatMap((page) => page.frames)

    return allFrames.filter(
      (frame) =>
        frame.name.toLowerCase().includes(componentName.toLowerCase()) ||
        componentName.toLowerCase().includes(frame.name.toLowerCase()),
    )
  }
}

export const aiCodeGenerator = new AICodeGenerator()
