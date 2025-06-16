"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Info, X, Bell, Lightbulb, Zap, Clock } from "lucide-react"

export interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error" | "tip"
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  persistent?: boolean
  timestamp: number
}

interface SmartNotificationsProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onDismissAll: () => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  maxVisible?: number
}

export function SmartNotifications({
  notifications,
  onDismiss,
  onDismissAll,
  position = "top-right",
  maxVisible = 5,
}: SmartNotificationsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-dismiss non-persistent notifications
  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notification.persistent && notification.duration) {
        const timer = setTimeout(() => {
          onDismiss(notification.id)
        }, notification.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onDismiss])

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "tip":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4"
      case "bottom-right":
        return "bottom-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
      default:
        return "top-4 right-4"
    }
  }

  const visibleNotifications = notifications.slice(0, maxVisible)
  const hiddenCount = notifications.length - maxVisible

  if (notifications.length === 0) return null

  return (
    <div className={`fixed ${getPositionClasses()} z-50 w-96 max-w-[calc(100vw-2rem)]`}>
      {/* Header */}
      {notifications.length > 1 && (
        <div className="mb-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Bell className="w-4 h-4 mr-2" />
            {notifications.length} notification{notifications.length > 1 ? "s" : ""}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismissAll} className="text-gray-500 hover:text-gray-700">
            Clear all
          </Button>
        </div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {!isCollapsed &&
          visibleNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.1,
              }}
              className="mb-3"
            >
              <Card className={`border-2 ${getNotificationColor(notification.type)} shadow-lg`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {notification.type === "tip" && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              Tip
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDismiss(notification.id)}
                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{notification.message}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {notification.action && (
                          <Button size="sm" variant="outline" onClick={notification.action.onClick} className="text-xs">
                            {notification.action.label}
                          </Button>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Hidden notifications indicator */}
      {hiddenCount > 0 && !isCollapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)} className="text-gray-500 text-xs">
            +{hiddenCount} more notification{hiddenCount > 1 ? "s" : ""}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// Hook for managing notifications
export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      duration: notification.duration || (notification.type === "error" ? 8000 : 5000),
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const dismissAll = () => {
    setNotifications([])
  }

  // Predefined notification types
  const success = (title: string, message: string, action?: Notification["action"]) => {
    addNotification({ type: "success", title, message, action })
  }

  const error = (title: string, message: string, action?: Notification["action"]) => {
    addNotification({ type: "error", title, message, action, persistent: true })
  }

  const warning = (title: string, message: string, action?: Notification["action"]) => {
    addNotification({ type: "warning", title, message, action })
  }

  const info = (title: string, message: string, action?: Notification["action"]) => {
    addNotification({ type: "info", title, message, action })
  }

  const tip = (title: string, message: string, action?: Notification["action"]) => {
    addNotification({ type: "tip", title, message, action, duration: 10000 })
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    success,
    error,
    warning,
    info,
    tip,
  }
}
