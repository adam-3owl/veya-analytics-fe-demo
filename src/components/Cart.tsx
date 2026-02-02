import { useCart } from '../context/CartContext'
import { useAnalytics } from '../context/AnalyticsContext'
import { useEffect, useRef } from 'react'

interface CartProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items, removeItem, updateQuantity, total } = useCart()
  const analytics = useAnalytics()
  const wasOpen = useRef(false)

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      analytics.track('viewCart', { itemCount: items.length, total })
    }
    wasOpen.current = isOpen
  }, [isOpen, analytics, items.length, total])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 rounded text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 rounded text-sm font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
