"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Star,
  Download,
  Heart,
  Eye,
  ChevronDown,
  Grid,
  List,
  Layers,
  Box,
  CreditCard,
  MousePointer,
  Component,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  COMPONENT_TEMPLATES,
  COMPONENT_CATEGORIES,
  type ComponentTemplate,
  type ComponentCategory,
} from "@/lib/component-templates"

interface EnhancedTemplateLibraryProps {
  onSelectTemplate?: (template: ComponentTemplate) => void
  onPreviewTemplate?: (template: ComponentTemplate) => void
  className?: string
}

// FilterChip component with enhanced styling
interface FilterChipProps {
  label: string
  icon?: React.ReactNode
  isSelected: boolean
  onClick: () => void
  count?: number
}

const FilterChip: React.FC<FilterChipProps> = ({ label, icon, isSelected, onClick, count }) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="sm"
        variant={isSelected ? "default" : "outline"}
        onClick={onClick}
        className={`transition-all duration-200 ${
          isSelected
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
            : "bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600/50"
        }`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="ml-2 bg-gray-700/50 text-gray-300 text-xs">
            {count}
          </Badge>
        )}
      </Button>
    </motion.div>
  )
}

// Enhanced TemplateCard component
interface TemplateCardProps {
  template: ComponentTemplate
  onSelect: (template: ComponentTemplate) => void
  onPreview: (template: ComponentTemplate) => void
  isFavorited: boolean
  onToggleFavorite: (templateId: string) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onPreview,
  isFavorited,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "bg-green-900/30 text-green-300 border-green-800/50"
      case "medium":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-800/50"
      case "high":
        return "bg-red-900/30 text-red-300 border-red-800/50"
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-800/50"
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-4 h-4"
    switch (category) {
      case "Navigation":
        return <Layers className={iconClass} />
      case "Forms":
        return <Box className={iconClass} />
      case "Cards":
        return <CreditCard className={iconClass} />
      case "Buttons":
        return <MousePointer className={iconClass} />
      case "Dashboard":
        return <TrendingUp className={iconClass} />
      default:
        return <Component className={iconClass} />
    }
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="bg-gray-900/80 border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 overflow-hidden backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
            <img
              src={template.preview || "/placeholder.svg?height=300&width=400"}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onPreview(template)}
                      className="bg-white/90 hover:bg-white text-black shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSelect(template)}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorite button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleFavorite(template.id)}
              className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>

            {/* Complexity badge */}
            <Badge className={`absolute top-3 left-3 ${getComplexityColor(template.complexity)} backdrop-blur-sm`}>
              {template.complexity}
            </Badge>

            {/* New badge for recent templates */}
            {new Date(template.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
              <Badge className="absolute top-12 left-3 bg-green-600/90 text-white backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between w-full">
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">
              {template.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-400">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{template.rating}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{template.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 w-full">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-700/50 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700/50">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer metadata */}
          <div className="flex justify-between w-full text-xs text-gray-500 pt-2 border-t border-gray-800/50">
            <div className="flex items-center gap-1">
              {getCategoryIcon(template.category)}
              <span>{template.category}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{template.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{template.author}</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Main Enhanced Template Library Component
export function EnhancedTemplateLibrary({
  onSelectTemplate,
  onPreviewTemplate,
  className = "",
}: EnhancedTemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | "All">("All")
  const [selectedComplexity, setSelectedComplexity] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "rating">("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filter and sort templates
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
    if (selectedComplexity !== "all") {
      filtered = filtered.filter((template) => template.complexity === selectedComplexity)
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
  }, [searchQuery, selectedCategory, selectedComplexity, sortBy])

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    COMPONENT_TEMPLATES.forEach((template) => {
      counts[template.category] = (counts[template.category] || 0) + 1
    })
    return counts
  }, [])

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
    } else {
      newFavorites.add(templateId)
    }
    setFavorites(newFavorites)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedComplexity("all")
  }

  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-800/50 bg-black/95 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Component className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">Component Templates</h1>
                <p className="text-sm text-gray-400">Professional React components</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Explore
              </a>
              <a href="#" className="text-blue-400 font-medium">
                Templates
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Documentation
              </a>
            </nav>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Component Template Library
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Discover and use professionally crafted component templates to accelerate your development workflow
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Component className="w-4 h-4" />
              <span>{COMPONENT_TEMPLATES.length}+ Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>4.8 Average Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>50K+ Downloads</span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="mb-8 bg-gray-900/50 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search templates, categories, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 text-lg focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <FilterChip
                  label="All Categories"
                  isSelected={selectedCategory === "All"}
                  onClick={() => setSelectedCategory("All")}
                  count={COMPONENT_TEMPLATES.length}
                />
                {COMPONENT_CATEGORIES.map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    icon={
                      category === "Navigation" ? (
                        <Layers className="w-4 h-4" />
                      ) : category === "Forms" ? (
                        <Box className="w-4 h-4" />
                      ) : category === "Cards" ? (
                        <CreditCard className="w-4 h-4" />
                      ) : category === "Buttons" ? (
                        <MousePointer className="w-4 h-4" />
                      ) : category === "Dashboard" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <Component className="w-4 h-4" />
                      )
                    }
                    isSelected={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                    count={categoryCounts[category] || 0}
                  />
                ))}
              </div>

              {/* Additional Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50">
                      Complexity: {selectedComplexity === "all" ? "All" : selectedComplexity}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-800">
                    {["all", "low", "medium", "high"].map((complexity) => (
                      <DropdownMenuItem
                        key={complexity}
                        onClick={() => setSelectedComplexity(complexity as any)}
                        className="text-gray-300 hover:bg-gray-800 hover:text-white capitalize"
                      >
                        {complexity === "all" ? "All Levels" : complexity}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50">
                      Sort:{" "}
                      {sortBy === "popular" ? "Most Popular" : sortBy === "recent" ? "Most Recent" : "Highest Rated"}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-800">
                    <DropdownMenuItem
                      onClick={() => setSortBy("popular")}
                      className="text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Most Popular
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("recent")}
                      className="text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("rating")}
                      className="text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Highest Rated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 ml-auto">
                  <Button
                    size="icon"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <p className="text-gray-400 text-lg">
              <span className="text-white font-semibold">{filteredTemplates.length}</span> templates found
            </p>
            {favorites.size > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                <Heart className="w-4 h-4 inline mr-1 text-red-500" />
                {favorites.size} favorited
              </p>
            )}
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`grid gap-8 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          }`}
        >
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <TemplateCard
                template={template}
                onSelect={onSelectTemplate || (() => {})}
                onPreview={onPreviewTemplate || (() => {})}
                isFavorited={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No templates found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any templates matching your criteria. Try adjusting your search or browse all templates.
            </p>
            <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  )
}
