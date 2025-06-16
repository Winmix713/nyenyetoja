import type { FigmaFileResponse, FigmaNode, FigmaFrameNode, FigmaTextNode, FigmaColor } from "@/lib/figma-api-client"

export interface ParsedFigmaDesign {
  name: string
  pages: ParsedPage[]
  components: ParsedComponent[]
  styles: ParsedStyleSystem
  assets: ParsedAsset[]
  metadata: {
    version: string
    lastModified: string
    nodeCount: number
    componentCount: number
  }
}

export interface ParsedPage {
  id: string
  name: string
  frames: ParsedFrame[]
  backgroundColor?: string
}

export interface ParsedFrame {
  id: string
  name: string
  type: "frame" | "component" | "instance" | "group"
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  layout: {
    mode: "none" | "horizontal" | "vertical"
    direction?: "row" | "column"
    gap?: number
    padding?: {
      top: number
      right: number
      bottom: number
      left: number
    }
    alignment?: {
      main: "start" | "center" | "end" | "space-between" | "space-around"
      cross: "start" | "center" | "end" | "stretch"
    }
  }
  styling: {
    backgroundColor?: string
    borderRadius?: number | number[]
    borders?: ParsedBorder[]
    shadows?: ParsedShadow[]
    opacity?: number
  }
  children: ParsedElement[]
  componentInfo?: {
    componentId: string
    isMainComponent: boolean
    properties?: Record<string, any>
  }
}

export interface ParsedElement {
  id: string
  name: string
  type: "text" | "shape" | "image" | "container"
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  styling: ElementStyling
  content?: string
  children?: ParsedElement[]
}

export interface ElementStyling {
  backgroundColor?: string
  color?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: number
  textAlign?: "left" | "center" | "right" | "justify"
  borderRadius?: number | number[]
  borders?: ParsedBorder[]
  shadows?: ParsedShadow[]
  opacity?: number
  transform?: string
}

export interface ParsedBorder {
  width: number
  style: "solid" | "dashed" | "dotted"
  color: string
}

export interface ParsedShadow {
  type: "drop" | "inner" | "blur"
  x: number
  y: number
  blur: number
  spread?: number
  color: string
}

export interface ParsedComponent {
  id: string
  name: string
  description?: string
  category: string
  frame: ParsedFrame
  variants?: ParsedComponentVariant[]
}

export interface ParsedComponentVariant {
  id: string
  name: string
  properties: Record<string, string>
  frame: ParsedFrame
}

export interface ParsedStyleSystem {
  colors: ParsedColorToken[]
  typography: ParsedTypographyToken[]
  spacing: ParsedSpacingToken[]
  effects: ParsedEffectToken[]
}

export interface ParsedColorToken {
  id: string
  name: string
  value: string
  description?: string
  usage: "primary" | "secondary" | "accent" | "neutral" | "semantic"
}

export interface ParsedTypographyToken {
  id: string
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing?: number
  description?: string
  usage: "heading" | "body" | "caption" | "button" | "label"
}

export interface ParsedSpacingToken {
  id: string
  name: string
  value: number
  description?: string
  usage: "margin" | "padding" | "gap"
}

export interface ParsedEffectToken {
  id: string
  name: string
  type: "shadow" | "blur"
  properties: Record<string, any>
  description?: string
}

export interface ParsedAsset {
  id: string
  name: string
  type: "image" | "icon" | "illustration"
  url?: string
  format: "png" | "jpg" | "svg"
  size: {
    width: number
    height: number
  }
}

