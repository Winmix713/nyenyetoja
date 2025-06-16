// Figma API konfiguráció
export const FIGMA_CONFIG = {
  // Remove hardcoded token - will use environment variable or user input
  TOKEN: process.env.NEXT_PUBLIC_FIGMA_ACCESS_TOKEN || "",
  API_BASE_URL: "https://api.figma.com/v1",
  STORAGE_KEY: "figma-token",
  CONNECTION_STATUS_KEY: "figma-connection-status",
  DEMO_MODE_KEY: "figma-demo-mode",
}

export interface FigmaFileResponse {
  document: any
  components: any
  schemaVersion: number
  styles: any
  name: string
  lastModified: string
  thumbnailUrl: string
  version: string
  role: string
  editorType: string
  linkAccess: string
}

// Demo mode data for testing without API
export const DEMO_FILE_DATA = {
  name: "Demo Design System",
  lastModified: new Date().toISOString(),
  schemaVersion: 4,
  components: {
    "demo-button": {
      key: "demo-button",
      name: "Button",
      description: "Primary button component",
    },
    "demo-card": {
      key: "demo-card",
      name: "Card",
      description: "Card container component",
    },
  },
  document: {
    id: "demo-document",
    name: "Demo Document",
    type: "DOCUMENT",
  },
}

// Check if demo mode is enabled
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(FIGMA_CONFIG.DEMO_MODE_KEY) === "true"
}

// Enable demo mode
export function enableDemoMode(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(FIGMA_CONFIG.DEMO_MODE_KEY, "true")
    localStorage.setItem(FIGMA_CONFIG.CONNECTION_STATUS_KEY, "true")
  }
}

// Disable demo mode
export function disableDemoMode(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(FIGMA_CONFIG.DEMO_MODE_KEY)
    localStorage.setItem(FIGMA_CONFIG.CONNECTION_STATUS_KEY, "false")
  }
}

// Token inicializálás és validálás
export async function initializeFigmaToken(): Promise<boolean> {
  try {
    // Check if demo mode is enabled
    if (isDemoMode()) {
      console.log("🎭 Demo mode enabled - skipping API connection")
      localStorage.setItem(FIGMA_CONFIG.CONNECTION_STATUS_KEY, "true")
      return true
    }

    // Ellenőrizzük, hogy van-e token
    const existingToken = localStorage.getItem(FIGMA_CONFIG.STORAGE_KEY) || FIGMA_CONFIG.TOKEN

    if (!existingToken) {
      console.log("⚠️ No Figma token available - enabling demo mode")
      enableDemoMode()
      return true
    }

    // Teszteljük a kapcsolatot
    const isConnected = await testFigmaConnection()

    if (!isConnected) {
      console.log("⚠️ API connection failed - enabling demo mode")
      enableDemoMode()
      return true
    }

    // Státusz mentése
    localStorage.setItem(FIGMA_CONFIG.CONNECTION_STATUS_KEY, isConnected.toString())
    return isConnected
  } catch (error) {
    console.error("❌ Figma token inicializálás sikertelen:", error)
    console.log("🎭 Falling back to demo mode")
    enableDemoMode()
    return true // Return true for demo mode
  }
}

// API kapcsolat tesztelése
export async function testFigmaConnection(): Promise<boolean> {
  try {
    // Skip API test in demo mode
    if (isDemoMode()) {
      return true
    }

    const token = localStorage.getItem(FIGMA_CONFIG.STORAGE_KEY) || FIGMA_CONFIG.TOKEN
    if (!token) {
      console.warn("⚠️ No Figma API token available")
      return false
    }

    if (!validateTokenFormat(token)) {
      console.warn("⚠️ Invalid token format")
      return false
    }

    const response = await fetch(`${FIGMA_CONFIG.API_BASE_URL}/me`, {
      headers: {
        "X-Figma-Token": token,
      },
    })

    if (response.ok) {
      const userData = await response.json()
      console.log("✅ Figma API kapcsolat sikeres:", userData.email)
      disableDemoMode() // Disable demo mode on successful connection
      return true
    } else {
      console.warn("⚠️ Figma API kapcsolat sikertelen:", response.status, response.statusText)
      if (response.status === 403) {
        throw new Error("Invalid Figma API token or insufficient permissions")
      } else if (response.status === 401) {
        throw new Error("Figma API token is invalid or expired")
      }
      return false
    }
  } catch (error) {
    console.error("❌ Figma API kapcsolat hiba:", error)
    // Don't throw error - let demo mode handle it
    return false
  }
}

// Token lekérése
export function getFigmaToken(): string | null {
  return localStorage.getItem(FIGMA_CONFIG.STORAGE_KEY)
}

// Kapcsolat státusz lekérése
export function getFigmaConnectionStatus(): boolean {
  const status = localStorage.getItem(FIGMA_CONFIG.CONNECTION_STATUS_KEY)
  return status === "true"
}

// Token formátum validálása
export function validateTokenFormat(token: string): boolean {
  // Figma tokens typically start with 'figd_' and are 40+ characters
  return token.startsWith("figd_") && token.length >= 40
}
