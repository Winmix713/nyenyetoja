"use client"

import type React from "react"
import { useState } from "react"
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
  Calendar,
  User,
  Sparkles,
  Filter,
  SortAsc,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Custom hook for favorites
function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
      } else {
        newFavorites.add(templateId)
      }
      return newFavorites
    })
  }

  return { favorites, toggleFavorite }
}

// Template interface
interface Template {
  id: string
  title: string
  description: string
  category: string
  complexity: "Low" | "Medium" | "High"
  tags: string[]
  rating: number
  downloads: number
  author: string
  createdAt: string
  isNew?: boolean
  imageUrl?: string
}

// Template data
const templates: Template[] = [
  {
    id: "dark-product-card",
    title: "Dark Product Card",
    description:
      "Modern dark-themed product card with pricing and actions, featuring glassmorphism effects and smooth hover animations",
    category: "Cards",
    complexity: "Medium",
    tags: ["ecommerce", "product", "dark", "glassmorphism"],
    rating: 4.7,
    downloads: 2100,
    author: "Sarah Chen",
    createdAt: "2024-01-15",
    isNew: false,
  },
  {
    id: "modern-nav-header",
    title: "Modern Navigation Header",
    description:
      "Responsive navigation header with logo, menu items, and mobile hamburger menu with smooth transitions",
    category: "Navigation",
    complexity: "Medium",
    tags: ["responsive", "mobile", "hamburger", "transitions"],
    rating: 4.8,
    downloads: 1250,
    author: "Alex Rodriguez",
    createdAt: "2024-01-12",
    isNew: false,
  },
  {
    id: "dark-contact-form",
    title: "Dark Contact Form",
    description: "Beautiful dark-themed contact form with validation and loading states, perfect for modern websites",
    category: "Forms",
    complexity: "Medium",
    tags: ["validation", "loading", "dark", "modern"],
    rating: 4.9,
    downloads: 890,
    author: "Emma Thompson",
    createdAt: "2024-01-18",
    isNew: true,
  },
  {
    id: "pricing-table",
    title: "Pricing Table Component",
    description: "Clean pricing table with feature comparison and CTA buttons, optimized for conversions",
    category: "Cards",
    complexity: "Low",
    tags: ["pricing", "table", "comparison", "conversion"],
    rating: 4.6,
    downloads: 1850,
    author: "Michael Park",
    createdAt: "2024-01-10",
    isNew: false,
  },
  {
    id: "dashboard-sidebar",
    title: "Dashboard Sidebar",
    description: "Collapsible sidebar navigation for admin dashboards with smooth animations and dark theme support",
    category: "Navigation",
    complexity: "High",
    tags: ["dashboard", "admin", "sidebar", "collapsible"],
    rating: 4.5,
    downloads: 980,
    author: "David Kim",
    createdAt: "2024-01-08",
    isNew: false,
  },
  {
    id: "login-form",
    title: "Modern Login Form",
    description: "Sleek login form with social authentication options and beautiful gradient backgrounds",
    category: "Forms",
    complexity: "Low",
    tags: ["auth", "login", "social", "gradient"],
    rating: 4.8,
    downloads: 2340,
    author: "Lisa Wang",
    createdAt: "2024-01-20",
    isNew: true,
  },
  {
    id: "hero-section",
    title: "Animated Hero Section",
    description: "Eye-catching hero section with parallax effects and call-to-action buttons",
    category: "Sections",
    complexity: "Medium",
    tags: ["hero", "parallax", "animation", "cta"],
    rating: 4.9,
    downloads: 3200,
    author: "James Wilson",
    createdAt: "2024-01-22",
    isNew: true,
  },
  {
    id: "data-table",
    title: "Advanced Data Table",
    description: "Feature-rich data table with sorting, filtering, and pagination capabilities",
    category: "Tables",
    complexity: "High",
    tags: ["data", "table", "sorting", "pagination"],
    rating: 4.6,
    downloads: 1560,
    author: "Rachel Green",
    createdAt: "2024-01-14",
    isNew: false,
  },
]

// FilterChip component
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
        className={`transition-all duration-300 backdrop-blur-sm ${
          isSelected
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
            : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600 text-gray-300"
        }`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs bg-gray-700 text-gray-300">
            {count}
          </Badge>
        )}
      </Button>
    </motion.div>
  )
}

