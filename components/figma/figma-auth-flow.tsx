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
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react"

export interface FigmaAuthFlowProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  className?: string
}

export function FigmaAuthFlow({ onSuccess, onError, className }: FigmaAuthFlowProps) {
  const [token, setToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const figma = useFigma()

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token.trim()) {
      onError?.("Please enter a Figma access token")
      return
    }

    try {
      const success = await figma.connect(token.trim())
      if (success && figma.connectionResult?.user) {
        onSuccess?.(figma.connectionResult.user)
      } else {
        onError?.(figma.error || "Failed to connect to Figma")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed"
      onError?.(errorMessage)
    }
  }

  const handleDisconnect = () => {
    figma.disconnect()
    setToken("")
  }

  if (figma.isConnected && figma.connectionResult?.user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Connected to Figma
          </CardTitle>
          <CardDescription>
            Successfully authenticated with Figma API
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              {figma.connectionResult.user.imgUrl && (
                <img
                  src={figma.connectionResult.user.imgUrl}
                  alt={figma.connectionResult.user.handle}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{figma.connectionResult.user.handle}</div>
                <div className="text-sm text-muted-foreground">
                  {figma.connectionResult.user.email}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Connected
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={figma.testConnection} disabled={figma.isLoading}>
              {figma.isLoading ? (
                <Spinner size="sm" />
              ) : (
                "Test Connection"
              )}
            </Button>
            
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Connect to Figma</CardTitle>
        <CardDescription>
          Enter your Figma access token to connect to the Figma API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="figma-token">Figma Access Token</Label>
            <div className="relative">
              <Input
                id="figma-token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="figd_..."
                className="pr-10"
                disabled={figma.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your token will be encrypted and stored securely in your browser.
            </p>
          </div>

          {figma.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{figma.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              disabled={figma.isLoading || !token.trim()}
            >
              {figma.isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect to Figma"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => window.open("https://www.figma.com/developers/api#access-tokens", "_blank")}
            >
              Get Token
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">How to get your Figma token:</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to your Figma account settings</li>
            <li>Navigate to "Personal access tokens"</li>
            <li>Click "Create new token"</li>
            <li>Give it a name and copy the generated token</li>
            <li>Paste the token above to connect</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}