interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  timestamp: number
}

interface CostLimits {
  daily: number
  monthly: number
  perRequest: number
}

export class AICostManager {
  private static instance: AICostManager
  private usage: TokenUsage[] = []
  private limits: CostLimits = {
    daily: 10, // $10/day
    monthly: 100, // $100/month
    perRequest: 1, // $1/request
  }

  static getInstance(): AICostManager {
    if (!AICostManager.instance) {
      AICostManager.instance = new AICostManager()
    }
    return AICostManager.instance
  }

  // GPT-4o pricing (as of 2024)
  private calculateCost(promptTokens: number, completionTokens: number): number {
    const promptCost = (promptTokens / 1000) * 0.005 // $0.005 per 1K prompt tokens
    const completionCost = (completionTokens / 1000) * 0.015 // $0.015 per 1K completion tokens
    return promptCost + completionCost
  }

  trackUsage(promptTokens: number, completionTokens: number): void {
    const cost = this.calculateCost(promptTokens, completionTokens)
    const usage: TokenUsage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      cost,
      timestamp: Date.now(),
    }

    this.usage.push(usage)
    this.saveToStorage()
  }

  getDailyUsage(): { tokens: number; cost: number } {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const dailyUsage = this.usage.filter((u) => u.timestamp > oneDayAgo)

    return {
      tokens: dailyUsage.reduce((sum, u) => sum + u.totalTokens, 0),
      cost: dailyUsage.reduce((sum, u) => sum + u.cost, 0),
    }
  }

  getMonthlyUsage(): { tokens: number; cost: number } {
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const monthlyUsage = this.usage.filter((u) => u.timestamp > oneMonthAgo)

    return {
      tokens: monthlyUsage.reduce((sum, u) => sum + u.totalTokens, 0),
      cost: monthlyUsage.reduce((sum, u) => sum + u.cost, 0),
    }
  }

  checkLimits(): { canProceed: boolean; reason?: string } {
    const daily = this.getDailyUsage()
    const monthly = this.getMonthlyUsage()

    if (daily.cost >= this.limits.daily) {
      return { canProceed: false, reason: `Daily limit reached: $${daily.cost.toFixed(2)}/$${this.limits.daily}` }
    }

    if (monthly.cost >= this.limits.monthly) {
      return { canProceed: false, reason: `Monthly limit reached: $${monthly.cost.toFixed(2)}/$${this.limits.monthly}` }
    }

    return { canProceed: true }
  }

  estimateCost(promptLength: number): number {
    // Rough estimation: ~4 characters per token
    const estimatedPromptTokens = Math.ceil(promptLength / 4)
    const estimatedCompletionTokens = estimatedPromptTokens * 0.5 // Assume response is 50% of prompt

    return this.calculateCost(estimatedPromptTokens, estimatedCompletionTokens)
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("ai_usage_data", JSON.stringify(this.usage))
    } catch (error) {
      console.warn("Failed to save usage data to localStorage:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("ai_usage_data")
      if (stored) {
        this.usage = JSON.parse(stored)
      }
    } catch (error) {
      console.warn("Failed to load usage data from localStorage:", error)
    }
  }

  constructor() {
    this.loadFromStorage()
  }

  getUsageReport() {
    const daily = this.getDailyUsage()
    const monthly = this.getMonthlyUsage()
    const total = this.usage.reduce((sum, u) => sum + u.cost, 0)

    return {
      daily,
      monthly,
      total: {
        tokens: this.usage.reduce((sum, u) => sum + u.totalTokens, 0),
        cost: total,
        requests: this.usage.length,
      },
      limits: this.limits,
      recentUsage: this.usage.slice(-10),
    }
  }
}

export const aiCostManager = AICostManager.getInstance()
