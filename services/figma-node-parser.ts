import type {
  FigmaDocumentNode,
  FigmaFrameNode,
  FigmaTextNode,
  FigmaNode,
  FigmaColor,
  FigmaEffect,
  FigmaTextStyle,
} from "@/lib/figma-api-types"

export interface ParsedDocument {
  id: string
  name: string
  pages: ParsedPage[]
  components: ParsedComponent[]
  styles: ParsedStyle[]
  metadata: DocumentMetadata
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
  children: ParsedElement[]
  styles: ComputedStyles
  layout: LayoutProperties
  bounds: BoundingBox
  isComponent: boolean
  componentId?: string
}

export interface ParsedElement {
  id: string
  name: string
  type: "text" | "vector" | "frame" | "image"
  content?: string
  styles: ComputedStyles
  bounds: BoundingBox
  children?: ParsedElement[]
  imageUrl?: string
  svgContent?: string
}

export interface ComputedStyles {
  backgroundColor?: string
  color?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: number
  lineHeight?: number
  letterSpacing?: number
  textAlign?: string
  padding?: Spacing
  margin?: Spacing
  borderRadius?: number | number[]
  border?: BorderStyle
  boxShadow?: string[]
  opacity?: number
  display?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  gap?: number
  width?: number | string
  height?: number | string
  position?: string
  top?: number
  left?: number
  zIndex?: number
}

export interface LayoutProperties {
  mode: "none" | "horizontal" | "vertical"
  primaryAxisSizing: "fixed" | "auto"
  counterAxisSizing: "fixed" | "auto"
  primaryAxisAlignment: "min" | "center" | "max" | "space-between"
  counterAxisAlignment: "min" | "center" | "max"
  padding: Spacing
  gap: number
}

export interface Spacing {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface BorderStyle {
  width: number
  style: string
  color: string
}

export interface ParsedComponent {
  id: string
  name: string
  description: string
  category: string
  props: ComponentProperty[]
  variants: ComponentVariant[]
}

export interface ComponentProperty {
  name: string
  type: "text" | "boolean" | "variant" | "instance"
  defaultValue: any
  description?: string
}

export interface ComponentVariant {
  name: string
  properties: Record<string, any>
  nodeId: string
}

export interface ParsedStyle {
  id: string
  name: string
  type: "fill" | "text" | "effect" | "grid"
  properties: Record<string, any>
}

export interface DocumentMetadata {
  version: string
  lastModified: string
  totalNodes: number
  totalComponents: number
  totalStyles: number
  complexity: "simple" | "medium" | "complex"
}

export class FigmaNodeParser {
  private static nodeCount = 0
  private static componentCount = 0
  private static styleCount = 0

  static parseDocument(document: FigmaDocumentNode): ParsedDocument {
    console.log(`🔍 Parsing document: ${document.name}`)

    this.nodeCount = 0
    this.componentCount = 0
    this.styleCount = 0

    const pages = document.children.map((page) => this.parsePage(page))
    const components = this.extractComponents(document)
    const styles = this.extractStyles(document)

    const complexity = this.calculateComplexity(this.nodeCount, this.componentCount)

    return {
      id: document.id,
      name: document.name,
      pages,
      components,
      styles,
      metadata: {
        version: "1.0",
        lastModified: new Date().toISOString(),
        totalNodes: this.nodeCount,
        totalComponents: this.componentCount,
        totalStyles: this.styleCount,
        complexity,
      },
    }
  }

  private static parsePage(page: any): ParsedPage {
    console.log(`📄 Parsing page: ${page.name}`)

    return {
      id: page.id,
      name: page.name,
      frames: page.children?.map((frame: any) => this.parseFrame(frame)) || [],
      backgroundColor: page.backgroundColor ? this.colorToHex(page.backgroundColor) : undefined,
    }
  }

