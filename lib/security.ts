import { z } from "zod"

// Input validation schemas
export const FigmaUrlSchema = z
  .string()
  .url("Invalid URL format")
  .refine((url) => {
    const figmaUrlPattern = /^https:\/\/(www\.)?figma\.com\/(file|proto)\/[A-Za-z0-9]+/
    return figmaUrlPattern.test(url)
  }, "Must be a valid Figma URL")

export const FigmaTokenSchema = z
  .string()
  .min(1, "Token is required")
  .regex(/^figd_[A-Za-z0-9_-]+$/, "Invalid Figma token format")

export const GitHubTokenSchema = z
  .string()
  .min(1, "GitHub token is required")
  .regex(/^(ghp_|github_pat_)[A-Za-z0-9_]+$/, "Invalid GitHub token format")

export const RepoNameSchema = z
  .string()
  .min(1, "Repository name is required")
  .max(100, "Repository name too long")
  .regex(/^[a-zA-Z0-9._-]+$/, "Invalid repository name format")

export const ComponentNameSchema = z
  .string()
  .min(1, "Component name is required")
  .max(50, "Component name too long")
  .regex(/^[A-Z][a-zA-Z0-9]*$/, "Component name must be PascalCase")

// Rate limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests = 10,
    private windowMs = 60000, // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || []
    const now = Date.now()
    const validRequests = requests.filter((time) => now - time < this.windowMs)
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

export const apiRateLimiter = new RateLimiter(20, 60000) // 20 requests per minute
export const exportRateLimiter = new RateLimiter(5, 300000) // 5 exports per 5 minutes

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

// Token masking for logs
export function maskToken(token: string): string {
  if (token.length <= 8) return "***"
  return token.slice(0, 4) + "***" + token.slice(-4)
}

// Secure token storage
export class SecureTokenStorage {
  private static readonly ENCRYPTION_KEY = "figma-converter-key"

  static store(key: string, token: string): void {
    try {
      // Simple obfuscation (in production, use proper encryption)
      const obfuscated = btoa(token + this.ENCRYPTION_KEY)
      localStorage.setItem(key, obfuscated)
    } catch (error) {
      console.error("Failed to store token:", error)
    }
  }

  static retrieve(key: string): string | null {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null

      const decoded = atob(stored)
      return decoded.replace(this.ENCRYPTION_KEY, "")
    } catch (error) {
      console.error("Failed to retrieve token:", error)
      return null
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key)
  }
}

// API error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    return new APIError(error.message, 500)
  }

  return new APIError("Unknown error occurred", 500)
}