export class FigmaDesignParser {
  parse(figmaFile: FigmaFileResponse): ParsedFigmaDesign {
    console.log(`🔍 Parsing Figma file: ${figmaFile.name}`)

    const startTime = Date.now()

    try {
      const parsed: ParsedFigmaDesign = {
        name: figmaFile.name,
        pages: this.parsePages(figmaFile.document.children),
        components: this.parseComponents(figmaFile.components),
        styles: this.parseStyleSystem(figmaFile.styles, figmaFile.document),
        assets: this.parseAssets(figmaFile.document),
        metadata: {
          version: figmaFile.version,
          lastModified: figmaFile.lastModified,
          nodeCount: this.countNodes(figmaFile.document),
          componentCount: Object.keys(figmaFile.components || {}).length,
        },
      }

      const duration = Date.now() - startTime
      console.log(`✅ Successfully parsed Figma file in ${duration}ms`)
      console.log(`📊 Parsed ${parsed.pages.length} pages, ${parsed.components.length} components`)

      return parsed
    } catch (error) {
      console.error(`❌ Failed to parse Figma file:`, error)
      throw new Error(`Figma parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private parsePages(pages: any[]): ParsedPage[] {
    return pages.map((page) => ({
      id: page.id,
      name: page.name,
      frames: this.parseFrames(page.children || []),
      backgroundColor: page.backgroundColor ? this.colorToString(page.backgroundColor) : undefined,
    }))
  }

  private parseFrames(frames: any[]): ParsedFrame[] {
    return frames
      .filter((frame) => frame.type === "FRAME" || frame.type === "COMPONENT" || frame.type === "INSTANCE")
      .map((frame) => this.parseFrame(frame))
  }

  private parseFrame(frame: FigmaFrameNode): ParsedFrame {
    return {
      id: frame.id,
      name: frame.name,
      type: this.mapFrameType(frame.type),
      bounds: {
        x: frame.absoluteBoundingBox.x,
        y: frame.absoluteBoundingBox.y,
        width: frame.absoluteBoundingBox.width,
        height: frame.absoluteBoundingBox.height,
      },
      layout: this.parseLayout(frame),
      styling: this.parseFrameStyling(frame),
      children: this.parseElements(frame.children || []),
      componentInfo: frame.componentId
        ? {
            componentId: frame.componentId,
            isMainComponent: frame.type === "COMPONENT",
            properties: frame.componentProperties,
          }
        : undefined,
    }
  }

  private parseLayout(frame: FigmaFrameNode) {
    const layout: ParsedFrame["layout"] = {
      mode: (frame.layoutMode?.toLowerCase() as any) || "none",
    }

    if (frame.layoutMode && frame.layoutMode !== "NONE") {
      layout.direction = frame.layoutMode === "HORIZONTAL" ? "row" : "column"
      layout.gap = frame.itemSpacing || 0

      if (frame.paddingLeft || frame.paddingRight || frame.paddingTop || frame.paddingBottom) {
        layout.padding = {
          top: frame.paddingTop || 0,
          right: frame.paddingRight || 0,
          bottom: frame.paddingBottom || 0,
          left: frame.paddingLeft || 0,
        }
      }

      layout.alignment = {
        main: this.mapMainAxisAlignment(frame.primaryAxisAlignItems),
        cross: this.mapCrossAxisAlignment(frame.counterAxisAlignItems),
      }
    }

    return layout
  }

  private parseFrameStyling(frame: FigmaFrameNode) {
    const styling: ParsedFrame["styling"] = {}

    if (frame.fills && frame.fills.length > 0) {
      const primaryFill = frame.fills[0]
      if (primaryFill.type === "SOLID" && primaryFill.color) {
        styling.backgroundColor = this.colorToString(primaryFill.color, primaryFill.opacity)
      }
    }

    if (frame.cornerRadius !== undefined) {
      styling.borderRadius = Array.isArray(frame.cornerRadius) ? frame.cornerRadius : frame.cornerRadius
    }

    if (frame.strokes && frame.strokes.length > 0) {
      styling.borders = frame.strokes.map((stroke) => ({
        width: frame.strokeWeight || 1,
        style: "solid" as const,
        color: stroke.color ? this.colorToString(stroke.color, stroke.opacity) : "#000000",
      }))
    }

    if (frame.effects && frame.effects.length > 0) {
      styling.shadows = frame.effects
        .filter((effect) => effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW")
        .map((effect) => ({
          type: effect.type === "DROP_SHADOW" ? ("drop" as const) : ("inner" as const),
          x: effect.offset?.x || 0,
          y: effect.offset?.y || 0,
          blur: effect.radius,
          spread: effect.spread || 0,
          color: effect.color ? this.colorToString(effect.color) : "rgba(0,0,0,0.25)",
        }))
    }

    if (frame.opacity !== undefined && frame.opacity < 1) {
      styling.opacity = frame.opacity
    }

    return styling
  }

  private parseElements(nodes: FigmaNode[]): ParsedElement[] {
    return nodes.map((node) => this.parseElement(node)).filter(Boolean) as ParsedElement[]
  }

  private parseElement(node: FigmaNode): ParsedElement | null {
    const baseElement = {
      id: node.id,
      name: node.name,
      bounds: {
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
      },
    }

    switch (node.type) {
      case "TEXT":
        return {
          ...baseElement,
          type: "text",
          content: (node as FigmaTextNode).characters,
          styling: this.parseTextStyling(node as FigmaTextNode),
        }

      case "FRAME":
      case "GROUP":
        return {
          ...baseElement,
          type: "container",
          styling: this.parseElementStyling(node),
          children: this.parseElements((node as FigmaFrameNode).children || []),
        }

      case "RECTANGLE":
      case "ELLIPSE":
      case "VECTOR":
      case "STAR":
      case "POLYGON":
        return {
          ...baseElement,
          type: "shape",
          styling: this.parseElementStyling(node),
        }

      default:
        console.warn(`⚠️ Unsupported node type: ${node.type}`)
        return null
    }
  }

  private parseTextStyling(textNode: FigmaTextNode): ElementStyling {
    const styling: ElementStyling = {}

    if (textNode.style) {
      styling.fontFamily = textNode.style.fontFamily
      styling.fontSize = textNode.style.fontSize
      styling.fontWeight = textNode.style.fontWeight

      if (textNode.style.textAlignHorizontal) {
        styling.textAlign = textNode.style.textAlignHorizontal.toLowerCase() as any
      }
    }

    if (textNode.fills && textNode.fills.length > 0) {
      const primaryFill = textNode.fills[0]
      if (primaryFill.type === "SOLID" && primaryFill.color) {
        styling.color = this.colorToString(primaryFill.color, primaryFill.opacity)
      }
    }

    return styling
  }

  private parseElementStyling(node: FigmaNode): ElementStyling {
    const styling: ElementStyling = {}

    if ("fills" in node && node.fills && node.fills.length > 0) {
      const primaryFill = node.fills[0]
      if (primaryFill.type === "SOLID" && primaryFill.color) {
        styling.backgroundColor = this.colorToString(primaryFill.color, primaryFill.opacity)
      }
    }

    if ("cornerRadius" in node && node.cornerRadius !== undefined) {
      styling.borderRadius = Array.isArray(node.cornerRadius) ? node.cornerRadius : node.cornerRadius
    }

    if ("opacity" in node && node.opacity !== undefined && node.opacity < 1) {
      styling.opacity = node.opacity
    }

    return styling
  }

  private parseComponents(components: Record<string, any>): ParsedComponent[] {
    return Object.entries(components || {}).map(([key, component]) => ({
      id: key,
      name: component.name,
      description: component.description,
      category: this.categorizeComponent(component.name),
      frame: {} as ParsedFrame, // Would need to find the actual frame in the document
      variants: [],
    }))
  }

  private parseStyleSystem(styles: Record<string, any>, document: any): ParsedStyleSystem {
    // Extract colors from fills throughout the document
    const colors = this.extractColors(document)

    // Extract typography from text styles
    const typography = this.extractTypography(document)

    // Extract spacing patterns
    const spacing = this.extractSpacing(document)

    // Extract effects
    const effects = this.extractEffects(document)

    return { colors, typography, spacing, effects }
  }

  private parseAssets(document: any): ParsedAsset[] {
    // This would extract images and other assets from the document
    // For now, return empty array
    return []
  }

  // Helper methods
  private mapFrameType(type: string): ParsedFrame["type"] {
    switch (type) {
      case "COMPONENT":
        return "component"
      case "INSTANCE":
        return "instance"
      case "GROUP":
        return "group"
      default:
        return "frame"
    }
  }

  private mapMainAxisAlignment(alignment?: string): ParsedFrame["layout"]["alignment"]["main"] {
    switch (alignment) {
      case "CENTER":
        return "center"
      case "MAX":
        return "end"
      case "SPACE_BETWEEN":
        return "space-between"
      default:
        return "start"
    }
  }

  private mapCrossAxisAlignment(alignment?: string): ParsedFrame["layout"]["alignment"]["cross"] {
    switch (alignment) {
      case "CENTER":
        return "center"
      case "MAX":
        return "end"
      default:
        return "start"
    }
  }

  private colorToString(color: FigmaColor, opacity?: number): string {
    const alpha = opacity !== undefined ? opacity : color.a
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  private categorizeComponent(name: string): string {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("button")) return "Button"
    if (lowerName.includes("card")) return "Card"
    if (lowerName.includes("input") || lowerName.includes("form")) return "Form"
    if (lowerName.includes("nav") || lowerName.includes("header")) return "Navigation"
    if (lowerName.includes("modal") || lowerName.includes("dialog")) return "Modal"
    if (lowerName.includes("table") || lowerName.includes("list")) return "Data Display"

    return "General"
  }

  private extractColors(document: any): ParsedColorToken[] {
    // Implementation would traverse the document and extract unique colors
    return []
  }

  private extractTypography(document: any): ParsedTypographyToken[] {
    // Implementation would traverse the document and extract text styles
    return []
  }

  private extractSpacing(document: any): ParsedSpacingToken[] {
    // Implementation would analyze spacing patterns
    return []
  }

  private extractEffects(document: any): ParsedEffectToken[] {
    // Implementation would extract shadow and blur effects
    return []
  }

  private countNodes(node: any): number {
    let count = 1
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child)
      }
    }
    return count
  }
}

export const figmaParser = new FigmaDesignParser()
