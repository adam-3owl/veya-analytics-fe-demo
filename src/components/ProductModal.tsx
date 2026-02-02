import { useState, useEffect, useRef } from 'react'
import { MenuItem } from '../data/menu'
import { useCart } from '../context/CartContext'
import { useAnalytics } from '../context/AnalyticsContext'

interface ProductModalProps {
  item: MenuItem | null
  onClose: () => void
}

export function ProductModal({ item, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const analytics = useAnalytics()
  const lastTrackedItemId = useRef<string | null>(null)

  useEffect(() => {
    if (item && item.id !== lastTrackedItemId.current) {
      lastTrackedItemId.current = item.id
      analytics.track('productView', {
        product: { id: item.id, name: item.name, price: item.price, category: item.category }
      })
      setQuantity(1)
    }
    if (!item) {
      lastTrackedItemId.current = null
    }
  }, [item, analytics])

  if (!item) return null

  const handleAddToCart = () => {
    addItem(item, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <img src={item.image} alt={item.name} className="w-full h-56 object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold">{item.name}</h2>
            <span className="text-xl text-orange-600 dark:text-orange-400 font-bold">
              ${item.price.toFixed(2)}
            </span>
          </div>

          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 rounded mb-3">
            {item.category}
          </span>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{item.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded-lg text-xl font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded-lg text-xl font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Add ${(item.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
