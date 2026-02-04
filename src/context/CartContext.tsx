import { createContext, useContext, useState, ReactNode } from 'react'
import { MenuItem } from '../data/menu'
import { useAnalytics } from './AnalyticsContext'

export interface CartItem extends MenuItem {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: MenuItem, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const analytics = useAnalytics()

  const addItem = (item: MenuItem, quantity = 1) => {
    const existing = items.find(i => i.id === item.id)
    if (existing) {
      analytics.track('update_cart_quantity', {
        product_id: item.id, product_name: item.name, product_price: item.price, product_category: item.category,
        quantity: existing.quantity + quantity,
        old_quantity: existing.quantity, new_quantity: existing.quantity + quantity
      })
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
      ))
    } else {
      analytics.track('add_to_cart', {
        product_id: item.id, product_name: item.name, product_price: item.price, product_category: item.category,
        quantity
      })
      setItems(prev => [...prev, { ...item, quantity }])
    }
  }

  const removeItem = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      analytics.track('remove_from_cart', {
        product_id: item.id, product_name: item.name, product_price: item.price, product_category: item.category,
        quantity: item.quantity
      })
    }
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = items.find(i => i.id === id)
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    if (item) {
      analytics.track('update_cart_quantity', {
        product_id: item.id, product_name: item.name, product_price: item.price, product_category: item.category,
        quantity,
        old_quantity: item.quantity, new_quantity: quantity
      })
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => {
    analytics.track('cart_cleared', { cart_item_count: items.length })
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
