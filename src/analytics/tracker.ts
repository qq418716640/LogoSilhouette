/**
 * Umami Analytics 封装
 */

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void
    }
  }
}

interface CommonData {
  tool: string
  tool_version: string
  page: string
  locale: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

class Tracker {
  private commonData: CommonData

  constructor() {
    this.commonData = {
      tool: 'LogoSilhouette',
      tool_version: 'v1',
      page: '/logosilhouette',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      ...this.parseUtmParams(),
    }
  }

  private parseUtmParams(): Partial<CommonData> {
    if (typeof window === 'undefined') return {}

    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    }
  }

  track(event: string, data?: Record<string, unknown>): void {
    const payload = { ...this.commonData, ...data }

    // 发送到 Umami
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(event, payload)
    }

    // 开发环境打印日志
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, payload)
    }
  }
}

export const tracker = new Tracker()
