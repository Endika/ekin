export interface GeminiClient {
  /** Returns the raw model text. Throws on network / HTTP error. */
  generate(prompt: string): Promise<string>
}

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

/**
 * Calls the Gemini REST API directly from the browser with the user's own key
 * (their own quota). The key lives only in localStorage and is never logged.
 */
export function httpGeminiClient(apiKey: string): GeminiClient {
  return {
    async generate(prompt: string): Promise<string> {
      const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      })
      if (!res.ok) throw new Error(`gemini ${res.status}`)
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof text !== 'string') throw new Error('gemini: empty response')
      return text
    },
  }
}
