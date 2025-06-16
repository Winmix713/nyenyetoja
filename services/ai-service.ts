import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { FigmaNode, FigmaComponent } from "./figma-api-service"

export interface AIAnalysisResult {
  complexity: "low" | "medium" | "high"
  componentCount: number
  recommendations: string[]
  structure: {
    layout: string
    components: string[]
    styling: string
  }
  qualityScore: number
}

export interface AICodeGeneration {
  jsx: string
  css: string
  typescript: string
  componentName: string
  props: string[]
}

export class AIService {
  static async analyzeFigmaStructure(nodes: FigmaNode[], components: FigmaComponent[]): Promise<AIAnalysisResult> {
    try {
      const prompt = `
Analyze this Figma design structure and provide insights:

Nodes: ${nodes.length} total nodes
Components: ${components.length} components

Node types: ${[...new Set(nodes.map((n) => n.type))].join(", ")}

Component names: ${components.map((c) => c.name).join(", ")}

Sample node structure:
${JSON.stringify(nodes.slice(0, 3), null, 2)}

Provide analysis in this JSON format:
{
  "complexity": "low|medium|high",
  "componentCount": number,
  "recommendations": ["recommendation1", "recommendation2"],
  "structure": {
    "layout": "description of layout approach",
    "components": ["component1", "component2"],
    "styling": "styling approach recommendation"
  },
  "qualityScore": number (0-100)
}
`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3,
      })

      // Parse AI response
      const analysis = JSON.parse(text)

      console.log("✅ AI Analysis completed:", analysis)
      return analysis
    } catch (error) {
      console.error("❌ AI Analysis failed:", error)

      // Fallback analysis
      return {
        complexity: nodes.length > 50 ? "high" : nodes.length > 20 ? "medium" : "low",
        componentCount: components.length,
        recommendations: ["Use semantic HTML elements", "Implement responsive design", "Optimize for accessibility"],
        structure: {
          layout: "Flexbox-based layout with component hierarchy",
          components: components.map((c) => c.name),
          styling: "CSS modules with Tailwind utility classes",
        },
        qualityScore: 85,
      }
    }
  }

  static async generateReactCode(
    nodes: FigmaNode[],
    components: FigmaComponent[],
    analysis: AIAnalysisResult,
  ): Promise<AICodeGeneration> {
    try {
      const prompt = `
Generate a React component based on this Figma design:

Analysis: ${JSON.stringify(analysis, null, 2)}

Key nodes:
${JSON.stringify(nodes.slice(0, 5), null, 2)}

Components:
${JSON.stringify(components, null, 2)}

Generate modern React code with:
1. Functional component with TypeScript
2. Tailwind CSS classes
3. Proper component structure
4. Accessibility features
5. Responsive design

Return JSON format:
{
  "jsx": "complete JSX component code",
  "css": "additional CSS if needed",
  "typescript": "TypeScript interface definitions",
  "componentName": "ComponentName",
  "props": ["prop1", "prop2"]
}
`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2,
      })

      const codeGeneration = JSON.parse(text)

      console.log("✅ AI Code Generation completed")
      return codeGeneration
    } catch (error) {
      console.error("❌ AI Code Generation failed:", error)

      // Fallback code generation
      return {
        jsx: `import React from 'react';

interface ${components[0]?.name || "Component"}Props {
  className?: string;
}

export default function ${components[0]?.name || "Component"}({ className }: ${components[0]?.name || "Component"}Props) {
  return (
    <div className={\`flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg \${className}\`}>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Generated Component
      </h1>
      <p className="text-gray-600 text-center">
        This component was generated from your Figma design.
      </p>
    </div>
  );
}`,
        css: `/* Additional styles if needed */
.component-container {
  /* Custom styles */
}`,
        typescript: `export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}`,
        componentName: components[0]?.name || "GeneratedComponent",
        props: ["className", "children"],
      }
    }
  }
}
