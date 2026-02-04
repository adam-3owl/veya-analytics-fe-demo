import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAnalytics } from '../context/AnalyticsContext'

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, total, clearCart } = useCart()
  const analytics = useAnalytics()
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  if (!isOpen) return null

  const tax = total * 0.08
  const grandTotal = total + tax

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    analytics.track('checkout_step', {
      checkout_step: 'contact_info',
      funnel_step: 'checkout', funnel_step_number: 4,
      page_type: 'checkout'
    })
    setStep('payment')
  }

  const handlePayment = () => {
    analytics.track('checkout_step', {
      checkout_step: 'payment',
      funnel_step: 'checkout', funnel_step_number: 4,
      page_type: 'checkout'
    })

    // Simulate payment processing
    setTimeout(() => {
      const orderId = `ORD-${Date.now()}`
      analytics.track('checkout_complete', {
        cart_value: grandTotal,
        cart_item_count: items.length,
        funnel_step: 'confirmation', funnel_step_number: 5,
        page_type: 'confirmation',
        order_id: orderId,
        olo_order_id: `OLO-${Date.now()}`,
        subtotal: total,
        tax,
        order_type: 'pickup',
        payment_method: 'credit_card',
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price }))
      })
      setStep('success')
      clearCart()
    }, 1500)
  }

  const handleClose = () => {
    setStep('details')
    setFormData({ name: '', email: '', phone: '', address: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {step === 'details' && (
            <>
              <h2 className="text-2xl font-bold mb-6">Checkout</h2>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData(d => ({ ...d, address: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-neutral-800 pt-4 mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors mt-4"
                >
                  Continue to Payment
                </button>
              </form>
            </>
          )}

          {step === 'payment' && (
            <>
              <h2 className="text-2xl font-bold mb-6">Payment</h2>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo Mode</p>
                  <p className="font-medium">Click pay to simulate a successful payment</p>
                </div>
                <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Pay ${grandTotal.toFixed(2)}
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Thank you for your order. You'll receive a confirmation email shortly.</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
