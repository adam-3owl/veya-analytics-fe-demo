import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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

let eventCounter = 0

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  const track = useCallback((eventName: string, properties: Record<string, unknown> = {}) => {
    const event: AnalyticsEvent = {
      id: `evt_${++eventCounter}_${Date.now()}`,
      timestamp: new Date(),
      eventName,
      properties
    }

    setEvents(prev => [event, ...prev].slice(0, 100)) // Keep last 100 events

    // Simulate sending to Veya Analytics API
    console.log('[Veya Analytics]', eventName, properties)
  }, [])

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
