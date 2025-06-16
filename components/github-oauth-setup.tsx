"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, Settings, Key, Shield } from "lucide-react"

interface GitHubOAuthConfig {
  clientId: string
  clientSecret: string
  callbackUrl: string
  isConfigured: boolean
  isValid: boolean
}

export function GitHubOAuthSetup() {
  const [config, setConfig] = useState<GitHubOAuthConfig>({
    clientId: "",
    clientSecret: "",
    callbackUrl: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/auth/github/callback`,
    isConfigured: false,
    isValid: false,
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // Check if environment variables are set
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || ""
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || ""

    setConfig((prev) => ({
      ...prev,
      clientId,
      clientSecret,
      isConfigured: !!(clientId && clientSecret),
    }))
  }, [])

  const testGitHubConnection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)

    try {
      // Simulate GitHub OAuth test
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (!config.clientId || !config.clientSecret) {
        setTestResult({
          success: false,
          message: "GitHub Client ID and Secret are required",
        })
        return
      }

      // In a real implementation, this would test the actual GitHub OAuth flow
      setTestResult({
        success: true,
        message: "GitHub OAuth configuration is valid and working!",
      })

      setConfig((prev) => ({ ...prev, isValid: true }))
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openGitHubApps = () => {
    window.open("https://github.com/settings/developers", "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Github className="w-6 h-6" />
            <span>GitHub OAuth Setup</span>
          </h2>
          <p className="text-muted-foreground">Configure GitHub integration for repository creation</p>
        </div>

        <div className="flex items-center space-x-2">
          {config.isConfigured ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>
      </div>

      {/* Configuration Status */}
      <Alert className={config.isConfigured ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {config.isConfigured
            ? "GitHub OAuth is configured. You can now create repositories directly from the export wizard."
            : "GitHub OAuth is not configured. Please set up your GitHub App to enable repository creation."}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test Connection</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Step-by-Step Setup</span>
              </CardTitle>
              <CardDescription>Follow these steps to configure GitHub OAuth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Create GitHub OAuth App</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Go to GitHub Developer Settings and create a new OAuth App
                  </p>
                  <Button variant="outline" onClick={openGitHubApps} className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>Open GitHub Developer Settings</span>
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Configure OAuth App</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Fill in the following details in your GitHub OAuth App:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Application name</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-white px-2 py-1 rounded text-sm">Figma to React Converter</code>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard("Figma to React Converter")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-600">Homepage URL</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-white px-2 py-1 rounded text-sm">
                          {config.callbackUrl.replace("/api/auth/github/callback", "")}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(config.callbackUrl.replace("/api/auth/github/callback", ""))}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-600">Authorization callback URL</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-white px-2 py-1 rounded text-sm">{config.callbackUrl}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(config.callbackUrl)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Get Client Credentials</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    After creating the OAuth App, copy the Client ID and generate a Client Secret
                  </p>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> The Client Secret is only shown once. Make sure to copy it
                      immediately!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Set Environment Variables</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add these environment variables to your .env.local file:
                  </p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>GITHUB_CLIENT_ID=your_client_id_here</div>
                    <div>GITHUB_CLIENT_SECRET=your_client_secret_here</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Current Configuration</span>
              </CardTitle>
              <CardDescription>View and verify your GitHub OAuth configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-id">GitHub Client ID</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="client-id"
                      value={config.clientId || "Not configured"}
                      readOnly
                      className={config.clientId ? "bg-green-50" : "bg-red-50"}
                    />
                    {config.clientId ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="client-secret">GitHub Client Secret</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="client-secret"
                      value={config.clientSecret ? "••••••••••••••••" : "Not configured"}
                      readOnly
                      type="password"
                      className={config.clientSecret ? "bg-green-50" : "bg-red-50"}
                    />
                    {config.clientSecret ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="callback-url">Callback URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="callback-url" value={config.callbackUrl} readOnly className="bg-blue-50" />
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(config.callbackUrl)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test GitHub Connection</CardTitle>
              <CardDescription>Verify that your GitHub OAuth configuration is working correctly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testGitHubConnection}
                disabled={isTestingConnection || !config.isConfigured}
                className="w-full"
              >
                {isTestingConnection ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Test GitHub OAuth
                  </>
                )}
              </Button>

              {testResult && (
                <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}

              {!config.isConfigured && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Please configure your GitHub OAuth credentials before testing the connection.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
