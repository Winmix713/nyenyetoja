import JSZip from "jszip"

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

export class ExportService {
  static async createZipDownload(data: ExportData): Promise<void> {
    const zip = new JSZip()

    // Create project structure
    const srcFolder = zip.folder("src")!
    const componentsFolder = srcFolder.folder("components")!
    const stylesFolder = srcFolder.folder("styles")!

    // Add component files
    componentsFolder.file(`${data.componentName}.tsx`, this.generateComponentFile(data))

    componentsFolder.file(`${data.componentName}.types.ts`, data.typescript)

    // Add styles
    stylesFolder.file(`${data.componentName}.css`, data.css)

    // Add package.json
    zip.file("package.json", this.generatePackageJson(data))

    // Add README
    zip.file("README.md", this.generateReadme(data))

    // Add metadata
    zip.file("figma-export.json", JSON.stringify(data.metadata, null, 2))

    // Generate and download
    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)

    const a = document.createElement("a")
    a.href = url
    a.download = `${data.componentName}-export.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  static async pushToGitHub(data: ExportData, repoName: string, token: string): Promise<string> {
    try {
      // Create repository
      const createRepoResponse = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: repoName,
          description: `React component generated from Figma: ${data.figmaUrl}`,
          private: false,
          auto_init: true,
        }),
      })

      if (!createRepoResponse.ok) {
        throw new Error("Failed to create repository")
      }

      const repo = await createRepoResponse.json()

      // Upload files
      const files = [
        {
          path: `src/components/${data.componentName}.tsx`,
          content: this.generateComponentFile(data),
        },
        {
          path: `src/components/${data.componentName}.types.ts`,
          content: data.typescript,
        },
        {
          path: `src/styles/${data.componentName}.css`,
          content: data.css,
        },
        {
          path: "package.json",
          content: this.generatePackageJson(data),
        },
        {
          path: "README.md",
          content: this.generateReadme(data),
        },
        {
          path: "figma-export.json",
          content: JSON.stringify(data.metadata, null, 2),
        },
      ]

      for (const file of files) {
        await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}`, {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Add ${file.path}`,
            content: btoa(unescape(encodeURIComponent(file.content))),
          }),
        })
      }

      return repo.html_url
    } catch (error) {
      console.error("GitHub export failed:", error)
      throw error
    }
  }

  private static generateComponentFile(data: ExportData): string {
    return `import React from 'react';
import './${data.componentName}.css';
import type { ${data.componentName}Props } from './${data.componentName}.types';

${data.jsx}
`
  }

  private static generatePackageJson(data: ExportData): string {
    return JSON.stringify(
      {
        name: data.componentName.toLowerCase(),
        version: "1.0.0",
        description: `React component generated from Figma`,
        main: `src/components/${data.componentName}.tsx`,
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
        devDependencies: {
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "@vitejs/plugin-react": "^4.0.0",
          typescript: "^5.0.0",
          vite: "^4.4.0",
        },
        figma: {
          sourceUrl: data.figmaUrl,
          generatedAt: data.metadata.generatedAt,
          version: data.metadata.version,
        },
      },
      null,
      2,
    )
  }

  private static generateReadme(data: ExportData): string {
    return `# ${data.componentName}

React component generated from Figma design.

## Source

- **Figma File**: [View Design](${data.figmaUrl})
- **Generated**: ${data.metadata.generatedAt}
- **Version**: ${data.metadata.version}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`tsx
import ${data.componentName} from './src/components/${data.componentName}';

function App() {
  return (
    <div>
      <${data.componentName} />
    </div>
  );
}
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

---

Generated with [Figma-React Converter](https://your-app-url.com)
`
  }
}
