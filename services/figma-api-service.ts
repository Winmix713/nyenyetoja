import { FIGMA_CONFIG, type FigmaFileResponse } from "@/lib/figma-config"

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  fills?: any[]
  strokes?: any[]
  effects?: any[]
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  constraints?: any
  layoutMode?: string
  primaryAxisSizingMode?: string
  counterAxisSizingMode?: string
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  itemSpacing?: number
  backgroundColor?: any
  cornerRadius?: number
  characters?: string
  style?: any
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  componentSetId?: string
  documentationLinks: any[]
}

export class FigmaApiService {
  private static getToken(): string {
    return localStorage.getItem(FIGMA_CONFIG.STORAGE_KEY) || FIGMA_CONFIG.TOKEN
  }

  static async fetchFileData(fileKey: string): Promise<{
    file: FigmaFileResponse
    nodes: FigmaNode[]
    components: FigmaComponent[]
  }> {
    const token = this.getToken()

    try {
      // Fetch main file data
      const fileResponse = await fetch(`${FIGMA_CONFIG.API_BASE_URL}/files/${fileKey}`, {
        headers: { "X-Figma-Token": token },
      })

      if (!fileResponse.ok) {
        throw new Error(`Figma API error: ${fileResponse.status}`)
      }

      const fileData: FigmaFileResponse = await fileResponse.json()

      // Extract and process nodes
      const nodes = this.extractNodes(fileData.document)

      // Get components
      const components = Object.entries(fileData.components || {}).map(([key, component]: [string, any]) => ({
        key,
        name: component.name,
        description: component.description || "",
        componentSetId: component.componentSetId,
        documentationLinks: component.documentationLinks || [],
      }))

      console.log("✅ Figma file data fetched:", {
        name: fileData.name,
        nodeCount: nodes.length,
        componentCount: components.length,
      })

      return { file: fileData, nodes, components }
    } catch (error) {
      console.error("❌ Error fetching Figma file data:", error)
      throw error
    }
  }

  static async fetchNodeImages(fileKey: string, nodeIds: string[]): Promise<Record<string, string>> {
    const token = this.getToken()

    try {
      const response = await fetch(
        `${FIGMA_CONFIG.API_BASE_URL}/images/${fileKey}?ids=${nodeIds.join(",")}&format=png&scale=2`,
        {
          headers: { "X-Figma-Token": token },
        },
      )

      if (!response.ok) {
        throw new Error(`Figma Images API error: ${response.status}`)
      }

      const data = await response.json()
      return data.images || {}
    } catch (error) {
      console.error("❌ Error fetching node images:", error)
      return {}
    }
  }

  private static extractNodes(node: any, depth = 0): FigmaNode[] {
    const nodes: FigmaNode[] = []

    const processedNode: FigmaNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      absoluteBoundingBox: node.absoluteBoundingBox,
      fills: node.fills,
      strokes: node.strokes,
      effects: node.effects,
      constraints: node.constraints,
      layoutMode: node.layoutMode,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom,
      itemSpacing: node.itemSpacing,
      backgroundColor: node.backgroundColor,
      cornerRadius: node.cornerRadius,
      characters: node.characters,
      style: node.style,
    }

    nodes.push(processedNode)

    if (node.children && depth < 10) {
      processedNode.children = []
      for (const child of node.children) {
        const childNodes = this.extractNodes(child, depth + 1)
        processedNode.children.push(...childNodes)
        nodes.push(...childNodes)
      }
    }

    return nodes
  }

  static generateCSS(nodes: FigmaNode[]): string {
    let css = "/* Generated from Figma */\n\n"

    for (const node of nodes) {
      if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
        css += this.generateNodeCSS(node)
      }
    }

    return css
  }

  private static generateNodeCSS(node: FigmaNode): string {
    const className = this.sanitizeClassName(node.name)
    let css = `.${className} {\n`

    // Layout properties
    if (node.absoluteBoundingBox) {
      css += `  width: ${node.absoluteBoundingBox.width}px;\n`
      css += `  height: ${node.absoluteBoundingBox.height}px;\n`
    }

    // Layout mode (Flexbox)
    if (node.layoutMode === "HORIZONTAL") {
      css += `  display: flex;\n`
      css += `  flex-direction: row;\n`
    } else if (node.layoutMode === "VERTICAL") {
      css += `  display: flex;\n`
      css += `  flex-direction: column;\n`
    }

    // Padding
    if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
      css += `  padding: ${node.paddingTop || 0}px ${node.paddingRight || 0}px ${node.paddingBottom || 0}px ${node.paddingLeft || 0}px;\n`
    }

    // Gap
    if (node.itemSpacing) {
      css += `  gap: ${node.itemSpacing}px;\n`
    }

    // Background
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0]
      if (fill.type === "SOLID") {
        const { r, g, b, a = 1 } = fill.color
        css += `  background-color: rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a});\n`
      }
    }

    // Border radius
    if (node.cornerRadius) {
      css += `  border-radius: ${node.cornerRadius}px;\n`
    }

    css += "}\n\n"
    return css
  }

  private static sanitizeClassName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }
}
