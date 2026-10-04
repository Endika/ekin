import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  GEMINI_MODEL,
  GeminiError,
  httpGeminiClient,
  type GeminiFailure,
} from '../../src/ai/gemini'

// AI Studio "auth keys" issued since 2026-05-28: `AQ.` prefix, 53 characters.
const AQ_KEY = 'AQ.' + 'Ab8RN6Kx_q-Zt0wPmY3vLs9JcHd2FeUg7oTiWnBa4XrQkVy1Ez'

interface Call {
  url: string
  headers: Record<string, string>
  body: string
}

const realFetch = globalThis.fetch
let calls: Call[] = []

/** Hand-written fetch fake: records each request and answers with a canned reply. */
function answer(status: number, body: unknown) {
  calls = []
  globalThis.fetch = async (input, init) => {
    calls.push({
      url: String(input),
      headers: { ...(init?.headers as Record<string, string>) },
      body: String(init?.body),
    })
    const text = typeof body === 'string' ? body : JSON.stringify(body)
    return new Response(text, { status })
  }
}

const reply = (text: string) => ({
  candidates: [{ content: { parts: [{ text }] } }],
})

/** Google's error envelope, as the Gemini API returns it on a 4xx. */
const googleError = (code: number, status: string, reason: string) => ({
  error: {
    code,
    message: 'irrelevant English text',
    status,
    details: [
      {
        '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
        reason,
        domain: 'googleapis.com',
      },
    ],
  },
})

async function failureOf(): Promise<GeminiFailure | 'none' | 'other'> {
  try {
    await httpGeminiClient(AQ_KEY).generate('hi')
    return 'none'
  } catch (e) {
    return e instanceof GeminiError ? e.reason : 'other'
  }
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('httpGeminiClient', () => {
  it('calls the current Flash-Lite model', async () => {
    answer(200, reply('ok'))
    await httpGeminiClient(AQ_KEY).generate('hi')
    expect(GEMINI_MODEL).toBe('gemini-3.1-flash-lite')
    expect(calls[0].url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
    )
  })

  it('sends a 53-character AQ. key verbatim in the x-goog-api-key header', async () => {
    expect(AQ_KEY).toHaveLength(53)
    answer(200, reply('ok'))
    const text = await httpGeminiClient(AQ_KEY).generate('hi')
    expect(text).toBe('ok')
    expect(calls[0].headers['x-goog-api-key']).toBe(AQ_KEY)
    expect(calls[0].url).not.toContain('key=')
  })

  it('still sends a legacy AIza key unchanged', async () => {
    const legacy = 'AIza' + 'SyD4x9Qw7Er2Ty8Ui1Op3As5Df6Gh0Jk'
    answer(200, reply('ok'))
    await httpGeminiClient(legacy).generate('hi')
    expect(calls[0].headers['x-goog-api-key']).toBe(legacy)
  })

  const cases: [number, string, string, GeminiFailure][] = [
    [400, 'INVALID_ARGUMENT', 'API_KEY_INVALID', 'invalid_key'],
    [403, 'PERMISSION_DENIED', 'API_KEY_SERVICE_BLOCKED', 'key_not_allowed'],
    [403, 'PERMISSION_DENIED', 'SERVICE_DISABLED', 'api_disabled'],
    [403, 'PERMISSION_DENIED', 'BILLING_DISABLED', 'billing_disabled'],
    [
      403,
      'PERMISSION_DENIED',
      'API_KEY_HTTP_REFERRER_BLOCKED',
      'key_restricted',
    ],
    [403, 'PERMISSION_DENIED', 'API_KEY_IP_ADDRESS_BLOCKED', 'key_restricted'],
  ]
  for (const [code, status, reason, failure] of cases) {
    it(`maps ${reason} to ${failure}`, async () => {
      answer(code, googleError(code, status, reason))
      expect(await failureOf()).toBe(failure)
    })
  }

  it('reports an unknown reason as a plain request failure', async () => {
    answer(429, googleError(429, 'RESOURCE_EXHAUSTED', 'RATE_LIMIT_EXCEEDED'))
    expect(await failureOf()).toBe('request_failed')
  })

  it('reports a non-JSON error body as a plain request failure', async () => {
    answer(502, '<html>Bad gateway</html>')
    expect(await failureOf()).toBe('request_failed')
  })
})

describe('translate-instructions script', () => {
  it('calls the same model as the app', () => {
    const script = readFileSync('scripts/translate-instructions.mjs', 'utf-8')
    expect(script).toContain(`/models/${GEMINI_MODEL}:generateContent`)
    expect(script).not.toMatch(/gemini-2\.\d/)
  })

  it('sends the key in the x-goog-api-key header, never in the URL', () => {
    const script = readFileSync('scripts/translate-instructions.mjs', 'utf-8')
    expect(script).toMatch(/'x-goog-api-key': key\b/)
    expect(script).not.toContain('?key=')
  })
})
