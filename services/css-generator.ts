import type { ParsedFigmaDesign, ParsedFrame, ParsedElement } from "./figma-parser"

export interface CSSGenerationOptions {
  framework: "tailwind" | "css-modules" | "styled-components" | "vanilla-css"
  responsive: boolean
  prefix?: string
  minify: boolean
  includeVariables: boolean
  browserSupport: "modern" | "legacy"
}

export interface GeneratedCSS {
  main: string
  variables: string
  components: Record<string, string>
  utilities: string
  responsive: string
  metadata: {
    classCount: number
    variableCount: number
    size: number
    framework: string
  }
}

export interface CSSClass {
  name: string
  properties: Record<string, string>
  responsive?: Record<string, Record<string, string>>
  pseudo?: Record<string, Record<string, string>>
}

export interface CSSVariable {
  name: string
  value: string
  category: "color" | "spacing" | "typography" | "shadow" | "border" | "animation"
  description?: string
}

export class CSSGenerator {
  private options: CSSGenerationOptions
  private variables: CSSVariable[] = []
  private classes: CSSClass[] = []
  private utilities: CSSClass[] = []

  constructor(options: CSSGenerationOptions) {
    this.options = options
  }

  generate(design: ParsedFigmaDesign): GeneratedCSS {
    console.log(`🎨 Generating CSS for: ${design.name}`)
    const startTime = Date.now()

    try {
      // Reset state
      this.variables = []
      this.classes = []
      this.utilities = []

      // Step 1: Extract design tokens
      this.extractDesignTokens(design)

      // Step 2: Generate component styles
      const componentStyles = this.generateComponentStyles(design)

      // Step 3: Generate utility classes
      const utilityStyles = this.generateUtilityClasses()

      // Step 4: Generate responsive styles
      const responsiveStyles = this.generateResponsiveStyles()

      // Step 5: Generate CSS variables
      const variableStyles = this.generateCSSVariables()

      // Step 6: Combine and format
      const result = this.combineStyles({
        variables: variableStyles,
        components: componentStyles,
        utilities: utilityStyles,
        responsive: responsiveStyles,
      })

      const duration = Date.now() - startTime
      console.log(`✅ CSS generation completed in ${duration}ms`)
      console.log(`📊 Generated ${this.classes.length} classes, ${this.variables.length} variables`)

      return result
    } catch (error) {
      console.error(`❌ CSS generation failed:`, error)
      throw new Error(`CSS generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private extractDesignTokens(design: ParsedFigmaDesign): void {
    console.log(`🔍 Extracting design tokens...`)

    // Extract colors
    this.extractColors(design)

    // Extract spacing
    this.extractSpacing(design)

    // Extract typography
    this.extractTypography(design)

    // Extract shadows and effects
    this.extractEffects(design)

    // Extract border radius values
    this.extractBorderRadius(design)

    console.log(`✅ Extracted ${this.variables.length} design tokens`)
  }

  private extractColors(design: ParsedFigmaDesign): void {
    const colors = new Set<string>()

    // Traverse all elements to find unique colors
    design.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        this.collectColorsFromFrame(frame, colors)
      })
    })

    // Convert to CSS variables
    Array.from(colors).forEach((color, index) => {
      const name = this.generateColorVariableName(color, index)
      this.variables.push({
        name,
        value: color,
        category: "color",
        description: `Color token ${index + 1}`,
      })
    })
  }

  private collectColorsFromFrame(frame: ParsedFrame, colors: Set<string>): void {
    if (frame.styling.backgroundColor) {
      colors.add(frame.styling.backgroundColor)
    }

    frame.children.forEach((element) => {
      this.collectColorsFromElement(element, colors)
    })
  }

  private collectColorsFromElement(element: ParsedElement, colors: Set<string>): void {
    if (element.styling.backgroundColor) {
      colors.add(element.styling.backgroundColor)
    }
    if (element.styling.color) {
      colors.add(element.styling.color)
    }

    element.children?.forEach((child) => {
      this.collectColorsFromElement(child, colors)
    })
  }

  private extractSpacing(design: ParsedFigmaDesign): void {
    const spacingValues = new Set<number>()

    design.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        // Collect padding values
        if (frame.layout.padding) {
          Object.values(frame.layout.padding).forEach((value) => spacingValues.add(value))
        }

        // Collect gap values
        if (frame.layout.gap) {
          spacingValues.add(frame.layout.gap)
        }
      })
    })

    // Generate spacing scale
    const sortedSpacing = Array.from(spacingValues).sort((a, b) => a - b)
    sortedSpacing.forEach((value, index) => {
      this.variables.push({
        name: `--spacing-${index}`,
        value: `${value}px`,
        category: "spacing",
        description: `Spacing value ${value}px`,
      })
    })
  }

  private extractTypography(design: ParsedFigmaDesign): void {
    const fontSizes = new Set<number>()
    const fontFamilies = new Set<string>()
    const fontWeights = new Set<number>()

    design.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        this.collectTypographyFromFrame(frame, { fontSizes, fontFamilies, fontWeights })
      })
    })

    // Generate typography variables
    Array.from(fontFamilies).forEach((family, index) => {
      this.variables.push({
        name: `--font-family-${index}`,
        value: family,
        category: "typography",
        description: `Font family: ${family}`,
      })
    })

    Array.from(fontSizes)
      .sort((a, b) => a - b)
      .forEach((size, index) => {
        this.variables.push({
          name: `--font-size-${index}`,
          value: `${size}px`,
          category: "typography",
          description: `Font size: ${size}px`,
        })
      })

    Array.from(fontWeights)
      .sort((a, b) => a - b)
      .forEach((weight, index) => {
        this.variables.push({
          name: `--font-weight-${index}`,
          value: weight.toString(),
          category: "typography",
          description: `Font weight: ${weight}`,
        })
      })
  }

  private collectTypographyFromFrame(frame: ParsedFrame, collections: any): void {
    frame.children.forEach((element) => {
      if (element.type === "text" && element.styling) {
        if (element.styling.fontSize) collections.fontSizes.add(element.styling.fontSize)
        if (element.styling.fontFamily) collections.fontFamilies.add(element.styling.fontFamily)
        if (element.styling.fontWeight) collections.fontWeights.add(element.styling.fontWeight)
      }

      element.children?.forEach((child) => {
        this.collectTypographyFromFrame({ children: [child] } as ParsedFrame, collections)
      })
    })
  }

  private extractEffects(design: ParsedFigmaDesign): void {
    const shadows = new Set<string>()

    design.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        if (frame.styling.shadows) {
          frame.styling.shadows.forEach((shadow) => {
            const shadowValue = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread || 0}px ${shadow.color}`
            shadows.add(shadowValue)
          })
        }
      })
    })

    Array.from(shadows).forEach((shadow, index) => {
      this.variables.push({
        name: `--shadow-${index}`,
        value: shadow,
        category: "shadow",
        description: `Box shadow ${index + 1}`,
      })
    })
  }

  private extractBorderRadius(design: ParsedFigmaDesign): void {
    const radiusValues = new Set<number>()

    design.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        if (typeof frame.styling.borderRadius === "number") {
          radiusValues.add(frame.styling.borderRadius)
        }
      })
    })

    Array.from(radiusValues)
      .sort((a, b) => a - b)
      .forEach((radius, index) => {
        this.variables.push({
          name: `--border-radius-${index}`,
          value: `${radius}px`,
          category: "border",
          description: `Border radius: ${radius}px`,
        })
      })
  }

  private generateComponentStyles(design: ParsedFigmaDesign): Record<string, string> {
    const componentStyles: Record<string, string> = {}

    design.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        const className = this.generateClassName(frame.name)
        const css = this.generateFrameCSS(frame)
        componentStyles[className] = css
      })
    })

    return componentStyles
  }

  private generateFrameCSS(frame: ParsedFrame): string {
    const properties: string[] = []

    // Layout properties
    if (frame.layout.mode !== "none") {
      properties.push("display: flex;")

      if (frame.layout.direction) {
        properties.push(`flex-direction: ${frame.layout.direction};`)
      }

      if (frame.layout.gap) {
        properties.push(`gap: ${frame.layout.gap}px;`)
      }

      if (frame.layout.padding) {
        const p = frame.layout.padding
        properties.push(`padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;`)
      }

      if (frame.layout.alignment) {
        const justifyContent = this.mapAlignment(frame.layout.alignment.main)
        const alignItems = this.mapAlignment(frame.layout.alignment.cross)
        properties.push(`justify-content: ${justifyContent};`)
        properties.push(`align-items: ${alignItems};`)
      }
    }

    // Styling properties
    if (frame.styling.backgroundColor) {
      properties.push(`background-color: ${frame.styling.backgroundColor};`)
    }

    if (frame.styling.borderRadius) {
      const radius = Array.isArray(frame.styling.borderRadius)
        ? frame.styling.borderRadius.join("px ") + "px"
        : `${frame.styling.borderRadius}px`
      properties.push(`border-radius: ${radius};`)
    }

    if (frame.styling.borders && frame.styling.borders.length > 0) {
      const border = frame.styling.borders[0]
      properties.push(`border: ${border.width}px ${border.style} ${border.color};`)
    }

    if (frame.styling.shadows && frame.styling.shadows.length > 0) {
      const shadows = frame.styling.shadows
        .map((shadow) => `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread || 0}px ${shadow.color}`)
        .join(", ")
      properties.push(`box-shadow: ${shadows};`)
    }

    if (frame.styling.opacity !== undefined && frame.styling.opacity < 1) {
      properties.push(`opacity: ${frame.styling.opacity};`)
    }

    // Dimensions
    properties.push(`width: ${frame.bounds.width}px;`)
    properties.push(`height: ${frame.bounds.height}px;`)

    return properties.join("\n  ")
  }

  private generateUtilityClasses(): string {
    const utilities: string[] = []

    // Spacing utilities
    for (let i = 0; i <= 20; i++) {
      const value = i * 4 // 4px increments
      utilities.push(`.m-${i} { margin: ${value}px; }`)
      utilities.push(`.p-${i} { padding: ${value}px; }`)
      utilities.push(`.mt-${i} { margin-top: ${value}px; }`)
      utilities.push(`.mb-${i} { margin-bottom: ${value}px; }`)
      utilities.push(`.ml-${i} { margin-left: ${value}px; }`)
      utilities.push(`.mr-${i} { margin-right: ${value}px; }`)
      utilities.push(`.pt-${i} { padding-top: ${value}px; }`)
      utilities.push(`.pb-${i} { padding-bottom: ${value}px; }`)
      utilities.push(`.pl-${i} { padding-left: ${value}px; }`)
      utilities.push(`.pr-${i} { padding-right: ${value}px; }`)
    }

    // Flexbox utilities
    utilities.push(".flex { display: flex; }")
    utilities.push(".flex-col { flex-direction: column; }")
    utilities.push(".flex-row { flex-direction: row; }")
    utilities.push(".justify-start { justify-content: flex-start; }")
    utilities.push(".justify-center { justify-content: center; }")
    utilities.push(".justify-end { justify-content: flex-end; }")
    utilities.push(".justify-between { justify-content: space-between; }")
    utilities.push(".items-start { align-items: flex-start; }")
    utilities.push(".items-center { align-items: center; }")
    utilities.push(".items-end { align-items: flex-end; }")

    return utilities.join("\n")
  }

  private generateResponsiveStyles(): string {
    if (!this.options.responsive) return ""

    const breakpoints = {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    }

    const responsive: string[] = []

    Object.entries(breakpoints).forEach(([name, width]) => {
      responsive.push(`@media (min-width: ${width}) {`)
      responsive.push(`  /* ${name} styles */`)
      responsive.push(`}`)
      responsive.push("")
    })

    return responsive.join("\n")
  }

  private generateCSSVariables(): string {
    if (!this.options.includeVariables) return ""

    const variables: string[] = [":root {"]

    this.variables.forEach((variable) => {
      variables.push(`  ${variable.name}: ${variable.value};`)
    })

    variables.push("}")
    variables.push("")

    return variables.join("\n")
  }

  private combineStyles(styles: {
    variables: string
    components: Record<string, string>
    utilities: string
    responsive: string
  }): GeneratedCSS {
    let main = ""

    // Add header comment
    main += `/* Generated CSS */\n/* Framework: ${this.options.framework} */\n/* Generated at: ${new Date().toISOString()} */\n\n`

    // Add variables
    if (styles.variables) {
      main += `/* CSS Variables */\n${styles.variables}\n`
    }

    // Add component styles
    main += `/* Component Styles */\n`
    Object.entries(styles.components).forEach(([className, css]) => {
      main += `.${className} {\n  ${css}\n}\n\n`
    })

    // Add utilities
    if (styles.utilities) {
      main += `/* Utility Classes */\n${styles.utilities}\n\n`
    }

    // Add responsive styles
    if (styles.responsive) {
      main += `/* Responsive Styles */\n${styles.responsive}\n`
    }

    // Minify if requested
    if (this.options.minify) {
      main = this.minifyCSS(main)
    }

    return {
      main,
      variables: styles.variables,
      components: styles.components,
      utilities: styles.utilities,
      responsive: styles.responsive,
      metadata: {
        classCount: this.classes.length,
        variableCount: this.variables.length,
        size: main.length,
        framework: this.options.framework,
      },
    }
  }

  // Helper methods
  private generateClassName(name: string): string {
    const prefix = this.options.prefix || ""
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    return prefix + cleanName
  }

  private generateColorVariableName(color: string, index: number): string {
    // Try to generate semantic names based on color
    if (color.includes("rgb(255, 255, 255)") || color.includes("#ffffff")) {
      return "--color-white"
    }
    if (color.includes("rgb(0, 0, 0)") || color.includes("#000000")) {
      return "--color-black"
    }

    // For other colors, generate based on RGB values or use index
    return `--color-${index}`
  }

  private mapAlignment(alignment: string): string {
    switch (alignment) {
      case "start":
        return "flex-start"
      case "center":
        return "center"
      case "end":
        return "flex-end"
      case "space-between":
        return "space-between"
      case "space-around":
        return "space-around"
      default:
        return "flex-start"
    }
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/;\s*}/g, "}") // Remove last semicolon in blocks
      .replace(/\s*{\s*/g, "{") // Clean up braces
      .replace(/\s*}\s*/g, "}")
      .replace(/\s*;\s*/g, ";") // Clean up semicolons
      .trim()
  }
}

export const cssGenerator = new CSSGenerator({
  framework: "vanilla-css",
  responsive: true,
  minify: false,
  includeVariables: true,
  browserSupport: "modern",
})
