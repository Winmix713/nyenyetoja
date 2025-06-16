// Automatikus komponens generátor utility

interface ComponentTemplate {
  name: string
  category: string
  dependencies: string[]
  template: string
  props?: string
  examples?: string
}

export class ComponentGenerator {
  static generateComponent(template: ComponentTemplate): string {
    return `"use client"

import React from 'react'
import { cn } from '@/lib/utils'
${template.dependencies.map((dep) => `import { ${dep} } from '@/components/ui/${dep.toLowerCase()}'`).join("\n")}

${template.props || ""}

export function ${template.name}(${template.props ? `props: ${template.name}Props` : ""}) {
  ${template.template}
}

${template.examples || ""}
`
  }

  static generateIndex(components: string[]): string {
    return components.map((comp) => `export { ${comp} } from './${comp.toLowerCase()}'`).join("\n")
  }
}

// Komponens template-ek
export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    name: "Skeleton",
    category: "UI Foundation",
    dependencies: [],
    props: `interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
}`,
    template: `
  const { className, width, height, variant = 'rectangular', ...props } = props
  
  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded",
        variant === 'text' && "h-4 w-full",
        variant === 'circular' && "rounded-full",
        className
      )}
      style={{ width, height }}
      {...props}
    />
  )`,
    examples: `
// Usage examples:
// <Skeleton className="w-full h-4" />
// <Skeleton variant="circular" width={40} height={40} />
// <Skeleton variant="text" />
`,
  },
  {
    name: "Toast",
    category: "Feedback",
    dependencies: ["Button"],
    props: `interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  onClose?: () => void
}`,
    template: `
  const { title, description, variant = 'default', onClose } = props
  
  return (
    <div className={cn(
      "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border max-w-sm",
      variant === 'default' && "bg-background border-border",
      variant === 'destructive' && "bg-destructive text-destructive-foreground",
      variant === 'success' && "bg-green-600 text-white"
    )}>
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2"
        >
          ×
        </Button>
      )}
    </div>
  )`,
  },
  {
    name: "EmptyState",
    category: "Feedback",
    dependencies: ["Button"],
    props: `interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}`,
    template: `
  const { icon, title, description, action, className } = props
  
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && <div className="mb-4 flex justify-center text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )`,
  },
]
