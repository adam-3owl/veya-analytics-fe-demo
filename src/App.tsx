import { useState, useEffect, useMemo, useRef } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext'
import { CartProvider } from './context/CartContext'
import { Header } from './components/Header'
import { ProductCard } from './components/ProductCard'
import { ProductModal } from './components/ProductModal'
import { Cart } from './components/Cart'
import { Checkout } from './components/Checkout'
import { AnalyticsLog } from './components/AnalyticsLog'
import { menuItems, categories, MenuItem } from './data/menu'

function MenuApp() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const analytics = useAnalytics()
  const hasTrackedPageView = useRef(false)

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true
      analytics.track('page_view', { page_type: 'menu', funnel_step: 'menu', funnel_step_number: 2 })
    }
  }, [analytics])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      analytics.track('search', { search_query: query, result_count: filteredItems.length })
    }
  }

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category)
    if (category) {
      analytics.track('category_view', { product_category: category })
    }
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
    analytics.track('checkout_start', { funnel_step: 'checkout', funnel_step_number: 4 })
  }

  return (
    <div className="min-h-screen pb-56">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <ProductCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No items found</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleCheckout} />
      <Checkout isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Analytics Log */}
      <AnalyticsLog />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AnalyticsProvider>
        <CartProvider>
          <MenuApp />
        </CartProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  )
}
