"use client"

export interface ComponentTemplate {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  complexity: "low" | "medium" | "high"
  jsx: string
  css: string
  typescript: string
  preview: string
  figmaUrl?: string
  author: string
  createdAt: string
  downloads: number
  rating: number
  dependencies: string[]
}

export const COMPONENT_CATEGORIES = [
  "Navigation",
  "Forms",
  "Cards",
  "Buttons",
  "Layout",
  "Data Display",
  "Feedback",
  "Media",
  "E-commerce",
  "Dashboard",
] as const

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // Navigation Components
  {
    id: "nav-header-modern",
    name: "Modern Navigation Header",
    category: "Navigation",
    description: "Responsive navigation header with logo, menu items, and mobile hamburger menu",
    tags: ["responsive", "mobile", "hamburger", "logo"],
    complexity: "medium",
    jsx: `import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavigationProps {
  logo?: string;
  menuItems?: Array<{
    label: string;
    href: string;
    children?: Array<{ label: string; href: string }>;
  }>;
  className?: string;
}

export default function ModernNavigation({ 
  logo = "Brand", 
  menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { 
      label: "Services", 
      href: "/services",
      children: [
        { label: "Web Design", href: "/services/web-design" },
        { label: "Development", href: "/services/development" }
      ]
    },
    { label: "Contact", href: "/contact" }
  ],
  className = ""
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className={\`bg-white shadow-lg border-b border-gray-200 \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {logo}
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                    onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.label}
                    {item.children && <ChevronDown className="ml-1 w-4 h-4" />}
                  </a>
                  
                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {menuItems.map((item) => (
                <div key={item.label}>
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    {item.label}
                  </a>
                  {item.children && (
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-sm transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}`,
    css: `/* Additional styles for navigation */
.nav-dropdown {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease-in-out;
}

.nav-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .mobile-menu {
    animation: slideDown 0.3s ease-out;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`,
    typescript: `export interface NavigationProps {
  logo?: string;
  menuItems?: Array<{
    label: string;
    href: string;
    children?: Array<{ label: string; href: string }>;
  }>;
  className?: string;
}

export interface MenuItem {
  label: string;
  href: string;
  children?: MenuItem[];
}`,
    preview: "/placeholder.svg?height=200&width=400",
    author: "Design System Team",
    createdAt: "2024-01-15",
    downloads: 1250,
    rating: 4.8,
    dependencies: ["lucide-react"],
  },

  // Form Components
  {
    id: "contact-form-modern",
    name: "Modern Contact Form",
    category: "Forms",
    description: "Beautiful contact form with validation, loading states, and success feedback",
    tags: ["validation", "loading", "success", "responsive"],
    complexity: "medium",
    jsx: `import React, { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ModernContactForm({ onSubmit, className = "" }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <div className={\`bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center \${className}\`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for your message. We'll get back to you soon.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className={\`bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto \${className}\`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Get in Touch</h2>
        <p className="text-gray-600">We'd love to hear from you. Send us a message!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={\`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors \${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }\`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={\`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors \${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }\`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={4}
              className={\`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none \${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }\`}
              placeholder="Tell us about your project..."
            />
          </div>
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}`,
    css: `/* Contact form animations */
.form-field {
  transition: all 0.2s ease-in-out;
}

.form-field:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.success-animation {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.error-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}`,
    typescript: `export interface ContactFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
  className?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}`,
    preview: "/placeholder.svg?height=300&width=400",
    author: "UI/UX Team",
    createdAt: "2024-01-20",
    downloads: 890,
    rating: 4.9,
    dependencies: ["lucide-react"],
  },

  // Card Components
  {
    id: "product-card-ecommerce",
    name: "E-commerce Product Card",
    category: "Cards",
    description: "Modern product card with image, pricing, ratings, and add to cart functionality",
    tags: ["ecommerce", "product", "rating", "cart", "responsive"],
    complexity: "medium",
    jsx: `import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Share2 } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    badge?: string;
    inStock: boolean;
  };
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onQuickView,
  className = "" 
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(product.id);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id);
  };

  const handleQuickView = () => {
    onQuickView?.(product.id);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className={\`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group \${className}\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image || "/placeholder.svg"} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {product.badge}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className={\`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 \${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }\`}>
          <button
            onClick={handleWishlistToggle}
            className={\`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors \${
              isWishlisted ? 'text-red-500' : 'text-gray-600'
            }\`}
          >
            <Heart className={\`w-5 h-5 \${isWishlisted ? 'fill-current' : ''}\`} />
          </button>
          
          <button
            onClick={handleQuickView}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={\`w-4 h-4 \${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }\`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            \${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              \${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={\`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 \${
            product.inStock
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }\`}
        >
          <ShoppingCart className="w-5 h-5" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}`,
    css: `/* Product card animations */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card-hover:hover {
  transform: translateY(-4px);
}

.badge-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.add-to-cart-success {
  animation: addToCartSuccess 0.6s ease-out;
}

@keyframes addToCartSuccess {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    background-color: #10b981;
  }
  100% {
    transform: scale(1);
  }
}`,
    typescript: `export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  inStock: boolean;
  category?: string;
  description?: string;
}`,
    preview: "/placeholder.svg?height=400&width=300",
    author: "E-commerce Team",
    createdAt: "2024-01-25",
    downloads: 2100,
    rating: 4.7,
    dependencies: ["lucide-react"],
  },

  // Button Components
  {
    id: "button-collection",
    name: "Button Collection",
    category: "Buttons",
    description: "Complete collection of modern button variants with different styles and states",
    tags: ["variants", "states", "loading", "icons"],
    complexity: "low",
    jsx: `import React from 'react';
import { ArrowRight, Download, Heart, Share2, Plus, Check } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  className = ''
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={\`
        \${baseClasses}
        \${variantClasses[variant]}
        \${sizeClasses[size]}
        \${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:-translate-y-0.5'}
        \${className}
      \`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}

// Button Examples Component
export function ButtonExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Button Collection</h1>
        
        {/* Primary Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Primary Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">Small Button</Button>
            <Button variant="primary" size="md">Medium Button</Button>
            <Button variant="primary" size="lg">Large Button</Button>
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Get Started
            </Button>
          </div>
        </section>

        {/* Secondary Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Secondary Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary">Secondary</Button>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
            <Button variant="secondary" loading>Loading...</Button>
          </div>
        </section>

        {/* Outline Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Outline Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Outline</Button>
            <Button variant="outline" icon={<Heart className="w-4 h-4" />}>
              Like
            </Button>
            <Button variant="outline" icon={<Share2 className="w-4 h-4" />} iconPosition="right">
              Share
            </Button>
          </div>
        </section>

        {/* Ghost Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghost Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="ghost">Ghost</Button>
            <Button variant="ghost" icon={<Plus className="w-4 h-4" />}>
              Add Item
            </Button>
            <Button variant="ghost" disabled>Disabled</Button>
          </div>
        </section>

        {/* Danger Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Danger Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="danger">Delete</Button>
            <Button variant="danger" size="sm">Remove</Button>
            <Button variant="danger" loading>Deleting...</Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Icon Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" icon={<Check className="w-4 h-4" />}>
              Confirm
            </Button>
            <Button variant="outline" icon={<Download className="w-4 h-4" />} iconPosition="right">
              Download File
            </Button>
            <Button variant="ghost" icon={<Heart className="w-4 h-4" />} />
          </div>
        </section>
      </div>
    </div>
  );
}`,
    css: `/* Button hover effects */
.button-hover-lift {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-hover-lift:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.button-ripple {
  position: relative;
  overflow: hidden;
}

.button-ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.button-ripple:active::before {
  width: 300px;
  height: 300px;
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Button focus styles */
.button-focus:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}`,
    typescript: `export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';`,
    preview: "/placeholder.svg?height=300&width=500",
    author: "Component Library Team",
    createdAt: "2024-01-10",
    downloads: 3200,
    rating: 4.9,
    dependencies: ["lucide-react"],
  },

  // Dashboard Components
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    category: "Dashboard",
    description: "Complete analytics dashboard with charts, metrics cards, and data visualization",
    tags: ["analytics", "charts", "metrics", "data", "responsive"],
    complexity: "high",
    jsx: `import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Eye, BarChart3, PieChart } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: 12.5,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: '2,345',
      change: 8.2,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Orders',
      value: '1,234',
      change: -3.1,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Page Views',
      value: '98,765',
      change: 15.3,
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ];

  const chartData = [
    { name: 'Jan', value: 4000, color: '#3B82F6' },
    { name: 'Feb', value: 3000, color: '#3B82F6' },
    { name: 'Mar', value: 5000, color: '#3B82F6' },
    { name: 'Apr', value: 4500, color: '#3B82F6' },
    { name: 'May', value: 6000, color: '#3B82F6' },
    { name: 'Jun', value: 5500, color: '#3B82F6' },
  ];

  const pieData = [
    { name: 'Desktop', value: 45, color: '#3B82F6' },
    { name: 'Mobile', value: 35, color: '#10B981' },
    { name: 'Tablet', value: 20, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your business performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-64">
              <SimpleBarChart data={chartData} />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Traffic Sources</h3>
              <PieChart className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-64">
              <SimplePieChart data={pieData} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New user registered', time: '2 minutes ago', type: 'user' },
              { action: 'Order #1234 completed', time: '5 minutes ago', type: 'order' },
              { action: 'Payment received', time: '10 minutes ago', type: 'payment' },
              { action: 'New review posted', time: '15 minutes ago', type: 'review' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={\`w-2 h-2 rounded-full \${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'payment' ? 'bg-purple-500' : 'bg-orange-500'
                  }\`} />
                  <span className="text-gray-900">{activity.action}</span>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const isPositive = change > 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={\`text-sm font-medium \${isPositive ? 'text-green-500' : 'text-red-500'}\`}>
              {Math.abs(change)}%
            </span>
            <span className="text-gray-500 text-sm ml-1">vs last period</span>
          </div>
        </div>
        <div className={\`\${color} p-3 rounded-xl text-white\`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SimpleBarChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end justify-between h-full gap-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
            style={{ height: \`\${(item.value / maxValue) * 100}%\` }}
          />
          <span className="text-sm text-gray-600 mt-2">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function SimplePieChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const circumference = 2 * Math.PI * 80;
            const strokeDasharray = \`\${(percentage / 100) * circumference} \${circumference}\`;
            const strokeDashoffset = -data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * circumference, 0);
            
            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}%</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
      
      <div className="ml-8 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    css: `/* Dashboard animations */
.metric-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-card:hover {
  transform: translateY(-4px);
}

.chart-bar {
  transition: all 0.5s ease-in-out;
}

.chart-bar:hover {
  transform: scaleY(1.05);
}

/* Loading states */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive grid */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}`,
    typescript: `export interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardProps {
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  metrics?: MetricCardProps[];
  className?: string;
}

export interface ActivityItem {
  action: string;
  time: string;
  type: 'user' | 'order' | 'payment' | 'review';
}`,
    preview: "/placeholder.svg?height=400&width=600",
    author: "Analytics Team",
    createdAt: "2024-02-01",
    downloads: 1500,
    rating: 4.8,
    dependencies: ["lucide-react"],
  },
]