  static parseFrame(frame: FigmaFrameNode): ParsedFrame {
    this.nodeCount++

    const children = frame.children?.map((child) => this.parseElement(child)) || []
    const styles = this.extractFrameStyles(frame)
    const layout = this.extractLayoutProperties(frame)
    const bounds = this.extractBounds(frame)

    return {
      id: frame.id,
      name: frame.name,
      type: frame.type.toLowerCase() as "frame" | "component" | "instance" | "group",
      children,
      styles,
      layout,
      bounds,
      isComponent: frame.type === "COMPONENT",
      componentId: frame.componentId,
    }
  }

  private static parseElement(node: FigmaNode): ParsedElement {
    this.nodeCount++

    const bounds = this.extractBounds(node)
    const styles = this.extractElementStyles(node)

    const baseElement: ParsedElement = {
      id: node.id,
      name: node.name,
      type: this.getElementType(node),
      styles,
      bounds,
    }

    // Type-specific parsing
    if (node.type === "TEXT") {
      const textNode = node as FigmaTextNode
      return {
        ...baseElement,
        type: "text",
        content: textNode.characters,
        styles: {
          ...styles,
          ...this.extractTextStyles(textNode.style),
        },
      }
    }

    if (node.type === "FRAME" || node.type === "GROUP") {
      const frameNode = node as FigmaFrameNode
      return {
        ...baseElement,
        type: "frame",
        children: frameNode.children?.map((child) => this.parseElement(child)) || [],
      }
    }

    if (this.isVectorNode(node)) {
      return {
        ...baseElement,
        type: "vector",
        svgContent: this.generateSvgPlaceholder(node),
      }
    }

    return baseElement
  }

  private static extractFrameStyles(frame: FigmaFrameNode): ComputedStyles {
    const styles: ComputedStyles = {}

    // Background
    if (frame.backgroundColor) {
      styles.backgroundColor = this.colorToHex(frame.backgroundColor)
    }

    if (frame.fills && frame.fills.length > 0) {
      const fill = frame.fills[0]
      if (fill.type === "SOLID" && fill.color) {
        styles.backgroundColor = this.colorToHex(fill.color, fill.opacity)
      }
    }

    // Layout
    if (frame.layoutMode) {
      styles.display = "flex"
      styles.flexDirection = frame.layoutMode === "HORIZONTAL" ? "row" : "column"
    }

    if (frame.primaryAxisAlignItems) {
      styles.justifyContent = this.mapAlignment(frame.primaryAxisAlignItems)
    }

    if (frame.counterAxisAlignItems) {
      styles.alignItems = this.mapAlignment(frame.counterAxisAlignItems)
    }

    // Spacing
    if (frame.itemSpacing) {
      styles.gap = frame.itemSpacing
    }

    // Padding
    if (frame.paddingLeft || frame.paddingRight || frame.paddingTop || frame.paddingBottom) {
      styles.padding = {
        top: frame.paddingTop || 0,
        right: frame.paddingRight || 0,
        bottom: frame.paddingBottom || 0,
        left: frame.paddingLeft || 0,
      }
    }

    // Border radius
    if (frame.cornerRadius) {
      styles.borderRadius = Array.isArray(frame.cornerRadius) ? frame.cornerRadius : frame.cornerRadius
    }

    // Effects (shadows)
    if (frame.effects && frame.effects.length > 0) {
      styles.boxShadow = frame.effects
        .filter((effect) => effect.type === "DROP_SHADOW" && effect.visible !== false)
        .map((effect) => this.effectToBoxShadow(effect))
    }

    // Opacity
    if (frame.opacity !== undefined && frame.opacity < 1) {
      styles.opacity = frame.opacity
    }

    return styles
  }

