// Component Audit Script - Hiányzó komponensek feltérképezése

interface ComponentAudit {
  category: string
  existing: string[]
  missing: string[]
  priority: "high" | "medium" | "low"
}

const componentAudit: ComponentAudit[] = [
  {
    category: "UI Foundation",
    existing: ["Button", "Card", "Input", "Badge", "Alert"],
    missing: ["Skeleton", "Separator", "ScrollArea", "Tooltip", "Popover"],
    priority: "high",
  },
  {
    category: "Navigation",
    existing: ["Header"],
    missing: ["Breadcrumb", "Pagination", "Sidebar", "Footer", "NavigationMenu"],
    priority: "high",
  },
  {
    category: "Forms",
    existing: ["Input", "Checkbox", "Select"],
    missing: ["Form", "RadioGroup", "Switch", "Slider", "DatePicker"],
    priority: "medium",
  },
  {
    category: "Data Display",
    existing: ["Badge", "Progress"],
    missing: ["Table", "DataTable", "Avatar", "Calendar", "Chart"],
    priority: "medium",
  },
  {
    category: "Feedback",
    existing: ["Alert", "Progress"],
    missing: ["Toast", "Spinner", "EmptyState", "ErrorBoundary", "ConfirmDialog"],
    priority: "high",
  },
  {
    category: "Layout",
    existing: ["Card"],
    missing: ["Container", "Grid", "Stack", "Divider", "AspectRatio"],
    priority: "medium",
  },
  {
    category: "Figma Specific",
    existing: ["FigmaConverter", "ExportWizard"],
    missing: ["FigmaPreview", "ComponentLibrary", "DesignTokens", "LayerTree"],
    priority: "high",
  },
  {
    category: "Export Specific",
    existing: ["ExportWizard", "ExportHistory"],
    missing: ["CodePreview", "FileTree", "DiffViewer", "DownloadManager"],
    priority: "medium",
  },
]

// Prioritás alapú összesítés
const highPriorityMissing = componentAudit
  .filter((audit) => audit.priority === "high")
  .flatMap((audit) => audit.missing)

const mediumPriorityMissing = componentAudit
  .filter((audit) => audit.priority === "medium")
  .flatMap((audit) => audit.missing)

console.log("🔴 HIGH PRIORITY hiányzó komponensek:", highPriorityMissing.length)
console.log("🟡 MEDIUM PRIORITY hiányzó komponensek:", mediumPriorityMissing.length)

console.log("\n📊 Kategóriánkénti hiányosságok:")
componentAudit.forEach((audit) => {
  console.log(`${audit.category}: ${audit.missing.length} hiányzó komponens`)
})
