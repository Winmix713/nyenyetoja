"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Eye, Layers, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FigmaNode } from "@/services/figma-api-service"

interface NodeRendererProps {
  nodes: FigmaNode[]
  onNodeSelect?: (node: FigmaNode) => void
  selectedNodeId?: string
}

export function NodeRenderer({ nodes, onNodeSelect, selectedNodeId }: NodeRendererProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree")

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "FRAME":
      case "COMPONENT":
      case "INSTANCE":
        return <Layers className="w-4 h-4 text-blue-400" />
      case "TEXT":
        return <span className="w-4 h-4 text-green-400 font-bold text-xs flex items-center justify-center">T</span>
      case "RECTANGLE":
      case "ELLIPSE":
        return <div className="w-4 h-4 bg-purple-400 rounded-sm" />
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-orange-400" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "FRAME":
        return "bg-blue-900/30 text-blue-300 border-blue-800/50"
      case "COMPONENT":
        return "bg-green-900/30 text-green-300 border-green-800/50"
      case "INSTANCE":
        return "bg-purple-900/30 text-purple-300 border-purple-800/50"
      case "TEXT":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-800/50"
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-800/50"
    }
  }

  const renderTreeNode = (node: FigmaNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNodeId === node.id

    return (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all
            hover:bg-gray-800/50 group
            ${isSelected ? "bg-blue-900/30 border border-blue-800/50" : ""}
          `}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.id)
            onNodeSelect?.(node)
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="p-0.5 hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {getNodeIcon(node.type)}

          <span className="text-white text-sm font-medium truncate flex-1">{node.name}</span>

          <Badge variant="secondary" className={`text-xs ${getNodeTypeColor(node.type)}`}>
            {node.type}
          </Badge>

          {node.absoluteBoundingBox && (
            <span className="text-xs text-gray-500 font-mono">
              {Math.round(node.absoluteBoundingBox.width)}×{Math.round(node.absoluteBoundingBox.height)}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4">{node.children!.map((child) => renderTreeNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const renderGridNode = (node: FigmaNode) => (
    <div
      key={node.id}
      className={`
        p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl cursor-pointer
        transition-all hover:bg-gray-800/60 hover:border-gray-600/50
        ${selectedNodeId === node.id ? "ring-2 ring-blue-500/50 bg-blue-900/20" : ""}
      `}
      onClick={() => onNodeSelect?.(node)}
    >
      <div className="flex items-center gap-3 mb-3">
        {getNodeIcon(node.type)}
        <span className="text-white font-medium truncate">{node.name}</span>
      </div>

      <div className="space-y-2">
        <Badge variant="secondary" className={`text-xs ${getNodeTypeColor(node.type)}`}>
          {node.type}
        </Badge>

        {node.absoluteBoundingBox && (
          <div className="text-xs text-gray-400 font-mono">
            {Math.round(node.absoluteBoundingBox.width)} × {Math.round(node.absoluteBoundingBox.height)}
          </div>
        )}

        {node.children && <div className="text-xs text-gray-500">{node.children.length} children</div>}
      </div>
    </div>
  )

  const rootNodes = nodes.filter((node) => !nodes.some((parent) => parent.children?.includes(node)))

  return (
    <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Figma Struktúra</h3>
          <p className="text-gray-400 text-sm">{nodes.length} node összesen</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={viewMode === "tree" ? "default" : "outline"} size="sm" onClick={() => setViewMode("tree")}>
            <Layers className="w-4 h-4 mr-2" />
            Fa nézet
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Eye className="w-4 h-4 mr-2" />
            Rács nézet
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {viewMode === "tree" ? (
          <div className="space-y-1">{rootNodes.map((node) => renderTreeNode(node))}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.slice(0, 12).map((node) => renderGridNode(node))}
          </div>
        )}
      </div>

      {nodes.length > 12 && viewMode === "grid" && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            További {nodes.length - 12} node megtekintése
          </Button>
        </div>
      )}
    </div>
  )
}
