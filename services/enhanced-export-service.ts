import JSZip from "jszip"
import {
  GitHubTokenSchema,
  RepoNameSchema,
  ComponentNameSchema,
  exportRateLimiter,
  handleAPIError,
} from "@/lib/security"
import { PerformanceMonitor } from "@/lib/performance"
import type { ExportPreset } from "@/lib/export-presets"

export interface ExportData {
  jsx: string
  css: string
  typescript: string
  componentName: string
  figmaUrl: string
  metadata: {
    generatedAt: string
    version: string
    figmaFile: string
  }
}

export interface ExportOptions {
  includeTests?: boolean
  includeStorybook?: boolean
  framework?: "react" | "next" | "vite"
  styling?: "css" | "tailwind" | "styled-components"
}

export interface BatchExportOptions {
  components: GeneratedComponent[]
  preset: ExportPreset
  exportMethod: "zip" | "github"
  githubOptions?: {
    organizationName?: string
    repositoryPrefix?: string
    createSeparateRepos?: boolean
  }
}

export interface ExportProgress {
  currentStep: string
  progress: number
  totalSteps: number
  currentComponent?: string
  errors: string[]
}

export interface GeneratedComponent {
  jsx: string
  css: string
  typescript: string
  componentName: string
  figmaUrl: string
}

export class EnhancedExportService {
  private static validateExportData(data: ExportData): void {
    ComponentNameSchema.parse(data.componentName)

    if (!data.jsx.trim()) {
      throw new Error("JSX content is required")
    }

    if (!data.figmaUrl.trim()) {
      throw new Error("Figma URL is required")
    }
  }

  static setProgressCallback(callback: (progress: ExportProgress) => void) {
    this.progressCallback = callback
  }

  private static progressCallback?: (progress: ExportProgress) => void

