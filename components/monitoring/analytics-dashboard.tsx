"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Download, Clock, TrendingUp, Activity, FileText, Zap, RefreshCw } from "lucide-react"

interface AnalyticsData {
  conversions: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  users: {
    active: number
    new: number
    returning: number
  }
  performance: {
    averageConversionTime: number
    successRate: number
    errorRate: number
  }
  exports: {
    zip: number
    github: number
    total: number
  }
  popularFeatures: Array<{
    name: string
    usage: number
    trend: "up" | "down" | "stable"
  }>
  recentActivity: Array<{
    id: string
    type: "conversion" | "export" | "error"
    description: string
    timestamp: number
  }>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data - replace with real analytics service
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: AnalyticsData = {
        conversions: {
          total: 1247,
          today: 23,
          thisWeek: 156,
          thisMonth: 432,
        },
        users: {
          active: 89,
          new: 34,
          returning: 55,
        },
        performance: {
          averageConversionTime: 12.5,
          successRate: 94.2,
          errorRate: 5.8,
        },
        exports: {
          zip: 234,
          github: 189,
          total: 423,
        },
        popularFeatures: [
          { name: "AI Template Matching", usage: 87, trend: "up" },
          { name: "GitHub Export", usage: 72, trend: "up" },
          { name: "Multi-step Wizard", usage: 65, trend: "stable" },
          { name: "Component Preview", usage: 58, trend: "down" },
          { name: "CSS Generation", usage: 45, trend: "up" },
        ],
        recentActivity: [
          {
            id: "1",
            type: "conversion",
            description: "User converted Figma design to React component",
            timestamp: Date.now() - 300000,
          },
          {
            id: "2",
            type: "export",
            description: "Component exported to GitHub repository",
            timestamp: Date.now() - 600000,
          },
          {
            id: "3",
            type: "error",
            description: "Failed to parse Figma file - invalid URL",
            timestamp: Date.now() - 900000,
          },
        ],
      }

      setData(mockData)
      setIsLoading(false)
      setLastUpdated(new Date())
    }

    fetchAnalytics()

    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
      default:
        return <Activity className="w-3 h-3 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{data.conversions.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">+{data.conversions.today} today</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.users.active}</p>
                <p className="text-xs text-gray-500 mt-1">{data.users.new} new users</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.performance.successRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{data.performance.errorRate}% errors</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(data.performance.averageConversionTime)}</p>
                <p className="text-xs text-gray-500 mt-1">per conversion</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversions Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Conversion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold">{data.conversions.thisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold">{data.conversions.thisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="font-semibold">{data.conversions.today}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ZIP Downloads</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{data.exports.zip}</span>
                      <Badge variant="secondary">{Math.round((data.exports.zip / data.exports.total) * 100)}%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GitHub Exports</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{data.exports.github}</span>
                      <Badge variant="secondary">{Math.round((data.exports.github / data.exports.total) * 100)}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.popularFeatures.map((feature, index) => (
                  <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{feature.usage}% usage</span>
                      {getTrendIcon(feature.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "conversion"
                          ? "bg-blue-100"
                          : activity.type === "export"
                            ? "bg-green-100"
                            : "bg-red-100"
                      }`}
                    >
                      {activity.type === "conversion" && <FileText className="w-4 h-4 text-blue-600" />}
                      {activity.type === "export" && <Download className="w-4 h-4 text-green-600" />}
                      {activity.type === "error" && <Activity className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
