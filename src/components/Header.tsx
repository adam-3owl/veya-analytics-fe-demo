import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'

interface HeaderProps {
  onCartClick: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ onCartClick, searchQuery, onSearchChange }: HeaderProps) {
  const { isDark, toggle } = useTheme()
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <svg className="h-8 w-auto" viewBox="0 0 630 630" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M243.685 357.291C217.617 357.291 200.682 343.714 197.965 304.971V95.4061H0V315.367H0.289V359.507C0.289 483.462 69.36 536.18 177.908 536.18C372.001 536.18 627.535 385.298 627.535 95.4061H426.795C426.795 281.85 301.889 357.291 243.685 357.291Z" className="fill-neutral-900 dark:fill-white"/>
        </svg>

        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick={onCartClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="View cart"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-orange-600 rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
