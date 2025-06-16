import { describe, it, expect, vi, beforeEach } from "vitest"
import { FigmaApiClient } from "@/lib/figma-api-client"

describe("FigmaApiClient", () => {
  let client: FigmaApiClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new FigmaApiClient("test-token")
  })

  describe("getFile", () => {
    it("should fetch file data successfully", async () => {
      const mockResponse = {
        name: "Test File",
        document: { id: "1", name: "Document", type: "DOCUMENT", children: [] },
        components: {},
        componentSets: {},
        schemaVersion: 1,
        styles: {},
        lastModified: "2024-01-01",
        thumbnailUrl: "https://example.com/thumb.png",
        version: "1.0",
        role: "owner",
        editorType: "figma",
        linkAccess: "view",
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getFile("test-file-key")

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        "https://api.figma.com/v1/files/test-file-key",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Figma-Token": "test-token",
          }),
        }),
      )
    })

    it("should handle API errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      })

      await expect(client.getFile("invalid-key")).rejects.toThrow("Figma API Error (403): Forbidden")
    })
  })

  describe("testConnection", () => {
    it("should return success for valid token", async () => {
      const mockUser = { email: "test@example.com", id: "123" }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      const result = await client.testConnection()

      expect(result).toEqual({ success: true, user: mockUser })
    })

    it("should return error for invalid token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      })

      const result = await client.testConnection()

      expect(result).toEqual({
        success: false,
        error: "Figma API Error (401): Unauthorized",
      })
    })
  })
})
