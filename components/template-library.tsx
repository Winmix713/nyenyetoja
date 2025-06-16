"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, Star, Code, Heart, Zap, Layers, Palette, Grid, List } from "lucide-react"
import {
  COMPONENT_TEMPLATES,
  COMPONENT_CATEGORIES,
  type ComponentTemplate,
  type ComponentCategory,
} from "@/lib/component-templates"

interface TemplateLibraryProps {
  onSelectTemplate?: (template: ComponentTemplate) => void
  onPreviewTemplate?: (template: ComponentTemplate) => void
}

export function TemplateLibrary({ onSelectTemplate, onPreviewTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | "All">("All")
  const [complexityFilter, setComplexityFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "rating">("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filteredTemplates = useMemo(() => {
    let filtered = COMPONENT_TEMPLATES

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((template) => template.category === selectedCategory)
    }

    // Complexity filter
    if (complexityFilter !== "all") {
      filtered = filtered.filter((template) => template.complexity === complexityFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, complexityFilter, sortBy])

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
    } else {
      newFavorites.add(templateId)
    }
    setFavorites(newFavorites)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Navigation":
        return <Layers className="w-4 h-4" />
      case "Forms":
        return <Grid className="w-4 h-4" />
      case "Cards":
        return <Palette className="w-4 h-4" />
      case "Buttons":
        return <Zap className="w-4 h-4" />
      default:
        return <Code className="w-4 h-4" />
    }
  }

  const TemplateCard = ({ template }: { template: ComponentTemplate }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Preview Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={template.preview || "/placeholder.svg"}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPreviewTemplate?.(template)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => onSelectTemplate?.(template)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Use
            </Button>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(template.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart className={`w-4 h-4 ${favorites.has(template.id) ? "text-red-500 fill-current" : "text-gray-600"}`} />
        </button>

        {/* Complexity Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>{template.complexity}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{template.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            {template.rating}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {getCategoryIcon(template.category)}
            {template.category}
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {template.downloads.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )

  const TemplateListItem = ({ template }: { template: ComponentTemplate }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Preview Thumbnail */}
        <div className="w-20 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={template.preview || "/placeholder.svg"}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>{template.complexity}</Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                {template.rating}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{template.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                {getCategoryIcon(template.category)}
                {template.category}
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {template.downloads.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onPreviewTemplate?.(template)} className="h-8 px-3">
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={() => onSelectTemplate?.(template)} className="h-8 px-3">
                <Download className="w-3 h-3 mr-1" />
                Use
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Component Template Library</h1>
          <p className="text-gray-600">Discover and use pre-built component templates to accelerate your development</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("All")}
              >
                All
              </Button>
              {COMPONENT_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-1"
                >
                  {getCategoryIcon(category)}
                  {category}
                </Button>
              ))}
            </div>

            {/* Complexity Filter */}
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Complexity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
          </p>
          {favorites.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className="flex items-center gap-1"
            >
              <Heart className="w-4 h-4" />
              {favorites.size} Favorites
            </Button>
          )}
        </div>

        {/* Templates Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <TemplateListItem key={template.id} template={template} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse different categories</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setComplexityFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
