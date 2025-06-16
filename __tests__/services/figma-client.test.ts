import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FigmaClient } from '@/services/core/figma-client'

// Mock the dependencies
vi.mock('@/lib/cache/cache-manager', () => ({
  CacheManager: {
    getInstance: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      getStats: vi.fn(),
    })),
  },
}))

vi.mock('@/lib/errors/error-handler', () => ({
  ErrorHandler: {
    handle: vi.fn(),
  },
}))

vi.mock('@/lib/security/token-encryption', () => ({
  TokenEncryption: {
    encrypt: vi.fn((token) => `encrypted_${token}`),
    decrypt: vi.fn((token) => token.replace('encrypted_', '')),
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('FigmaClient', () => {
  let figmaClient: FigmaClient

  beforeEach(() => {
    figmaClient = FigmaClient.getInstance()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = FigmaClient.getInstance()
      const instance2 = FigmaClient.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('extractFileKey', () => {
    it('should extract file key from figma.com/file/ URL', () => {
      const url = 'https://www.figma.com/file/ABC123/My-Design'
      const fileKey = FigmaClient.extractFileKey(url)
      expect(fileKey).toBe('ABC123')
    })

    it('should extract file key from figma.com/design/ URL', () => {
      const url = 'https://www.figma.com/design/XYZ789/My-Design'
      const fileKey = FigmaClient.extractFileKey(url)
      expect(fileKey).toBe('XYZ789')
    })

    it('should extract file key from figma.com/proto/ URL', () => {
      const url = 'https://www.figma.com/proto/DEF456/My-Prototype'
      const fileKey = FigmaClient.extractFileKey(url)
      expect(fileKey).toBe('DEF456')
    })

    it('should return null for invalid URLs', () => {
      const url = 'https://invalid-url.com'
      const fileKey = FigmaClient.extractFileKey(url)
      expect(fileKey).toBeNull()
    })
  })

  describe('setToken', () => {
    it('should set and encrypt the token', () => {
      const token = 'figd_test_token'
      figmaClient.setToken(token)
      
      // We can't directly test the private config, but we can test that the token is used
      expect(require('@/lib/security/token-encryption').TokenEncryption.encrypt).toHaveBeenCalledWith(token)
    })
  })

  describe('testConnection', () => {
    it('should return success when API call succeeds', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        handle: 'testuser',
        imgUrl: 'https://example.com/avatar.png',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      figmaClient.setToken('figd_test_token')
      const result = await figmaClient.testConnection()

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
    })

    it('should return error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid token' }),
      })

      figmaClient.setToken('figd_invalid_token')
      const result = await figmaClient.testConnection()

      expect(result.success).toBe(false)
      expect(result.error).toContain('401')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      figmaClient.setToken('figd_test_token')
      const result = await figmaClient.testConnection()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getFile', () => {
    it('should fetch and return file data', async () => {
      const mockFileData = {
        document: { id: 'root', name: 'Document', type: 'DOCUMENT' },
        components: {},
        schemaVersion: 1,
        styles: {},
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        version: '1.0',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFileData,
      })

      figmaClient.setToken('figd_test_token')
      const result = await figmaClient.getFile('ABC123')

      expect(result).toEqual(mockFileData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/ABC123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Figma-Token': 'figd_test_token',
          }),
        })
      )
    })

    it('should throw error for invalid file key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'File not found' }),
      })

      figmaClient.setToken('figd_test_token')
      
      await expect(figmaClient.getFile('INVALID')).rejects.toThrow('404')
    })
  })

  describe('validateUrl', () => {
    it('should validate correct Figma URL', async () => {
      const mockFileData = {
        document: { id: 'root', name: 'Document', type: 'DOCUMENT' },
        components: {},
        schemaVersion: 1,
        styles: {},
        name: 'Test File',
        lastModified: '2024-01-01T00:00:00Z',
        version: '1.0',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFileData,
      })

      figmaClient.setToken('figd_test_token')
      const result = await figmaClient.validateUrl('https://www.figma.com/file/ABC123/Test')

      expect(result.valid).toBe(true)
      expect(result.fileKey).toBe('ABC123')
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid URL format', async () => {
      const result = await figmaClient.validateUrl('https://invalid-url.com')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid Figma URL format')
      expect(result.fileKey).toBeUndefined()
    })

    it('should reject inaccessible file', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'File not found' }),
      })

      figmaClient.setToken('figd_test_token')
      const result = await figmaClient.validateUrl('https://www.figma.com/file/INVALID/Test')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('404')
    })
  })
})