import { openai } from "@ai-sdk/openai"

// OpenAI client configuration
export const getOpenAIModel = () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || localStorage.getItem("openai_api_key")

  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY or add it in settings.")
  }

  return openai("gpt-4o", {
    apiKey: apiKey,
  })
}

// Validate API key format
export const validateOpenAIKey = (key: string): boolean => {
  return key.startsWith("sk-") && key.length > 20
}

// Test API connection
export const testOpenAIConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const model = openai("gpt-4o", { apiKey })
    const { generateText } = await import("ai")

    const result = await generateText({
      model,
      prompt: 'Say "Hello" if you can hear me.',
      maxTokens: 10,
    })

    return result.text.toLowerCase().includes("hello")
  } catch (error) {
    console.error("OpenAI connection test failed:", error)
    return false
  }
}