  private static extractElementStyles(node: FigmaNode): ComputedStyles {
    const styles: ComputedStyles = {}

    // Common properties
    if (node.opacity !== undefined && node.opacity < 1) {
      styles.opacity = node.opacity
    }

    // Fills
    if ("fills" in node && node.fills && node.fills.length > 0) {
      const fill = node.fills[0]
      if (fill.type === "SOLID" && fill.color) {
        if (node.type === "TEXT") {
          styles.color = this.colorToHex(fill.color, fill.opacity)
        } else {
          styles.backgroundColor = this.colorToHex(fill.color, fill.opacity)
        }
      }
    }

    // Strokes (borders)
    if ("strokes" in node && node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const stroke = node.strokes[0]
      if (stroke.type === "SOLID" && stroke.color) {
        styles.border = {
          width: node.strokeWeight,
          style: "solid",
          color: this.colorToHex(stroke.color, stroke.opacity),
        }
      }
    }

    // Corner radius for vectors
    if ("cornerRadius" in node && node.cornerRadius) {
      styles.borderRadius = Array.isArray(node.cornerRadius) ? node.cornerRadius : node.cornerRadius
    }

    return styles
  }

  private static extractTextStyles(textStyle: FigmaTextStyle): Partial<ComputedStyles> {
    return {
      fontFamily: textStyle.fontFamily,
      fontSize: textStyle.fontSize,
      fontWeight: textStyle.fontWeight,
      lineHeight: textStyle.lineHeightPx || textStyle.fontSize * 1.2,
      letterSpacing: textStyle.letterSpacing,
      textAlign: textStyle.textAlignHorizontal?.toLowerCase() as any,
    }
  }

  private static extractLayoutProperties(frame: FigmaFrameNode): LayoutProperties {
    return {
      mode: (frame.layoutMode?.toLowerCase() as "none" | "horizontal" | "vertical") || "none",
      primaryAxisSizing: (frame.primaryAxisSizingMode?.toLowerCase() as "fixed" | "auto") || "fixed",
      counterAxisSizing: (frame.counterAxisSizingMode?.toLowerCase() as "fixed" | "auto") || "fixed",
      primaryAxisAlignment: (frame.primaryAxisAlignItems?.toLowerCase() as any) || "min",
      counterAxisAlignment: (frame.counterAxisAlignItems?.toLowerCase() as any) || "min",
      padding: {
        top: frame.paddingTop || 0,
        right: frame.paddingRight || 0,
        bottom: frame.paddingBottom || 0,
        left: frame.paddingLeft || 0,
      },
      gap: frame.itemSpacing || 0,
    }
  }

