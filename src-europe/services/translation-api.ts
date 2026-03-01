import {EUROPE_SOCIAL_CONFIG} from '#europe/config'

export interface TranslateRequest {
  text: string
  source_lang?: string
  target_lang: string
  post_uri?: string
  author_verified?: boolean
  engagement_score?: number
}

export interface TranslateResponse {
  translated_text: string
  source_lang: string
  target_lang: string
  provider: string
  confidence: number
  cached?: boolean
}

export interface SupportedLanguage {
  code: string
  name: string
  native_name: string
}

class TranslationAPI {
  private baseUrl: string

  constructor(baseUrl = EUROPE_SOCIAL_CONFIG.services.translation) {
    this.baseUrl = baseUrl
  }

  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        text: request.text,
        source_lang: request.source_lang,
        target_lang: request.target_lang,
        post_uri: request.post_uri,
        author_verified: request.author_verified ?? false,
        engagement_score: request.engagement_score ?? 0,
      }),
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    const response = await fetch(`${this.baseUrl}/languages`)
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }
    const data = await response.json()
    // Backend returns { languages: [...] }, unwrap it
    return Array.isArray(data) ? data : data.languages ?? []
  }

  async getStats(): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/stats`)
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }
    return response.json()
  }
}

export const translationAPI = new TranslationAPI()
