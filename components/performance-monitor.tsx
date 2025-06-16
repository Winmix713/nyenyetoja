"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PerformanceMonitor } from "@/lib/performance"
import { Activity, Clock, Zap } from "lucide-react"

export function PerformanceMonitorPanel() {
  const [metrics, setMetrics] = useState<Record<string, { average: number; count: number }>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(PerformanceMonitor.getMetrics())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show Performance Metrics"
      >
        <Activity className="w-4 h-4" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto bg-gray-900/95 border-gray-700 text-white z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Metrics
          </CardTitle>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(metrics).length === 0 ? (
          <p className="text-gray-400 text-sm">No metrics available</p>
        ) : (
          Object.entries(metrics).map(([operation, data]) => (
            <div key={operation} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium">{operation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {data.average.toFixed(0)}ms
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {data.count}x
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
