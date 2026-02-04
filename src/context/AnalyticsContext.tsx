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
const VEYA_ENDPOINT = 'https://analytics.builtonveya.com/v1/events'
const TENANT_ID = import.meta.env.VITE_VEYA_TENANT_ID || 'front_end_demo'
const BATCH_SIZE = 10
const FLUSH_INTERVAL = 5000 // 5 seconds
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

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

    // Build API event payload per Veya Analytics spec
    const apiEvent: Record<string, unknown> = {
      event_id: generateId(),
      event_name: eventName,
      event_timestamp: new Date().toISOString(),
      tenant_id: TENANT_ID,
      session_id: sessionId,
      visitor_id: visitorId.current,
      page_url: window.location.href,
      page_title: document.title,
      device_type: getDeviceType(),
      platform: 'web',
      properties
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
