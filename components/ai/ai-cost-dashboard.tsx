"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { aiCostManager } from "@/lib/ai-cost-manager"
import { DollarSign, TrendingUp, Clock, Zap, RefreshCw } from "lucide-react"

export function AICostDashboard() {
  const [usage, setUsage] = useState(aiCostManager.getUsageStats())
  const [limits, setLimits] = useState(aiCostManager.getLimits())
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setUsage(aiCostManager.getUsageStats())
      setLimits(aiCostManager.getLimits())
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const dailyUsagePercent = (usage.dailyCost / limits.daily) * 100
  const monthlyUsagePercent = (usage.monthlyCost / limits.monthly) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              AI Cost Dashboard
            </CardTitle>
            <CardDescription>Monitor your AI API usage and costs</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Total Requests</span>
            </div>
            <div className="text-2xl font-bold">{usage.totalRequests}</div>
            <div className="text-sm text-muted-foreground">All time</div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-2xl font-bold">{usage.dailyRequests}</div>
            <div className="text-sm text-muted-foreground">requests</div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Daily Cost</span>
            </div>
            <div className="text-2xl font-bold">${usage.dailyCost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">of ${limits.daily}</div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Monthly Cost</span>
            </div>
            <div className="text-2xl font-bold">${usage.monthlyCost.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">of ${limits.monthly}</div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Usage</span>
              <Badge
                variant={dailyUsagePercent > 80 ? "destructive" : dailyUsagePercent > 60 ? "secondary" : "default"}
              >
                {dailyUsagePercent.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={dailyUsagePercent} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>${usage.dailyCost.toFixed(2)}</span>
              <span>${limits.daily.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Usage</span>
              <Badge
                variant={monthlyUsagePercent > 80 ? "destructive" : monthlyUsagePercent > 60 ? "secondary" : "default"}
              >
                {monthlyUsagePercent.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={monthlyUsagePercent} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>${usage.monthlyCost.toFixed(2)}</span>
              <span>${limits.monthly.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Provider Breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3">Usage by Provider</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="default">Groq</Badge>
                <span className="text-sm">Free Tier</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{usage.groqRequests || 0} requests</div>
                <div className="text-sm text-muted-foreground">$0.00</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">OpenAI</Badge>
                <span className="text-sm">Paid Tier</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{usage.openaiRequests || 0} requests</div>
                <div className="text-sm text-muted-foreground">${(usage.openaiCost || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {dailyUsagePercent > 80 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ High Usage Alert</h4>
            <p className="text-sm text-yellow-700">
              You're approaching your daily limit. Consider using Groq (free) for non-critical tasks.
            </p>
          </div>
        )}

        {monthlyUsagePercent > 90 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">🚨 Monthly Limit Warning</h4>
            <p className="text-sm text-red-700">
              You're close to your monthly limit. New requests will automatically use Groq to avoid charges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
