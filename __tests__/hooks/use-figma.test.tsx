import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFigma } from '@/hooks/core/use-figma'

// Mock the figma client
const mockFigmaClient = {
  setToken: vi.fn(),
  testConnection: vi.fn(),
  getFile: vi.fn(),
  validateUrl: vi.fn(),
  clearAllCache: vi.fn(),
  extractFileKey: vi.fn(),
}

vi.mock('@/services/core/figma-client', () => ({
  figmaClient: mockFigmaClient,
  FigmaClient: {
    extractFileKey: mockFigmaClient.extractFileKey,
  },
}))

// Mock the toast hook
const mockToast = vi.fn()
vi.mock('@/hooks/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useFigma', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFigma())

    expect(result.current.isConnected).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.fileData).toBe(null)
    expect(result.current.connectionResult).toBe(null)
  })

  it('should connect successfully with valid token', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      handle: 'testuser',
    }

    mockFigmaClient.testConnection.mockResolvedValue({
      success: true,
      user: mockUser,
    })

    const { result } = renderHook(() => useFigma())

    await act(async () => {
      const success = await result.current.connect('figd_test_token')
      expect(success).toBe(true)
    })

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
      expect(result.current.connectionResult?.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFigmaClient.setToken).toHaveBeenCalledWith('figd_test_token')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('figma-token', 'figd_test_token')
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Connected to Figma',
      description: 'Successfully connected as testuser',
    })
  })

  it('should handle connection failure', async () => {
    mockFigmaClient.testConnection.mockResolvedValue({
      success: false,
      error: 'Invalid token',
    })

    const { result } = renderHook(() => useFigma())

    await act(async () => {
      const success = await result.current.connect('figd_invalid_token')
      expect(success).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false)
      expect(result.current.error).toBe('Invalid token')
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Connection Failed',
      description: 'Invalid token',
      variant: 'destructive',
    })
  })

  it('should disconnect and clear stored token', async () => {
    // First connect
    mockFigmaClient.testConnection.mockResolvedValue({
      success: true,
      user: { handle: 'testuser' },
    })

    const { result } = renderHook(() => useFigma())

    await act(async () => {
      await result.current.connect('figd_test_token')
    })

    // Then disconnect
    act(() => {
      result.current.disconnect()
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.connectionResult).toBe(null)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('figma-token')
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Disconnected',
      description: 'Disconnected from Figma',
    })
  })

  it('should load file successfully', async () => {
    const mockFileData = {
      name: 'Test File',
      document: { id: 'root' },
      components: {},
      styles: {},
    }

    mockFigmaClient.extractFileKey.mockReturnValue('ABC123')
    mockFigmaClient.getFile.mockResolvedValue(mockFileData)

    const { result } = renderHook(() => useFigma())

    await act(async () => {
      await result.current.loadFile('https://www.figma.com/file/ABC123/Test')
    })

    await waitFor(() => {
      expect(result.current.fileData).toEqual(mockFileData)
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFigmaClient.getFile).toHaveBeenCalledWith('ABC123')
    expect(mockToast).toHaveBeenCalledWith({
      title: 'File Loaded',
      description: 'Successfully loaded "Test File"',
    })
  })

  it('should handle file loading error', async () => {
    mockFigmaClient.extractFileKey.mockReturnValue(null)

    const { result } = renderHook(() => useFigma())

    await act(async () => {
      await result.current.loadFile('https://invalid-url.com')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid Figma URL')
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Load Error',
      description: 'Invalid Figma URL',
      variant: 'destructive',
    })
  })

  it('should validate URL correctly', async () => {
    const mockValidationResult = {
      valid: true,
      fileKey: 'ABC123',
    }

    mockFigmaClient.validateUrl.mockResolvedValue(mockValidationResult)

    const { result } = renderHook(() => useFigma())

    let validationResult
    await act(async () => {
      validationResult = await result.current.validateUrl('https://www.figma.com/file/ABC123/Test')
    })

    expect(validationResult).toEqual(mockValidationResult)
    expect(mockFigmaClient.validateUrl).toHaveBeenCalledWith('https://www.figma.com/file/ABC123/Test')
  })

  it('should clear cache successfully', async () => {
    mockFigmaClient.clearAllCache.mockResolvedValue(undefined)

    const { result } = renderHook(() => useFigma())

    await act(async () => {
      await result.current.clearCache()
    })

    expect(mockFigmaClient.clearAllCache).toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Cache Cleared',
      description: 'Figma cache has been cleared',
    })
  })

  it('should auto-connect on mount if token exists', async () => {
    mockLocalStorage.getItem.mockReturnValue('stored_token')
    mockFigmaClient.testConnection.mockResolvedValue({
      success: true,
      user: { handle: 'testuser' },
    })

    const { result } = renderHook(() => useFigma())

    await waitFor(() => {
      expect(mockFigmaClient.setToken).toHaveBeenCalledWith('stored_token')
      expect(mockFigmaClient.testConnection).toHaveBeenCalled()
    })
  })
})