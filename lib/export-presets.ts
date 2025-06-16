export interface ExportPreset {
  id: string
  name: string
  description: string
  framework: "react" | "next" | "vite"
  styling: "css" | "tailwind" | "styled-components"
  typescript: boolean
  includeTests: boolean
  includeStorybook: boolean
  includeDocumentation: boolean
  packageManager: "npm" | "yarn" | "pnpm"
  eslintConfig: boolean
  prettierConfig: boolean
  gitignore: boolean
  category: "starter" | "production" | "library" | "enterprise"
}

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: "react-starter",
    name: "React Starter",
    description: "Quick React component with Tailwind CSS",
    framework: "react",
    styling: "tailwind",
    typescript: true,
    includeTests: false,
    includeStorybook: false,
    includeDocumentation: true,
    packageManager: "npm",
    eslintConfig: true,
    prettierConfig: true,
    gitignore: true,
    category: "starter",
  },
  {
    id: "next-production",
    name: "Next.js Production",
    description: "Production-ready Next.js component with full tooling",
    framework: "next",
    styling: "tailwind",
    typescript: true,
    includeTests: true,
    includeStorybook: true,
    includeDocumentation: true,
    packageManager: "pnpm",
    eslintConfig: true,
    prettierConfig: true,
    gitignore: true,
    category: "production",
  },
  {
    id: "component-library",
    name: "Component Library",
    description: "Reusable component library with Storybook",
    framework: "vite",
    styling: "css",
    typescript: true,
    includeTests: true,
    includeStorybook: true,
    includeDocumentation: true,
    packageManager: "pnpm",
    eslintConfig: true,
    prettierConfig: true,
    gitignore: true,
    category: "library",
  },
  {
    id: "enterprise-ready",
    name: "Enterprise Ready",
    description: "Full enterprise setup with all quality tools",
    framework: "next",
    styling: "tailwind",
    typescript: true,
    includeTests: true,
    includeStorybook: true,
    includeDocumentation: true,
    packageManager: "pnpm",
    eslintConfig: true,
    prettierConfig: true,
    gitignore: true,
    category: "enterprise",
  },
]

export class ExportPresetService {
  static getPresets(): ExportPreset[] {
    return EXPORT_PRESETS
  }

  static getPresetById(id: string): ExportPreset | undefined {
    return EXPORT_PRESETS.find((preset) => preset.id === id)
  }

  static getPresetsByCategory(category: string): ExportPreset[] {
    return EXPORT_PRESETS.filter((preset) => preset.category === category)
  }

  static createCustomPreset(preset: Omit<ExportPreset, "id">): ExportPreset {
    const customPreset: ExportPreset = {
      ...preset,
      id: `custom-${Date.now()}`,
    }

    // Save to localStorage or API
    const customPresets = this.getCustomPresets()
    customPresets.push(customPreset)
    localStorage.setItem("custom-export-presets", JSON.stringify(customPresets))

    return customPreset
  }

  static getCustomPresets(): ExportPreset[] {
    const stored = localStorage.getItem("custom-export-presets")
    return stored ? JSON.parse(stored) : []
  }

  static getAllPresets(): ExportPreset[] {
    return [...EXPORT_PRESETS, ...this.getCustomPresets()]
  }
}
