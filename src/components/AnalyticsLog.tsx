import { useAnalytics } from '../context/AnalyticsContext'
import { useState } from 'react'

export function AnalyticsLog() {
  const { events, clearEvents } = useAnalytics()
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const toggleEvent = (id: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getEventColor = (eventName: string) => {
    if (eventName.includes('checkout') || eventName.includes('Complete')) return 'text-green-600 dark:text-green-600'
    if (eventName.includes('Cart') || eventName.includes('add') || eventName.includes('remove')) return 'text-blue-600 dark:text-blue-600'
    if (eventName.includes('product') || eventName.includes('View')) return 'text-purple-600 dark:text-purple-600'
    if (eventName.includes('search')) return 'text-yellow-600 dark:text-yellow-600'
    return 'text-gray-600 dark:text-gray-600'
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 shadow-2xl border-t bg-neutral-900 text-gray-100 border-neutral-700 dark:bg-white dark:text-gray-900 dark:border-gray-200">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer bg-neutral-800 dark:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm font-semibold">Analytics Log</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">({events.length} events)</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={e => { e.stopPropagation(); clearEvents() }}
              className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 dark:bg-gray-200 dark:hover:bg-gray-300"
            >
              Clear
            </button>
          )}
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="h-48 overflow-y-auto font-mono text-xs">
          {events.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No events yet. Interact with the menu to see analytics events.
            </div>
          ) : (
            <div className="divide-y divide-neutral-800 dark:divide-gray-200">
              {events.map(event => (
                <div
                  key={event.id}
                  className="cursor-pointer hover:bg-neutral-800/50 dark:hover:bg-gray-100"
                  onClick={() => toggleEvent(event.id)}
                >
                  <div className="px-4 py-2 flex items-center gap-3">
                    <span className="w-20 shrink-0 text-gray-500">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`font-semibold ${getEventColor(event.eventName)}`}>
                      {event.eventName}
                    </span>
                    <span className="truncate text-gray-400 dark:text-gray-600">
                      {JSON.stringify(event.properties).slice(0, 60)}
                      {JSON.stringify(event.properties).length > 60 ? '...' : ''}
                    </span>
                  </div>
                  {expandedEvents.has(event.id) && (
                    <pre className="px-4 pb-2 whitespace-pre-wrap break-all text-gray-300 bg-neutral-800/30 dark:text-gray-700 dark:bg-gray-100">
                      {JSON.stringify(event.properties, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