  private static extractBounds(node: FigmaNode): BoundingBox {
    if ("absoluteBoundingBox" in node && node.absoluteBoundingBox) {
      return {
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
      }
    }
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  private static extractComponents(document: FigmaDocumentNode): ParsedComponent[] {
    const components: ParsedComponent[] = []

    const traverseForComponents = (node: any) => {
      if (node.type === "COMPONENT") {
        this.componentCount++
        components.push({
          id: node.id,
          name: node.name,
          description: node.description || "",
          category: this.categorizeComponent(node.name),
          props: this.extractComponentProperties(node),
          variants: [],
        })
      }

      if (node.children) {
        node.children.forEach(traverseForComponents)
      }
    }

    document.children.forEach(traverseForComponents)
    return components
  }

  private static extractStyles(document: FigmaDocumentNode): ParsedStyle[] {
    // This would extract global styles from the document
    // For now, return empty array as styles are typically in the styles property
    return []
  }

  // Utility methods
  private static colorToHex(color: FigmaColor, opacity?: number): string {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    const a = opacity !== undefined ? opacity : color.a

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  private static mapAlignment(alignment: string): string {
    const alignmentMap: Record<string, string> = {
      MIN: "flex-start",
      CENTER: "center",
      MAX: "flex-end",
      SPACE_BETWEEN: "space-between",
    }
    return alignmentMap[alignment] || "flex-start"
  }

  private static effectToBoxShadow(effect: FigmaEffect): string {
    const { offset, radius, color, spread } = effect
    const x = offset?.x || 0
    const y = offset?.y || 0
    const blur = radius
    const spreadValue = spread || 0
    const colorValue = color ? this.colorToHex(color) : "rgba(0,0,0,0.25)"

    return `${x}px ${y}px ${blur}px ${spreadValue}px ${colorValue}`
  }

  private static getElementType(node: FigmaNode): "text" | "vector" | "frame" | "image" {
    if (node.type === "TEXT") return "text"
    if (node.type === "FRAME" || node.type === "GROUP") return "frame"
    if (this.isVectorNode(node)) return "vector"
    return "frame"
  }

  private static isVectorNode(node: FigmaNode): boolean {
    return ["VECTOR", "STAR", "LINE", "ELLIPSE", "POLYGON", "RECTANGLE"].includes(node.type)
  }

  private static generateSvgPlaceholder(node: FigmaNode): string {
    const bounds = this.extractBounds(node)
    return `<svg width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">
      <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="12" fill="#666">${node.type}</text>
    </svg>`
  }

  private static categorizeComponent(name: string): string {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("button")) return "buttons"
    if (lowerName.includes("input") || lowerName.includes("field")) return "forms"
    if (lowerName.includes("card")) return "cards"
    if (lowerName.includes("modal") || lowerName.includes("dialog")) return "overlays"
    if (lowerName.includes("nav") || lowerName.includes("menu")) return "navigation"
    return "general"
  }

  private static extractComponentProperties(node: any): ComponentProperty[] {
    // Extract component properties from componentProperties
    const props: ComponentProperty[] = []

    if (node.componentProperties) {
      Object.entries(node.componentProperties).forEach(([key, value]: [string, any]) => {
        props.push({
          name: key,
          type: this.inferPropertyType(value),
          defaultValue: value.defaultValue || value.value,
          description: value.description,
        })
      })
    }

    return props
  }

  private static inferPropertyType(property: any): "text" | "boolean" | "variant" | "instance" {
    if (typeof property.defaultValue === "boolean") return "boolean"
    if (typeof property.defaultValue === "string") return "text"
    if (property.type === "VARIANT") return "variant"
    if (property.type === "INSTANCE_SWAP") return "instance"
    return "text"
  }

  private static calculateComplexity(nodeCount: number, componentCount: number): "simple" | "medium" | "complex" {
    const score = nodeCount + componentCount * 5
    if (score < 50) return "simple"
    if (score < 200) return "medium"
    return "complex"
  }

  // CSS Generation
  static generateCSS(element: ParsedElement, className?: string): string {
    const styles = element.styles
    const cssClass = className || `.${element.name.toLowerCase().replace(/\s+/g, "-")}`

    let css = `${cssClass} {\n`

    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined) {
        const cssProperty = this.camelToKebab(property)
        const cssValue = this.formatCssValue(property, value)
        css += `  ${cssProperty}: ${cssValue};\n`
      }
    })

    css += `}\n`
    return css
  }

  private static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
  }

  private static formatCssValue(property: string, value: any): string {
    if (typeof value === "number") {
      // Properties that need px units
      if (["fontSize", "lineHeight", "letterSpacing", "gap", "top", "left", "width", "height"].includes(property)) {
        return `${value}px`
      }
      return value.toString()
    }

    if (typeof value === "object") {
      if (property === "padding" || property === "margin") {
        const spacing = value as Spacing
        return `${spacing.top}px ${spacing.right}px ${spacing.bottom}px ${spacing.left}px`
      }

      if (property === "border") {
        const border = value as BorderStyle
        return `${border.width}px ${border.style} ${border.color}`
      }

      if (property === "borderRadius" && Array.isArray(value)) {
        return value.map((v) => `${v}px`).join(" ")
      }

      if (property === "boxShadow" && Array.isArray(value)) {
        return value.join(", ")
      }
    }

    return value.toString()
  }
}
