import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

export interface AnalyticsEvent {
  id: string
  timestamp: Date
  eventName: string
  properties: Record<string, unknown>
}

interface AnalyticsContextType {
  events: AnalyticsEvent[]
  track: (eventName: string, properties?: Record<string, unknown>) => void
  clearEvents: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

// Configuration
const VEYA_ENDPOINT = '/v1/events'
const TENANT_ID = import.meta.env.VITE_VEYA_TENANT_ID || 'front_end_demo'
const BATCH_SIZE = 10
const FLUSH_INTERVAL = 5000 // 5 seconds
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

// Top-level API fields that should be promoted from properties
const TOP_LEVEL_FIELDS = new Set([
  'product_id', 'product_name', 'product_category', 'product_price', 'quantity',
  'cart_value', 'cart_item_count',
  'funnel_step', 'funnel_step_number',
  'page_type', 'search_query', 'event_category',
  'error_type', 'error_message',
  'is_logged_in', 'login_method',
  'store_id', 'customer_id'
])

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

function getVisitorId(): string {
  const key = 'veya_visitor_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = generateId()
    localStorage.setItem(key, id)
  }
  return id
}

function getSessionId(): string {
  const key = 'veya_session'
  const now = Date.now()
  const raw = localStorage.getItem(key)

  if (raw) {
    try {
      const session = JSON.parse(raw)
      if (now - session.lastActivity < SESSION_TIMEOUT) {
        session.lastActivity = now
        localStorage.setItem(key, JSON.stringify(session))
        return session.id
      }
    } catch {
      // Invalid session data, create new
    }
  }

  const newSession = { id: generateId(), lastActivity: now }
  localStorage.setItem(key, JSON.stringify(newSession))
  return newSession.id
}

function getDeviceType(): string {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'unknown'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/iOS|iPhone|iPad/.test(ua)) return 'iOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'unknown'
}

function getOSVersion(): string {
  const ua = navigator.userAgent
  const match = ua.match(/(?:Windows NT|Mac OS X|Android|iOS)\s*([\d._]+)/i)
  return match ? match[1].replace(/_/g, '.') : 'unknown'
}

function getUTMParams(): Record<string, string | null> {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content')
  }
}

function inferEventCategory(eventName: string): string {
  if (eventName.includes('cart')) return 'cart'
  if (eventName.includes('checkout') || eventName.includes('order')) return 'checkout'
  if (eventName.includes('product') || eventName.includes('menu')) return 'catalog'
  if (eventName.includes('search') || eventName.includes('category')) return 'catalog'
  if (eventName.includes('page') || eventName.includes('session')) return 'navigation'
  if (eventName.includes('error')) return 'error'
  return 'engagement'
}

function flushEvents(queue: Record<string, unknown>[]) {
  if (queue.length === 0) return

  const payload = {
    batch_id: generateId(),
    tenant_id: TENANT_ID,
    events: queue,
    sent_at: new Date().toISOString()
  }

  const body = JSON.stringify(payload)

  if (typeof navigator.sendBeacon === 'function') {
    const sent = navigator.sendBeacon(VEYA_ENDPOINT, new Blob([body], { type: 'application/json' }))
    if (sent) return
  }

  fetch(VEYA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(err => console.warn('[Veya Analytics] Failed to send events:', err))
}

let eventCounter = 0

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const eventQueue = useRef<Record<string, unknown>[]>([])
  const visitorId = useRef(getVisitorId())

  const flush = useCallback(() => {
    if (eventQueue.current.length === 0) return
    const batch = eventQueue.current.splice(0)
    flushEvents(batch)
  }, [])

  useEffect(() => {
    const timer = setInterval(flush, FLUSH_INTERVAL)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    const handleUnload = () => flush()

    window.addEventListener('beforeunload', handleUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      flush()
    }
  }, [flush])

  const track = useCallback((eventName: string, properties: Record<string, unknown> = {}) => {
    const sessionId = getSessionId()

    const event: AnalyticsEvent = {
      id: `evt_${++eventCounter}_${Date.now()}`,
      timestamp: new Date(),
      eventName,
      properties
    }

    setEvents(prev => [event, ...prev].slice(0, 100))

    // Separate top-level API fields from custom properties
    const topLevel: Record<string, unknown> = {}
    const customProps: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(properties)) {
      if (TOP_LEVEL_FIELDS.has(key)) {
        topLevel[key] = value
      } else {
        customProps[key] = value
      }
    }

    const utmParams = getUTMParams()

    // Build API event payload per Veya Analytics spec
    const apiEvent: Record<string, unknown> = {
      event_id: generateId(),
      event_name: eventName,
      event_category: topLevel.event_category || inferEventCategory(eventName),
      event_timestamp: new Date().toISOString(),
      tenant_id: TENANT_ID,
      session_id: sessionId,
      visitor_id: visitorId.current,

      // Page context
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || null,

      // Device & browser info
      device_type: getDeviceType(),
      platform: 'web',
      browser: getBrowser(),
      os: getOS(),
      os_version: getOSVersion(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,

      // UTM attribution
      ...(utmParams.utm_source ? utmParams : {}),

      // Promoted top-level fields (product, cart, funnel, search, etc.)
      ...topLevel,

      // Remaining custom properties
      properties: Object.keys(customProps).length > 0 ? customProps : undefined
    }

    eventQueue.current.push(apiEvent)

    if (eventQueue.current.length >= BATCH_SIZE) {
      flush()
    }

    console.log('[Veya Analytics]', eventName, properties)
  }, [flush])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return (
    <AnalyticsContext.Provider value={{ events, track, clearEvents }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider')
  return context
}
