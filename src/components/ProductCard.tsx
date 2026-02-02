import { MenuItem } from '../data/menu'
import { useCart } from '../context/CartContext'
import { useAnalytics } from '../context/AnalyticsContext'

interface ProductCardProps {
  item: MenuItem
  onClick: () => void
}

export function ProductCard({ item, onClick }: ProductCardProps) {
  const { addItem } = useCart()
  const analytics = useAnalytics()

  const handleClick = () => {
    analytics.track('productClick', {
      product: { id: item.id, name: item.name, price: item.price, category: item.category }
    })
    onClick()
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(item)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <span className="text-orange-600 dark:text-orange-400 font-bold">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {item.description}
        </p>
        <button
          onClick={handleQuickAdd}
          className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