// TemplateCard component
interface TemplateCardProps {
  template: Template
  isFavorited: boolean
  onToggleFavorite: (id: string) => void
  viewMode: "grid" | "list"
  onPreview?: (template: Template) => void
  onUse?: (template: Template) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorited,
  onToggleFavorite,
  viewMode,
  onPreview,
  onUse,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const cardContent = (
    <>
      <CardContent className="p-0">
        <div
          className={`relative ${viewMode === "grid" ? "h-56" : "h-32"} bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden`}
        >
          <img
            src={template.imageUrl || `https://picsum.photos/500/400?random=${template.id}`}
            alt={template.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
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
                    onClick={() => onPreview?.(template)}
                    className="bg-white/90 text-black hover:bg-white backdrop-blur-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onUse?.(template)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Use
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite(template.id)}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isFavorited ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-black/50"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
          </motion.button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {template.isNew && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={`backdrop-blur-sm ${
                template.complexity === "Low"
                  ? "bg-green-500/80"
                  : template.complexity === "Medium"
                    ? "bg-yellow-500/80"
                    : "bg-red-500/80"
              } text-white`}
            >
              {template.complexity}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className={`flex-col items-start ${viewMode === "grid" ? "p-6" : "p-4"}`}>
        <div className="flex justify-between w-full mb-2">
          <h3
            className={`font-semibold text-white group-hover:text-blue-400 transition-colors ${
              viewMode === "grid" ? "text-lg" : "text-base"
            }`}
          >
            {template.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-400">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm">{template.rating}</span>
          </div>
        </div>

        <p className={`text-gray-400 mb-3 ${viewMode === "grid" ? "text-sm line-clamp-2" : "text-xs line-clamp-1"}`}>
          {template.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, viewMode === "grid" ? 4 : 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
            >
              {tag}
            </Badge>
          ))}
          {template.tags.length > (viewMode === "grid" ? 4 : 3) && (
            <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-700 text-gray-400">
              +{template.tags.length - (viewMode === "grid" ? 4 : 3)}
            </Badge>
          )}
        </div>

        <div className="flex justify-between w-full text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {getCategoryIcon(template.category)}
              {template.category}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {template.author}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(template.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {template.downloads.toLocaleString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </>
  )

  if (viewMode === "list") {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden backdrop-blur-sm">
          <div className="flex">
            <div className="w-48 flex-shrink-0">{cardContent}</div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10">
        {cardContent}
      </Card>
    </motion.div>
  )
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconClass = "w-3 h-3"
  switch (category) {
    case "Navigation":
      return <Layers className={iconClass} />
    case "Forms":
      return <Box className={iconClass} />
    case "Cards":
      return <CreditCard className={iconClass} />
    case "Buttons":
      return <MousePointer className={iconClass} />
    case "Tables":
      return <Grid className={iconClass} />
    case "Sections":
      return <Component className={iconClass} />
    default:
      return <Component className={iconClass} />
  }
}

// Props interface for the main component
interface ComponentTemplateLibraryProps {
  onTemplateSelect?: (template: Template) => void
  onTemplatePreview?: (template: Template) => void
  className?: string
}

// Main component
function ComponentTemplateLibrary({
  onTemplateSelect,
  onTemplatePreview,
  className = "",
}: ComponentTemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedComplexity, setSelectedComplexity] = useState("All")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()

  // Enhanced search that includes tags and description
  const filteredTemplates = templates
    .filter((template) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        template.title.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        template.author.toLowerCase().includes(searchLower)

      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
      const matchesComplexity = selectedComplexity === "All" || template.complexity === selectedComplexity
      const matchesFavorites = !showFavoritesOnly || favorites.has(template.id)

      return matchesSearch && matchesCategory && matchesComplexity && matchesFavorites
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "rating":
          return b.rating - a.rating
        case "downloads":
          return b.downloads - a.downloads
        case "popular":
        default:
          return b.downloads - a.downloads
      }
    })

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))]
  const complexities = ["All", "Low", "Medium", "High"]

  // Get category counts
  const getCategoryCount = (category: string) => {
    if (category === "All") return templates.length
    return templates.filter((t) => t.category === category).length
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 ${className}`}>
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Component className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Component Templates
              </span>
            </motion.div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Explore
              </a>
              <a href="#" className="text-blue-400 font-medium">
                Templates
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Docs
              </a>
            </nav>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
        >
          <div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Component Template Library
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl">
              Discover and use pre-built component templates with glassmorphism effects and smooth animations to
              accelerate your development
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Badge
              variant="secondary"
              className="text-sm px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-blue-300"
            >
              {templates.length}+ Templates
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-300"
            >
              {templates.filter((t) => t.isNew).length} New This Week
            </Badge>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 bg-gray-900/30 border-gray-800/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search templates, tags, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                {/* Favorites Toggle */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`h-12 ${
                      showFavoritesOnly
                        ? "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    Favorites ({favorites.size})
                  </Button>
                </motion.div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-3 mt-6">
                {categories.map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    icon={category !== "All" ? getCategoryIcon(category) : <Filter className="w-3 h-3" />}
                    isSelected={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                    count={getCategoryCount(category)}
                  />
                ))}
              </div>

              {/* Additional Filters */}
              <div className="flex flex-wrap gap-3 mt-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Complexity: {selectedComplexity}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    {complexities.map((complexity) => (
                      <DropdownMenuItem
                        key={complexity}
                        onClick={() => setSelectedComplexity(complexity)}
                        className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                      >
                        {complexity}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    >
                      <SortAsc className="w-4 h-4 mr-2" />
                      Sort:{" "}
                      {sortBy === "popular"
                        ? "Popular"
                        : sortBy === "recent"
                          ? "Recent"
                          : sortBy === "rating"
                            ? "Rating"
                            : "Downloads"}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    <DropdownMenuItem
                      onClick={() => setSortBy("popular")}
                      className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                    >
                      Most Popular
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("recent")}
                      className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                    >
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("rating")}
                      className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                    >
                      Highest Rated
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("downloads")}
                      className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                    >
                      Most Downloads
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <p className="text-gray-300 text-lg">{filteredTemplates.length} templates found</p>
            {searchQuery && <p className="text-gray-500 text-sm mt-1">Searching for "{searchQuery}"</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
              <Button
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className={`h-9 w-9 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className={`h-9 w-9 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`grid gap-6 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-4xl"
          }`}
        >
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <TemplateCard
                template={template}
                isFavorited={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
                viewMode={viewMode}
                onPreview={onTemplatePreview}
                onUse={onTemplateSelect}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-gray-800/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 backdrop-blur-sm">
              <Component className="w-12 h-12 text-gray-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No templates found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {showFavoritesOnly
                ? "You haven't favorited any templates yet. Start exploring to find templates you love!"
                : "Try adjusting your search criteria or browse all templates"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSelectedComplexity("All")
                  setShowFavoritesOnly(false)
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Clear All Filters
              </Button>
              {showFavoritesOnly && (
                <Button
                  variant="outline"
                  onClick={() => setShowFavoritesOnly(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Browse All Templates
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default ComponentTemplateLibrary
