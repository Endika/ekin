export interface GeminiClient {
  /** Returns the raw model text. Throws on network / HTTP error. */
  generate(prompt: string): Promise<string>
}

export const GEMINI_MODEL = 'gemini-3.1-flash-lite'

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

/** Why Google refused the call, when its error says so; anything else is `request_failed`. */
export type GeminiFailure =
  | 'invalid_key'
  | 'key_not_allowed'
  | 'api_disabled'
  | 'billing_disabled'
  | 'key_restricted'
  | 'request_failed'

const REASONS: Record<string, GeminiFailure> = {
  API_KEY_INVALID: 'invalid_key',
  API_KEY_SERVICE_BLOCKED: 'key_not_allowed',
  SERVICE_DISABLED: 'api_disabled',
  BILLING_DISABLED: 'billing_disabled',
  API_KEY_HTTP_REFERRER_BLOCKED: 'key_restricted',
  API_KEY_IP_ADDRESS_BLOCKED: 'key_restricted',
}

export class GeminiError extends Error {
  constructor(readonly reason: GeminiFailure) {
    super(`gemini: ${reason}`)
  }
}

async function failureOf(res: Response): Promise<GeminiFailure> {
  try {
    const body = await res.json()
    const details: unknown = body?.error?.details
    if (Array.isArray(details)) {
      for (const d of details) {
        const known = REASONS[d?.reason]
        if (known) return known
      }
    }
  } catch {
    // Not Google's JSON envelope (a proxy page, a truncated body).
  }
  return 'request_failed'
}

/**
 * Calls the Gemini REST API directly from the browser with the user's own key
 * (their own quota). The key lives only in localStorage and is never logged.
 */
export function httpGeminiClient(apiKey: string): GeminiClient {
  return {
    async generate(prompt: string): Promise<string> {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      })
      if (!res.ok) throw new GeminiError(await failureOf(res))
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof text !== 'string') throw new Error('gemini: empty response')
      return text
    },
  }
}
