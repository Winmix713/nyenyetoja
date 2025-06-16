export interface ExportRecord {
  id: string
  componentName: string
  framework: string
  exportMethod: "zip" | "github"
  createdAt: string
  status: "success" | "failed" | "pending"
  githubUrl?: string
  downloadUrl?: string
  preset: string
  options: {
    styling: string
    typescript: boolean
    includeTests: boolean
    includeStorybook: boolean
  }
  metadata: {
    figmaUrl: string
    fileSize?: number
    exportDuration?: number
  }
}

export interface ExportStatistics {
  totalExports: number
  successfulExports: number
  failedExports: number
  githubExports: number
  zipExports: number
  popularFrameworks: { framework: string; count: number }[]
  popularPresets: { preset: string; count: number }[]
  averageExportTime: number
  totalFileSize: number
}

export class ExportHistoryService {
  private static readonly STORAGE_KEY = "figma-export-history"
  private static readonly MAX_HISTORY_ITEMS = 100

  static async saveExport(exportData: Omit<ExportRecord, "id" | "createdAt">): Promise<ExportRecord> {
    const record: ExportRecord = {
      ...exportData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }

    const history = this.getExportHistory()
    history.unshift(record)

    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, this.MAX_HISTORY_ITEMS)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory))

    return record
  }

  static getExportHistory(): ExportRecord[] {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static async updateExportStatus(
    exportId: string,
    status: ExportRecord["status"],
    additionalData?: Partial<ExportRecord>,
  ): Promise<void> {
    const history = this.getExportHistory()
    const index = history.findIndex((record) => record.id === exportId)

    if (index !== -1) {
      history[index] = {
        ...history[index],
        status,
        ...additionalData,
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
    }
  }

  static async deleteExport(exportId: string): Promise<void> {
    const history = this.getExportHistory()
    const filteredHistory = history.filter((record) => record.id !== exportId)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory))
  }

  static async clearHistory(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static async reExport(exportId: string): Promise<ExportRecord> {
    const history = this.getExportHistory()
    const originalRecord = history.find((record) => record.id === exportId)

    if (!originalRecord) {
      throw new Error("Export record not found")
    }

    // Create a new export record based on the original
    const newRecord: ExportRecord = {
      ...originalRecord,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    // Add to history
    const updatedHistory = [newRecord, ...history.slice(0, this.MAX_HISTORY_ITEMS - 1)]
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory))

    return newRecord
  }

  static getExportById(exportId: string): ExportRecord | undefined {
    const history = this.getExportHistory()
    return history.find((record) => record.id === exportId)
  }

  static getExportsByComponent(componentName: string): ExportRecord[] {
    const history = this.getExportHistory()
    return history.filter((record) => record.componentName === componentName)
  }

  static getExportsByFramework(framework: string): ExportRecord[] {
    const history = this.getExportHistory()
    return history.filter((record) => record.framework === framework)
  }

  static getExportsByMethod(method: "zip" | "github"): ExportRecord[] {
    const history = this.getExportHistory()
    return history.filter((record) => record.exportMethod === method)
  }

  static getExportsByDateRange(startDate: Date, endDate: Date): ExportRecord[] {
    const history = this.getExportHistory()
    return history.filter((record) => {
      const recordDate = new Date(record.createdAt)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  static getExportStatistics(): ExportStatistics {
    const history = this.getExportHistory()

    const totalExports = history.length
    const successfulExports = history.filter((r) => r.status === "success").length
    const failedExports = history.filter((r) => r.status === "failed").length
    const githubExports = history.filter((r) => r.exportMethod === "github").length
    const zipExports = history.filter((r) => r.exportMethod === "zip").length

    // Popular frameworks
    const frameworkCounts = history.reduce(
      (acc, record) => {
        acc[record.framework] = (acc[record.framework] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const popularFrameworks = Object.entries(frameworkCounts)
      .map(([framework, count]) => ({ framework, count }))
      .sort((a, b) => b.count - a.count)

    // Popular presets
    const presetCounts = history.reduce(
      (acc, record) => {
        acc[record.preset] = (acc[record.preset] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const popularPresets = Object.entries(presetCounts)
      .map(([preset, count]) => ({ preset, count }))
      .sort((a, b) => b.count - a.count)

    // Average export time
    const exportsWithDuration = history.filter((r) => r.metadata.exportDuration)
    const averageExportTime =
      exportsWithDuration.length > 0
        ? exportsWithDuration.reduce((sum, r) => sum + (r.metadata.exportDuration || 0), 0) / exportsWithDuration.length
        : 0

    // Total file size
    const totalFileSize = history.reduce((sum, r) => sum + (r.metadata.fileSize || 0), 0)

    return {
      totalExports,
      successfulExports,
      failedExports,
      githubExports,
      zipExports,
      popularFrameworks,
      popularPresets,
      averageExportTime,
      totalFileSize,
    }
  }

  static exportHistoryToJSON(): string {
    const history = this.getExportHistory()
    const statistics = this.getExportStatistics()

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        statistics,
        history,
      },
      null,
      2,
    )
  }

  static async importHistoryFromJSON(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)

      if (data.history && Array.isArray(data.history)) {
        // Validate the data structure
        const validRecords = data.history.filter(this.isValidExportRecord)

        // Merge with existing history, avoiding duplicates
        const existingHistory = this.getExportHistory()
        const existingIds = new Set(existingHistory.map((r) => r.id))

        const newRecords = validRecords.filter((r: ExportRecord) => !existingIds.has(r.id))
        const mergedHistory = [...existingHistory, ...newRecords]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, this.MAX_HISTORY_ITEMS)

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedHistory))
      } else {
        throw new Error("Invalid history data format")
      }
    } catch (error) {
      throw new Error(`Failed to import history: ${error}`)
    }
  }

  private static generateId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static isValidExportRecord(record: any): record is ExportRecord {
    return (
      typeof record === "object" &&
      typeof record.id === "string" &&
      typeof record.componentName === "string" &&
      typeof record.framework === "string" &&
      ["zip", "github"].includes(record.exportMethod) &&
      typeof record.createdAt === "string" &&
      ["success", "failed", "pending"].includes(record.status)
    )
  }

  // Analytics methods
  static getExportTrends(days = 30): { date: string; count: number }[] {
    const history = this.getExportHistory()
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const trends: { date: string; count: number }[] = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      const count = history.filter((record) => record.createdAt.startsWith(dateStr)).length

      trends.push({ date: dateStr, count })
    }

    return trends
  }

  static getSuccessRate(): number {
    const history = this.getExportHistory()
    if (history.length === 0) return 0

    const successfulExports = history.filter((r) => r.status === "success").length
    return (successfulExports / history.length) * 100
  }

  static getMostActiveHours(): { hour: number; count: number }[] {
    const history = this.getExportHistory()
    const hourCounts = new Array(24).fill(0)

    history.forEach((record) => {
      const hour = new Date(record.createdAt).getHours()
      hourCounts[hour]++
    })

    return hourCounts.map((count, hour) => ({ hour, count }))
  }

  static getComponentPopularity(): { componentName: string; count: number }[] {
    const history = this.getExportHistory()
    const componentCounts = history.reduce(
      (acc, record) => {
        acc[record.componentName] = (acc[record.componentName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(componentCounts)
      .map(([componentName, count]) => ({ componentName, count }))
      .sort((a, b) => b.count - a.count)
  }
}
