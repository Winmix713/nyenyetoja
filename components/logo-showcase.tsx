"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import FingmAILogo from "@/components/ui/fingmai-logo"
import CompactFingmAILogo from "@/components/ui/compact-fingmai-logo"
import { Eye, Code, Palette } from "lucide-react"

const LogoShowcase = () => {
  const [activeDemo, setActiveDemo] = useState<"full" | "compact" | "header">("full")

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            <Palette className="w-4 h-4 mr-2" />
            Logo Integration Complete
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">FingmAI Logo Showcase</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the different variations of our new animated logo with Framer Motion integration
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex justify-center space-x-4">
          <Button variant={activeDemo === "full" ? "default" : "outline"} onClick={() => setActiveDemo("full")}>
            <Eye className="w-4 h-4 mr-2" />
            Full Logo
          </Button>
          <Button variant={activeDemo === "compact" ? "default" : "outline"} onClick={() => setActiveDemo("compact")}>
            <Code className="w-4 h-4 mr-2" />
            Compact Logo
          </Button>
          <Button variant={activeDemo === "header" ? "default" : "outline"} onClick={() => setActiveDemo("header")}>
            <Palette className="w-4 h-4 mr-2" />
            Header Integration
          </Button>
        </div>

        {/* Demo Area */}
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle>
              {activeDemo === "full" && "Full Logo Animation"}
              {activeDemo === "compact" && "Compact Logo Variations"}
              {activeDemo === "header" && "Header Integration"}
            </CardTitle>
            <CardDescription>
              {activeDemo === "full" && "Complete logo with all animations and effects"}
              {activeDemo === "compact" && "Smaller logo variations for navigation and headers"}
              {activeDemo === "header" && "Logo integrated into the application header"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeDemo === "full" && (
              <div className="h-[500px] bg-gradient-to-br from-background to-muted/20 rounded-lg overflow-hidden">
                <FingmAILogo />
              </div>
            )}

            {activeDemo === "compact" && (
              <div className="space-y-8 py-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Small Size</h3>
                  <div className="p-6 bg-muted/20 rounded-lg">
                    <CompactFingmAILogo size="sm" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medium Size</h3>
                  <div className="p-6 bg-muted/20 rounded-lg">
                    <CompactFingmAILogo size="md" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Large Size</h3>
                  <div className="p-6 bg-muted/20 rounded-lg">
                    <CompactFingmAILogo size="lg" />
                  </div>
                </div>
              </div>
            )}

            {activeDemo === "header" && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    The logo has been integrated into the main header component with responsive design
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-background border-b p-4">
                      <CompactFingmAILogo size="sm" />
                    </div>
                    <div className="p-8 text-center text-muted-foreground">
                      <p>Header content area</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Animated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Smooth animations with Framer Motion including rotating circles, gradient text, and floating particles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Responsive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fully responsive design that works on all screen sizes with mobile-optimized animations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Theme Aware
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically adapts to light and dark themes using shadcn/ui design tokens
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LogoShowcase