  private static updateProgress(progress: ExportProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress)
    }
  }

  static async createZipDownload(data: ExportData, options: ExportOptions = {}): Promise<void> {
    const endTimer = PerformanceMonitor.startTimer("zip-export")

    try {
      this.validateExportData(data)

      if (!exportRateLimiter.isAllowed("zip-export")) {
        throw new Error("Export rate limit exceeded. Please try again later.")
      }

      const zip = new JSZip()

      // Create project structure based on framework
      await this.createProjectStructure(zip, data, options)

      // Generate and download
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      })

      const url = URL.createObjectURL(content)
      const filename = `${data.componentName.toLowerCase()}-export.zip`

      // Create download link
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      console.log(`✅ ZIP export completed: ${filename}`)
    } catch (error) {
      console.error("❌ ZIP export failed:", error)
      throw handleAPIError(error)
    } finally {
      endTimer()
    }
  }

  static async pushToGitHub(
    data: ExportData,
    repoName: string,
    token: string,
    options: ExportOptions = {},
  ): Promise<string> {
    const endTimer = PerformanceMonitor.startTimer("github-export")

    try {
      // Validate inputs
      this.validateExportData(data)
      GitHubTokenSchema.parse(token)
      RepoNameSchema.parse(repoName)

      if (!exportRateLimiter.isAllowed("github-export")) {
        throw new Error("Export rate limit exceeded. Please try again later.")
      }

      console.log(`🚀 Starting GitHub export for repo: ${repoName}`)

      // Create repository
      const repo = await this.createGitHubRepo(repoName, token, data.figmaUrl)

      // Prepare files
      const files = await this.prepareGitHubFiles(data, options)

      // Upload files in batches to avoid rate limits
      await this.uploadFilesToGitHub(repo.full_name, files, token)

      console.log(`✅ GitHub export completed: ${repo.html_url}`)
      return repo.html_url
    } catch (error) {
      console.error("❌ GitHub export failed:", error)
      throw handleAPIError(error)
    } finally {
      endTimer()
    }
  }

  // Batch Export - Multiple Components
  static async batchExport(options: BatchExportOptions): Promise<string[]> {
    const results: string[] = []
    const totalComponents = options.components.length

    this.updateProgress({
      currentStep: "Initializing batch export",
      progress: 0,
      totalSteps: totalComponents,
      errors: [],
    })

    for (let i = 0; i < options.components.length; i++) {
      const component = options.components[i]

      try {
        this.updateProgress({
          currentStep: `Exporting component ${i + 1} of ${totalComponents}`,
          progress: (i / totalComponents) * 100,
          totalSteps: totalComponents,
          currentComponent: component.componentName,
          errors: [],
        })

        if (options.exportMethod === "zip") {
          await this.createZipExport(component, options.preset)
          results.push(`${component.componentName}.zip`)
        } else {
          const repoUrl = await this.createGitHubExport(component, options.preset, options.githubOptions)
          results.push(repoUrl)
        }

        // Add delay to respect rate limits
        if (options.exportMethod === "github") {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Failed to export ${component.componentName}:`, error)
        this.updateProgress({
          currentStep: `Error exporting ${component.componentName}`,
          progress: (i / totalComponents) * 100,
          totalSteps: totalComponents,
          currentComponent: component.componentName,
          errors: [`Failed to export ${component.componentName}: ${error}`],
        })
      }
    }

    this.updateProgress({
      currentStep: "Batch export completed",
      progress: 100,
      totalSteps: totalComponents,
      errors: [],
    })

    return results
  }

  // Enhanced ZIP Export with Presets
  static async createZipExport(component: GeneratedComponent, preset: ExportPreset): Promise<Blob> {
    const zip = new JSZip()

    // Generate project structure based on preset
    const projectStructure = this.generateProjectStructure(preset)

    // Create folders
    Object.keys(projectStructure.folders).forEach((folderPath) => {
      zip.folder(folderPath)
    })

    // Add component files
    const componentFiles = this.generateComponentFiles(component, preset)
    Object.entries(componentFiles).forEach(([path, content]) => {
      zip.file(path, content)
    })

    // Add configuration files
    const configFiles = this.generateConfigFiles(component, preset)
    Object.entries(configFiles).forEach(([path, content]) => {
      zip.file(path, content)
    })

    // Add documentation
    if (preset.includeDocumentation) {
      const docs = this.generateDocumentation(component, preset)
      Object.entries(docs).forEach(([path, content]) => {
        zip.file(path, content)
      })
    }

    // Add tests
    if (preset.includeTests) {
      const tests = this.generateTests(component, preset)
      Object.entries(tests).forEach(([path, content]) => {
        zip.file(path, content)
      })
    }

    // Add Storybook
    if (preset.includeStorybook) {
      const storybook = this.generateStorybook(component, preset)
      Object.entries(storybook).forEach(([path, content]) => {
        zip.file(path, content)
      })
    }

    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    })
  }

  // Enhanced GitHub Export with Advanced Features
  static async createGitHubExport(
    component: GeneratedComponent,
    preset: ExportPreset,
    githubOptions?: BatchExportOptions["githubOptions"],
  ): Promise<string> {
    const token = localStorage.getItem("github_token")
    if (!token) {
      throw new Error("GitHub token not found")
    }

    const repoName = githubOptions?.repositoryPrefix
      ? `${githubOptions.repositoryPrefix}-${component.componentName.toLowerCase()}`
      : component.componentName.toLowerCase()

    // Create repository
    const repo = await this.createGitHubRepository(repoName, component, token, githubOptions?.organizationName)

    // Generate all files
    const allFiles = {
      ...this.generateComponentFiles(component, preset),
      ...this.generateConfigFiles(component, preset),
      ...(preset.includeDocumentation ? this.generateDocumentation(component, preset) : {}),
      ...(preset.includeTests ? this.generateTests(component, preset) : {}),
      ...(preset.includeStorybook ? this.generateStorybook(component, preset) : {}),
    }

    // Upload files in batches
    await this.uploadFilesInBatches(repo.full_name, allFiles, token)

    // Setup GitHub Actions if needed
    if (preset.category === "production" || preset.category === "enterprise") {
      await this.setupGitHubActions(repo.full_name, preset, token)
    }

    // Setup branch protection for enterprise
    if (preset.category === "enterprise") {
      await this.setupBranchProtection(repo.full_name, token)
    }

    return repo.html_url
  }

  private static generateProjectStructure(preset: ExportPreset) {
    const baseStructure = {
      folders: {
        src: {},
        "src/components": {},
        "src/types": {},
        "src/utils": {},
        public: {},
      },
    }

    if (preset.framework === "next") {
      baseStructure.folders = {
        ...baseStructure.folders,
        app: {},
        "app/components": {},
        lib: {},
      }
    }

    if (preset.includeTests) {
      baseStructure.folders = {
        ...baseStructure.folders,
        __tests__: {},
        "__tests__/components": {},
      }
    }

    if (preset.includeStorybook) {
      baseStructure.folders = {
        ...baseStructure.folders,
        ".storybook": {},
        stories: {},
      }
    }

    return baseStructure
  }

  private static generateComponentFiles(component: GeneratedComponent, preset: ExportPreset): Record<string, string> {
    const files: Record<string, string> = {}
    const componentDir = preset.framework === "next" ? "app/components" : "src/components"

    // Main component file
    const extension = preset.typescript ? "tsx" : "jsx"
    files[`${componentDir}/${component.componentName}.${extension}`] = this.generateComponentCode(component, preset)

    // Types file (if TypeScript)
    if (preset.typescript) {
      files[`${componentDir}/${component.componentName}.types.ts`] = this.generateTypesCode(component, preset)
    }

    // Styles file
    const styleExtension = preset.styling === "styled-components" ? "ts" : "css"
    files[`${componentDir}/${component.componentName}.${styleExtension}`] = this.generateStylesCode(component, preset)

    return files
  }

  private static generateConfigFiles(component: GeneratedComponent, preset: ExportPreset): Record<string, string> {
    const files: Record<string, string> = {}

    // Package.json
    files["package.json"] = this.generatePackageJson(component, preset)

    // TypeScript config
    if (preset.typescript) {
      files["tsconfig.json"] = this.generateTsConfig(preset)
    }

    // ESLint config
    if (preset.eslintConfig) {
      files[".eslintrc.json"] = this.generateESLintConfig(preset)
    }

    // Prettier config
    if (preset.prettierConfig) {
      files[".prettierrc"] = this.generatePrettierConfig()
    }

    // Gitignore
    if (preset.gitignore) {
      files[".gitignore"] = this.generateGitignore(preset)
    }

    // Tailwind config
    if (preset.styling === "tailwind") {
      files["tailwind.config.js"] = this.generateTailwindConfig()
    }

    // Next.js config
    if (preset.framework === "next") {
      files["next.config.js"] = this.generateNextConfig()
    }

    // Vite config
    if (preset.framework === "vite") {
      files["vite.config.ts"] = this.generateViteConfig(preset)
    }

    return files
  }

  private static generateTests(component: GeneratedComponent, preset: ExportPreset): Record<string, string> {
    const files: Record<string, string> = {}
    const extension = preset.typescript ? "tsx" : "jsx"

    files[`__tests__/components/${component.componentName}.test.${extension}`] = `
import { render, screen } from '@testing-library/react'
import ${component.componentName} from '../../src/components/${component.componentName}'

describe('${component.componentName}', () => {
  it('renders without crashing', () => {
    render(<${component.componentName} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = render(<${component.componentName} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
`

    files["__tests__/setup.ts"] = `
import '@testing-library/jest-dom'
`

    files["jest.config.js"] = `
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
`

    return files
  }

  private static generateStorybook(component: GeneratedComponent, preset: ExportPreset): Record<string, string> {
    const files: Record<string, string> = {}

    files[".storybook/main.js"] = `
module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
`

    files[".storybook/preview.js"] = `
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
`

    const extension = preset.typescript ? "tsx" : "jsx"
    files[`stories/${component.componentName}.stories.${extension}`] = `
import type { Meta, StoryObj } from '@storybook/react'
import ${component.componentName} from '../src/components/${component.componentName}'

const meta: Meta<typeof ${component.componentName}> = {
  title: 'Components/${component.componentName}',
  component: ${component.componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Add interactions here
  },
}
`

    return files
  }

  // Helper methods for generating specific file contents
  private static generateComponentCode(component: GeneratedComponent, preset: ExportPreset): string {
    const imports = []

    if (preset.typescript) {
      imports.push(`import type { ${component.componentName}Props } from './${component.componentName}.types'`)
    }

    if (preset.styling === "styled-components") {
      imports.push(`import styled from 'styled-components'`)
    } else {
      imports.push(`import './${component.componentName}.css'`)
    }

    return `import React from 'react'
${imports.join("\n")}

${component.jsx}

export default ${component.componentName}
`
  }

  private static generateTypesCode(component: GeneratedComponent, preset: ExportPreset): string {
    return (
      component.typescript ||
      `
export interface ${component.componentName}Props {
  className?: string
  children?: React.ReactNode
}
`
    )
  }

  private static generateStylesCode(component: GeneratedComponent, preset: ExportPreset): string {
    if (preset.styling === "styled-components") {
      return `
import styled from 'styled-components'

export const Container = styled.div\`
  ${component.css}
\`
`
    }

    return component.css
  }

  private static generatePackageJson(component: GeneratedComponent, preset: ExportPreset): string {
    const dependencies: Record<string, string> = {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    }

    const devDependencies: Record<string, string> = {}

    // Framework specific dependencies
    if (preset.framework === "next") {
      dependencies["next"] = "^14.0.0"
    } else if (preset.framework === "vite") {
      devDependencies["vite"] = "^5.0.0"
      devDependencies["@vitejs/plugin-react"] = "^4.0.0"
    }

    // Styling dependencies
    if (preset.styling === "tailwind") {
      devDependencies["tailwindcss"] = "^3.3.0"
      devDependencies["autoprefixer"] = "^10.4.0"
      devDependencies["postcss"] = "^8.4.0"
    } else if (preset.styling === "styled-components") {
      dependencies["styled-components"] = "^6.0.0"
    }

    // TypeScript dependencies
    if (preset.typescript) {
      devDependencies["typescript"] = "^5.0.0"
      devDependencies["@types/react"] = "^18.2.0"
      devDependencies["@types/react-dom"] = "^18.2.0"
    }

    // Testing dependencies
    if (preset.includeTests) {
      devDependencies["jest"] = "^29.0.0"
      devDependencies["@testing-library/react"] = "^14.0.0"
      devDependencies["@testing-library/jest-dom"] = "^6.0.0"
      devDependencies["@testing-library/user-event"] = "^14.0.0"
    }

    // Storybook dependencies
    if (preset.includeStorybook) {
      devDependencies["@storybook/react"] = "^7.0.0"
      devDependencies["@storybook/react-vite"] = "^7.0.0"
      devDependencies["@storybook/addon-essentials"] = "^7.0.0"
    }

    // ESLint dependencies
    if (preset.eslintConfig) {
      devDependencies["eslint"] = "^8.0.0"
      devDependencies["@typescript-eslint/eslint-plugin"] = "^6.0.0"
      devDependencies["@typescript-eslint/parser"] = "^6.0.0"
    }

    // Prettier dependencies
    if (preset.prettierConfig) {
      devDependencies["prettier"] = "^3.0.0"
    }

    const scripts: Record<string, string> = {}

    // Framework specific scripts
    if (preset.framework === "next") {
      scripts["dev"] = "next dev"
      scripts["build"] = "next build"
      scripts["start"] = "next start"
    } else if (preset.framework === "vite") {
      scripts["dev"] = "vite"
      scripts["build"] = "vite build"
      scripts["preview"] = "vite preview"
    } else {
      scripts["start"] = "react-scripts start"
      scripts["build"] = "react-scripts build"
    }

    // Testing scripts
    if (preset.includeTests) {
      scripts["test"] = "jest"
      scripts["test:watch"] = "jest --watch"
      scripts["test:coverage"] = "jest --coverage"
    }

    // Storybook scripts
    if (preset.includeStorybook) {
      scripts["storybook"] = "storybook dev -p 6006"
      scripts["build-storybook"] = "storybook build"
    }

    // Linting scripts
    if (preset.eslintConfig) {
      scripts["lint"] = "eslint src --ext .ts,.tsx,.js,.jsx"
      scripts["lint:fix"] = "eslint src --ext .ts,.tsx,.js,.jsx --fix"
    }

    // Formatting scripts
    if (preset.prettierConfig) {
      scripts["format"] = 'prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"'
      scripts["format:check"] = 'prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"'
    }

    return JSON.stringify(
      {
        name: component.componentName
          .toLowerCase()
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase(),
        version: "1.0.0",
        description: `${component.componentName} component generated from Figma`,
        main: preset.framework === "next" ? "app/page.tsx" : "src/index.tsx",
        scripts,
        dependencies,
        devDependencies,
        figma: {
          sourceUrl: component.figmaUrl,
          generatedAt: new Date().toISOString(),
          preset: preset.name,
        },
      },
      null,
      2,
    )
  }

  // Additional helper methods would continue here...
  private static generateTsConfig(preset: ExportPreset): string {
    const baseConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
      },
      include: ["src"],
      exclude: ["node_modules"],
    }

    if (preset.framework === "next") {
      baseConfig.compilerOptions = {
        ...baseConfig.compilerOptions,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
        },
      }
      baseConfig.include = ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
    }

    return JSON.stringify(baseConfig, null, 2)
  }

  private static generateESLintConfig(preset: ExportPreset): string {
    const config = {
      extends: [
        "eslint:recommended",
        ...(preset.typescript ? ["@typescript-eslint/recommended"] : []),
        ...(preset.framework === "next" ? ["next/core-web-vitals"] : []),
      ],
      parser: preset.typescript ? "@typescript-eslint/parser" : undefined,
      plugins: preset.typescript ? ["@typescript-eslint"] : [],
      rules: {
        "no-unused-vars": "warn",
        "no-console": "warn",
      },
    }

    return JSON.stringify(config, null, 2)
  }

  private static generatePrettierConfig(): string {
    return JSON.stringify(
      {
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: "es5",
        printWidth: 100,
      },
      null,
      2,
    )
  }

  private static generateGitignore(preset: ExportPreset): string {
    const lines = [
      "# Dependencies",
      "node_modules/",
      "",
      "# Production builds",
      "build/",
      "dist/",
      "",
      "# Environment variables",
      ".env",
      ".env.local",
      ".env.production",
      "",
      "# IDE",
      ".vscode/",
      ".idea/",
      "",
      "# OS",
      ".DS_Store",
      "Thumbs.db",
    ]

    if (preset.framework === "next") {
      lines.push("", "# Next.js", ".next/", "out/")
    }

    if (preset.includeStorybook) {
      lines.push("", "# Storybook", "storybook-static/")
    }

    if (preset.includeTests) {
      lines.push("", "# Testing", "coverage/")
    }

    return lines.join("\n")
  }

  private static generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
  }

  private static generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
`
  }

  private static generateViteConfig(preset: ExportPreset): string {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
`
  }

  private static generateDocumentation(component: GeneratedComponent, preset: ExportPreset): Record<string, string> {
    const files: Record<string, string> = {}

    files["README.md"] = `# ${component.componentName}

React component generated from Figma design.

## 🎨 Source Design

- **Figma File**: [View Design](${component.figmaUrl})
- **Generated**: ${new Date().toLocaleDateString()}
- **Framework**: ${preset.framework}
- **Styling**: ${preset.styling}

## 🚀 Quick Start

### Installation

\`\`\`bash
${preset.packageManager} install
\`\`\`

### Development

\`\`\`bash
${preset.packageManager} run dev
\`\`\`

### Build

\`\`\`bash
${preset.packageManager} run build
\`\`\`

## 📖 Usage

\`\`\`${preset.typescript ? "tsx" : "jsx"}
import ${component.componentName} from './components/${component.componentName}'

function App() {
  return (
    <div>
      <${component.componentName} />
    </div>
  )
}
\`\`\`

${
  preset.includeTests
    ? `
## 🧪 Testing

\`\`\`bash
${preset.packageManager} run test
\`\`\`

Run tests in watch mode:
\`\`\`bash
${preset.packageManager} run test:watch
\`\`\`

Generate coverage report:
\`\`\`bash
${preset.packageManager} run test:coverage
\`\`\`
`
    : ""
}

${
  preset.includeStorybook
    ? `
## 📚 Storybook

View component stories:
\`\`\`bash
${preset.packageManager} run storybook
\`\`\`

Build storybook:
\`\`\`bash
${preset.packageManager} run build-storybook
\`\`\`
`
    : ""
}

${
  preset.eslintConfig
    ? `
## 🔍 Code Quality

Lint code:
\`\`\`bash
${preset.packageManager} run lint
\`\`\`

Fix linting issues:
\`\`\`bash
${preset.packageManager} run lint:fix
\`\`\`
`
    : ""
}

${
  preset.prettierConfig
    ? `
Format code:
\`\`\`bash
${preset.packageManager} run format
\`\`\`

Check formatting:
\`\`\`bash
${preset.packageManager} run format:check
\`\`\`
`
    : ""
}

## 🛠️ Tech Stack

- **Framework**: ${preset.framework === "next" ? "Next.js" : preset.framework === "vite" ? "React + Vite" : "React"}
- **Language**: ${preset.typescript ? "TypeScript" : "JavaScript"}
- **Styling**: ${preset.styling === "tailwind" ? "Tailwind CSS" : preset.styling === "styled-components" ? "Styled Components" : "CSS"}
${preset.includeTests ? `- **Testing**: Jest + React Testing Library` : ""}
${preset.includeStorybook ? `- **Documentation**: Storybook` : ""}
${preset.eslintConfig ? `- **Linting**: ESLint` : ""}
${preset.prettierConfig ? `- **Formatting**: Prettier` : ""}

## 📄 License

MIT License - feel free to use this component in your projects!

---

Generated with [Figma to React Converter](https://your-app-url.com)
`

    // Component-specific documentation
    files[`docs/${component.componentName}.md`] = `# ${component.componentName} Component

## Overview

This component was automatically generated from a Figma design and includes all the necessary styling and structure.

## Props

${
  preset.typescript
    ? `
\`\`\`typescript
interface ${component.componentName}Props {
  className?: string
  children?: React.ReactNode
  // Add more props as needed
}
\`\`\`
`
    : `
- \`className\` (string, optional): Additional CSS classes
- \`children\` (ReactNode, optional): Child elements
`
}

## Examples

### Basic Usage

\`\`\`${preset.typescript ? "tsx" : "jsx"}
<${component.componentName} />
\`\`\`

### With Custom Styling

\`\`\`${preset.typescript ? "tsx" : "jsx"}
<${component.componentName} className="custom-class" />
\`\`\`

### With Children

\`\`\`${preset.typescript ? "tsx" : "jsx"}
<${component.componentName}>
  <p>Custom content</p>
</${component.componentName}>
\`\`\`

## Styling

${
  preset.styling === "tailwind"
    ? `
This component uses Tailwind CSS classes. You can customize the appearance by:

1. Modifying the Tailwind classes in the component
2. Adding custom CSS classes via the \`className\` prop
3. Extending the Tailwind configuration

### Key Classes Used

- Layout and positioning classes
- Color and background classes  
- Typography classes
- Spacing classes
`
    : preset.styling === "styled-components"
      ? `
This component uses Styled Components for styling. You can customize by:

1. Modifying the styled component definitions
2. Passing theme props
3. Creating styled variants

### Styled Components

The component includes styled components for different elements with proper theming support.
`
      : `
This component uses CSS modules/plain CSS. You can customize by:

1. Modifying the CSS file
2. Adding custom CSS classes
3. Overriding styles with more specific selectors
`
}

## Accessibility

This component follows accessibility best practices:

- Semantic HTML structure
- Proper ARIA attributes where needed
- Keyboard navigation support
- Screen reader compatibility

## Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## Contributing

When modifying this component:

1. Maintain the existing API
2. Add tests for new functionality
3. Update documentation
4. Follow the established code style

## Changelog

### v1.0.0
- Initial component generated from Figma
- Basic functionality implemented
- Tests and documentation added
`

    return files
  }

  private static async createProjectStructure(zip: JSZip, data: ExportData, options: ExportOptions): Promise<void> {
    const framework = options.framework || "react"

    // Create folders
    const srcFolder = zip.folder("src")!
    const componentsFolder = srcFolder.folder("components")!

    // Add component files
    componentsFolder.file(`${data.componentName}.tsx`, this.generateComponentFile(data, options))

    componentsFolder.file(`${data.componentName}.types.ts`, data.typescript)

    // Add styles based on styling option
    if (options.styling !== "tailwind") {
      const stylesFolder = srcFolder.folder("styles")!
      stylesFolder.file(`${data.componentName}.css`, data.css)
    }

    // Add tests if requested
    if (options.includeTests) {
      const testsFolder = srcFolder.folder("__tests__")!
      testsFolder.file(`${data.componentName}.test.tsx`, this.generateTestFile(data))
    }

    // Add Storybook if requested
    if (options.includeStorybook) {
      const storiesFolder = srcFolder.folder("stories")!
      storiesFolder.file(`${data.componentName}.stories.tsx`, this.generateStoryFile(data))
    }

    // Add configuration files
    zip.file("package.json", this.generatePackageJson(data, options))
    zip.file("README.md", this.generateReadme(data, options))
    zip.file("tsconfig.json", this.generateTsConfig(framework))

    if (framework === "vite") {
      zip.file("vite.config.ts", this.generateViteConfig())
    }

    if (options.styling === "tailwind") {
      zip.file("tailwind.config.js", this.generateTailwindConfig())
    }

    // Add metadata
    zip.file(
      "figma-export.json",
      JSON.stringify(
        {
          ...data.metadata,
          exportOptions: options,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    )
  }

  private static async createGitHubRepo(repoName: string, token: string, figmaUrl: string): Promise<any> {
    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        name: repoName,
        description: `React component generated from Figma: ${figmaUrl}`,
        private: false,
        auto_init: true,
        gitignore_template: "Node",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to create repository: ${errorData.message || response.statusText}`)
    }

    return response.json()
  }

  private static async prepareGitHubFiles(
    data: ExportData,
    options: ExportOptions,
  ): Promise<Array<{ path: string; content: string }>> {
    const files = [
      {
        path: `src/components/${data.componentName}.tsx`,
        content: this.generateComponentFile(data, options),
      },
      {
        path: `src/components/${data.componentName}.types.ts`,
        content: data.typescript,
      },
      {
        path: "package.json",
        content: this.generatePackageJson(data, options),
      },
      {
        path: "README.md",
        content: this.generateReadme(data, options),
      },
      {
        path: "tsconfig.json",
        content: this.generateTsConfig(options.framework || "react"),
      },
    ]

    // Add conditional files
    if (options.styling !== "tailwind") {
      files.push({
        path: `src/styles/${data.componentName}.css`,
        content: data.css,
      })
    }

    if (options.includeTests) {
      files.push({
        path: `src/__tests__/${data.componentName}.test.tsx`,
        content: this.generateTestFile(data),
      })
    }

    if (options.styling === "tailwind") {
      files.push({
        path: "tailwind.config.js",
        content: this.generateTailwindConfig(),
      })
    }

    return files
  }

  private static async uploadFilesToGitHub(
    repoFullName: string,
    files: Array<{ path: string; content: string }>,
    token: string,
  ): Promise<void> {
    const batchSize = 5

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (file) => {
          const response = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${file.path}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              message: `Add ${file.path}`,
              content: btoa(unescape(encodeURIComponent(file.content))),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`Failed to upload ${file.path}: ${errorData.message || response.statusText}`)
          }
        }),
      )

      // Small delay between batches to respect rate limits
      if (i + batchSize < files.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  private static generateComponentFile(data: ExportData, options: ExportOptions): string {
    const imports = [`import React from 'react'`]

    if (options.styling === "styled-components") {
      imports.push(`import styled from 'styled-components'`)
    } else if (options.styling !== "tailwind") {
      imports.push(`import './${data.componentName}.css'`)
    }

    imports.push(`import type { ${data.componentName}Props } from './${data.componentName}.types'`)

    return `${imports.join("\n")}

${data.jsx}

export default ${data.componentName}
`
  }

  private static generateTestFile(data: ExportData): string {
    return `import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ${data.componentName} from './${data.componentName}'

describe('${data.componentName}', () => {
  it('renders without crashing', () => {
    render(<${data.componentName} />)
  })

  it('applies custom className', () => {
    const customClass = 'custom-class'
    render(<${data.componentName} className={customClass} />)
    
    const component = screen.getByTestId('${data.componentName.toLowerCase()}')
    expect(component).toHaveClass(customClass)
  })
})
`
  }

  private static generateStoryFile(data: ExportData): string {
    return `import type { Meta, StoryObj } from '@storybook/react'
import ${data.componentName} from '../components/${data.componentName}'

const meta: Meta<typeof ${data.componentName}> = {
  title: 'Components/${data.componentName}',
  component: ${data.componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithCustomClass: Story = {
  args: {
    className: 'custom-styling',
  },
}
`
  }

  private static generateReadme(data: ExportData, options: ExportOptions): string {
    const framework = options.framework || "react"
    const styling = options.styling || "css"

    return `# ${data.componentName}

React component generated from Figma design.

## 📋 Overview

- **Framework**: ${framework}
- **Styling**: ${styling}
- **Generated**: ${data.metadata.generatedAt}
- **Source**: [Figma Design](${data.figmaUrl})

## 🚀 Installation

\`\`\`bash
npm install
\`\`\`

## 💻 Usage

\`\`\`tsx
import ${data.componentName} from './src/components/${data.componentName}'

function App() {
  return (
    <div>
      <${data.componentName} />
    </div>
  )
}
\`\`\`

## 🛠 Development

\`\`\`bash
# Start development server
npm run dev

# Run tests${options.includeTests ? "\nnpm run test" : " (not included)"}

# Build for production
npm run build
\`\`\`

${
  options.includeStorybook
    ? `## 📚 Storybook

\`\`\`bash
# Start Storybook
npm run storybook
\`\`\`
`
    : ""
}

## 📁 Project Structure

\`\`\`
src/
├── components/
│   ├── ${data.componentName}.tsx
│   └── ${data.componentName}.types.ts
${
  options.styling !== "tailwind"
    ? `├── styles/
│   └── ${data.componentName}.css`
    : ""
}${
  options.includeTests
    ? `
├── __tests__/
│   └── ${data.componentName}.test.tsx`
    : ""
}${
  options.includeStorybook
    ? `
└── stories/
    └── ${data.componentName}.stories.tsx`
    : ""
}
\`\`\`

---

Generated with [Figma-React Converter](https://your-app-url.com)
`
  }

  private static generateTsConfig(framework: string): string {
    const baseConfig = {
      compilerOptions: {
        target: "ES2020",
        lib: ["DOM", "DOM.Iterable", "ES6"],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: framework === "next",
        jsx: "react-jsx",
      },
      include: ["src"],
      exclude: ["node_modules"],
    }

    if (framework === "next") {
      baseConfig.compilerOptions = {
        ...baseConfig.compilerOptions,
        incremental: true,
        plugins: [{ name: "next" }],
      }
      baseConfig.include.push("next-env.d.ts", ".next/types/**/*.ts")
    }

    return JSON.stringify(baseConfig, null, 2)
  }

  private static generateViteConfig(): string {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/components/index.ts',
      name: 'FigmaComponent',
      fileName: (format) => \`figma-component.\${format}.js\`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
`
  }

  // GitHub-specific methods
  private static async createGitHubRepository(
    repoName: string,
    component: GeneratedComponent,
    token: string,
    organizationName?: string,
  ) {
    const url = organizationName
      ? `https://api.github.com/orgs/${organizationName}/repos`
      : "https://api.github.com/user/repos"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        description: `${component.componentName} component generated from Figma: ${component.figmaUrl}`,
        private: false,
        auto_init: true,
        gitignore_template: "Node",
        license_template: "mit",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create repository: ${error.message}`)
    }

    return await response.json()
  }

  private static async uploadFilesInBatches(
    repoFullName: string,
    files: Record<string, string>,
    token: string,
    batchSize = 10,
  ) {
    const fileEntries = Object.entries(files)
    const batches = []

    for (let i = 0; i < fileEntries.length; i += batchSize) {
      batches.push(fileEntries.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      await Promise.all(batch.map(([path, content]) => this.uploadSingleFile(repoFullName, path, content, token)))

      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  private static async uploadSingleFile(repoFullName: string, path: string, content: string, token: string) {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add ${path}`,
        content: btoa(unescape(encodeURIComponent(content))),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(`Failed to upload ${path}:`, error)
      throw new Error(`Failed to upload ${path}: ${error.message}`)
    }

    return await response.json()
  }

  private static async setupGitHubActions(repoFullName: string, preset: ExportPreset, token: string) {
    const workflows: Record<string, string> = {}

    // CI workflow
    workflows[".github/workflows/ci.yml"] = `
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: '${preset.packageManager}'
    
    - name: Install dependencies
      run: ${preset.packageManager} install
    
    ${
      preset.eslintConfig
        ? `
    - name: Run linting
      run: ${preset.packageManager} run lint
    `
        : ""
    }
    
    ${
      preset.prettierConfig
        ? `
    - name: Check formatting
      run: ${preset.packageManager} run format:check
    `
        : ""
    }
    
    ${
      preset.includeTests
        ? `
    - name: Run tests
      run: ${preset.packageManager} run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
    `
        : ""
    }
    
    - name: Build project
      run: ${preset.packageManager} run build
`

    // Deploy workflow for Next.js
    if (preset.framework === "next") {
      workflows[".github/workflows/deploy.yml"] = `
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.ORG_ID }}
        vercel-project-id: \${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
`
    }

    // Storybook deployment
    if (preset.includeStorybook) {
      workflows[".github/workflows/storybook.yml"] = `
name: Build and Deploy Storybook

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: '${preset.packageManager}'
    
    - name: Install dependencies
      run: ${preset.packageManager} install
    
    - name: Build Storybook
      run: ${preset.packageManager} run build-storybook
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./storybook-static
`
    }

    // Upload workflows
    for (const [path, content] of Object.entries(workflows)) {
      await this.uploadSingleFile(repoFullName, path, content, token)
    }
  }

  private static async setupBranchProtection(repoFullName: string, token: string) {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/branches/main/protection`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        required_status_checks: {
          strict: true,
          contexts: ["test"],
        },
        enforce_admins: true,
        required_pull_request_reviews: {
          required_approving_review_count: 1,
          dismiss_stale_reviews: true,
        },
        restrictions: null,
      }),
    })

    if (!response.ok) {
      console.warn("Failed to setup branch protection:", await response.text())
    }
  }
}
