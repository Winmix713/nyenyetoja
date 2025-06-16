import { FIGMA_CONFIG, type FigmaFileResponse } from "@/lib/figma-config"

export class FigmaService {
  private static getToken(): string {
    return localStorage.getItem(FIGMA_CONFIG.STORAGE_KEY) || FIGMA_CONFIG.TOKEN
  }

  static async fetchFigmaFile(fileKey: string, token?: string): Promise<FigmaFileResponse> {
    const authToken = token || this.getToken()

    try {
      const response = await fetch(`${FIGMA_CONFIG.API_BASE_URL}/files/${fileKey}`, {
        headers: {
          "X-Figma-Token": authToken,
        },
      })

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Figma file fetched successfully:", data.name)
      return data
    } catch (error) {
      console.error("❌ Error fetching Figma file:", error)
      throw error
    }
  }

  static async testConnection(token?: string): Promise<boolean> {
    const authToken = token || this.getToken()

    try {
      const response = await fetch(`${FIGMA_CONFIG.API_BASE_URL}/me`, {
        headers: {
          "X-Figma-Token": authToken,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("✅ Figma API connection successful:", userData.email)
        return true
      } else {
        console.warn("⚠️ Figma API connection failed:", response.status)
        return false
      }
    } catch (error) {
      console.error("❌ Figma API connection error:", error)
      return false
    }
  }

  static extractFileKey(url: string): string | null {
    const patterns = [/figma\.com\/file\/([a-zA-Z0-9]+)/, /figma\.com\/design\/([a-zA-Z0-9]+)/]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }
}
