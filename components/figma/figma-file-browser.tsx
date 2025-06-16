'use client'

import * as React from "react"
import { useState } from "react"
import { useFigma } from "@/hooks/core/use-figma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  Calendar,
  Layers,
  Component
} from "lucide-react"

export interface FigmaFileBrowserProps {
  onFileSelected?: (fileData: any) => void
  onError?: (error: string) => void
  className?: string
}

export function FigmaFileBrowser({ onFileSelected, onError, className }: FigmaFileBrowserProps) {
  const [url, setUrl] = useState("")
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    fileKey?: string
    error?: string
  } | null>(null)
  
  const figma = useFigma()

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl)
    setValidationResult(null)
    
    if (!newUrl.trim()) {
      return
    }

    // Debounce validation
    const timeoutId = setTimeout(async () => {
      try {
        const result = await figma.validateUrl(newUrl)
        setValidationResult(result)
      } catch (error) {
        console.error("URL validation error:", error)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleLoadFile = async () => {
    if (!url.trim()) {
      onError?.("Please enter a Figma URL")
      return
    }

    try {
      await figma.loadFile(url)
      if (figma.fileData) {
        onFileSelected?.(figma.fileData)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load file"
      onError?.(errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getNodeCount = (node: any): number => {
    let count = 1
    if (node.children) {
      for (const child of node.children) {
        count += getNodeCount(child)
      }
    }
    return count
  }

  const getComponentCount = (components: Record<string, any>): number => {
    return Object.keys(components || {}).length
  }

  if (!figma.isConnected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <EmptyState
            icon={<AlertCircle className="h-8 w-8" />}
            title="Connect to Figma First"
            description="You need to connect to Figma before you can browse files."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Figma File Browser
        </CardTitle>
        <CardDescription>
          Enter a Figma file URL to load and preview the design
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="figma-url">Figma File URL</Label>
          <Input
            id="figma-url"
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.figma.com/file/..."
            disabled={figma.isLoading}
          />
          
          {/* URL Validation Feedback */}
          {validationResult && (
            <div className="flex items-center gap-2 text-sm">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    Valid Figma URL
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">
                    {validationResult.error}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {figma.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{figma.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleLoadFile}
            disabled={figma.isLoading || !validationResult?.valid}
            className="flex-1"
          >
            {figma.isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Loading File...
              </>
            ) : (
              "Load File"
            )}
          </Button>

          {url && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(url, "_blank")}
              title="Open in Figma"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* File Preview */}
        {figma.fileData && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{figma.fileData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Version {figma.fileData.version}
                  </p>
                </div>
                
                {figma.fileData.thumbnailUrl && (
                  <img
                    src={figma.fileData.thumbnailUrl}
                    alt={figma.fileData.name}
                    className="w-16 h-12 object-cover rounded border"
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-sm font-medium">
                    {getNodeCount(figma.fileData.document)}
                  </div>
                  <div className="text-xs text-muted-foreground">Nodes</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Component className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-sm font-medium">
                    {getComponentCount(figma.fileData.components)}
                  </div>
                  <div className="text-xs text-muted-foreground">Components</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-xs font-medium">
                    {formatDate(figma.fileData.lastModified)}
                  </div>
                  <div className="text-xs text-muted-foreground">Modified</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Schema v{figma.fileData.schemaVersion}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFileSelected?.(figma.fileData)}
                >
                  Use This File
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> You can paste any Figma file URL, including:
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>figma.com/file/[file-id]/...</li>
            <li>figma.com/design/[file-id]/...</li>
            <li>figma.com/proto/[file-id]/...</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}