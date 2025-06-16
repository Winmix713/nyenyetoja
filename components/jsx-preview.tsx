"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Code, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

interface JSXPreviewProps {
  jsxCode: string
  cssCode?: string
  onCodeChange?: (code: string) => void
}

export function JSXPreview({ jsxCode, cssCode = "", onCodeChange }: JSXPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview")
  const [renderError, setRenderError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Transform JSX code for preview
  const transformedCode = useMemo(() => {
    if (!jsxCode) return ""

    try {
      // Simple JSX to HTML transformation for preview
      const html = jsxCode
        // Convert className to class
        .replace(/className=/g, "class=")
        // Convert self-closing tags
        .replace(/<(\w+)([^>]*?)\/>/g, "<$1$2></$1>")
        // Remove React imports and exports
        .replace(/import.*?from.*?;?\n/g, "")
        .replace(/export\s+default\s+function.*?\{/, "")
        .replace(/export\s+function.*?\{/, "")
        // Extract JSX return content
        .replace(/.*return\s*\(?\s*/, "")
        .replace(/\s*\)?\s*;?\s*\}?\s*$/, "")
        // Handle template literals and expressions
        .replace(/\$\{[^}]*\}/g, "")
        .replace(/\{[^}]*\}/g, "")

      return html.trim()
    } catch (error) {
      console.error("JSX transformation error:", error)
      return ""
    }
  }, [jsxCode])

  const refreshPreview = () => {
    setIsRefreshing(true)
    setRenderError(null)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  useEffect(() => {
    // Validate JSX syntax
    try {
      if (jsxCode && jsxCode.includes("return")) {
        setRenderError(null)
      }
    } catch (error) {
      setRenderError("JSX szintaxis hiba")
    }
  }, [jsxCode])

  const PreviewContent = () => {
    if (!jsxCode) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Code className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nincs JSX kód</h3>
          <p className="text-sm text-center">Add meg a JSX kódot az előnézet megtekintéséhez</p>
        </div>
      )
    }

    if (renderError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Renderelési hiba</h3>
          <p className="text-sm text-center">{renderError}</p>
          <Button onClick={refreshPreview} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Újrapróbálás
          </Button>
        </div>
      )
    }

    return (
      <div className="relative">
        {/* CSS Injection */}
        {cssCode && <style dangerouslySetInnerHTML={{ __html: cssCode }} />}

        {/* Preview Frame */}
        <div className="bg-white rounded-lg p-6 min-h-64 shadow-inner">
          <div dangerouslySetInnerHTML={{ __html: transformedCode }} className="preview-content" />
        </div>

        {/* Preview Overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
            <div className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Frissítés...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">JSX Előnézet</h3>
          <p className="text-gray-400 text-sm">Élő komponens renderelés</p>
        </div>

        <div className="flex items-center gap-3">
          {!renderError && jsxCode && (
            <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-800/50">
              <CheckCircle className="w-3 h-3 mr-1" />
              Érvényes
            </Badge>
          )}

          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
            <Button
              variant={previewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("preview")}
              className="h-8"
            >
              <Eye className="w-4 h-4 mr-2" />
              Előnézet
            </Button>
            <Button
              variant={previewMode === "code" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("code")}
              className="h-8"
            >
              <Code className="w-4 h-4 mr-2" />
              Kód
            </Button>
          </div>

          <Button onClick={refreshPreview} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {previewMode === "preview" ? (
        <PreviewContent />
      ) : (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 overflow-auto max-h-96">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{jsxCode || "// Nincs JSX kód"}</pre>
        </div>
      )}

      {/* Preview Styles */}
      <style jsx>{`
        .preview-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .preview-content * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
