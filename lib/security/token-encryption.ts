import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export class TokenEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 12
  private static readonly TAG_LENGTH = 16

  /**
   * Get encryption key from environment or generate one
   */
  private static getEncryptionKey(): Buffer {
    const keyFromEnv = process.env.ENCRYPTION_KEY
    
    if (keyFromEnv) {
      return createHash('sha256').update(keyFromEnv).digest()
    }

    // Fallback key for development (NOT secure for production)
    const fallbackKey = 'figma-converter-dev-key-2024'
    console.warn('⚠️ Using fallback encryption key. Set ENCRYPTION_KEY environment variable for production.')
    
    return createHash('sha256').update(fallbackKey).digest()
  }

  /**
   * Encrypt a token
   */
  static encrypt(token: string): string {
    try {
      const key = this.getEncryptionKey()
      const iv = randomBytes(this.IV_LENGTH)
      const cipher = createCipheriv(this.ALGORITHM, key, iv)

      let encrypted = cipher.update(token, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const authTag = cipher.getAuthTag()

      // Combine IV, encrypted data, and auth tag
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), authTag])
      
      return combined.toString('base64')
    } catch (error) {
      console.error('❌ Token encryption failed:', error)
      // Return original token if encryption fails (not recommended for production)
      return token
    }
  }

  /**
   * Decrypt a token
   */
  static decrypt(encryptedToken: string): string {
    try {
      const key = this.getEncryptionKey()
      const combined = Buffer.from(encryptedToken, 'base64')

      // Extract IV, encrypted data, and auth tag
      const iv = combined.subarray(0, this.IV_LENGTH)
      const authTag = combined.subarray(-this.TAG_LENGTH)
      const encrypted = combined.subarray(this.IV_LENGTH, -this.TAG_LENGTH)

      const decipher = createDecipheriv(this.ALGORITHM, key, iv)
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      console.error('❌ Token decryption failed:', error)
      // Return original token if decryption fails
      return encryptedToken
    }
  }

  /**
   * Validate if a string is encrypted
   */
  static isEncrypted(token: string): boolean {
    try {
      // Try to decode as base64
      const decoded = Buffer.from(token, 'base64')
      
      // Check if it has the expected minimum length
      const minimumLength = this.IV_LENGTH + this.TAG_LENGTH + 1
      return decoded.length >= minimumLength
    } catch {
      return false
    }
  }

  /**
   * Securely store token in localStorage with encryption
   */
  static storeToken(key: string, token: string): void {
    if (typeof window !== 'undefined') {
      const encrypted = this.encrypt(token)
      localStorage.setItem(key, encrypted)
    }
  }

  /**
   * Retrieve and decrypt token from localStorage
   */
  static retrieveToken(key: string): string | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key)
      if (stored) {
        return this.decrypt(stored)
      }
    }
    return null
  }

  /**
   * Remove token from localStorage
   */
  static removeToken(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }

  /**
   * Hash a token for comparison (one-way)
   */
  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length = 32): string {
    return randomBytes(length).toString('hex')
  }

  /**
   * Validate token format (basic validation)
   */
  static validateTokenFormat(token: string): boolean {
    // Basic validation for Figma tokens
    const figmaTokenPattern = /^figd_[a-zA-Z0-9_-]+$/
    return figmaTokenPattern.test(token)
  }
}

export default TokenEncryption