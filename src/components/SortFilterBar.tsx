/**
 * 정렬/필터 바 컴포넌트
 */

import { useTranslation } from '../i18n'

interface SortFilterBarProps {
  onSort: (sortBy: 'cost' | 'duration' | 'transfers') => void
  currentSort: 'cost' | 'duration' | 'transfers'
}

export default function SortFilterBar({ onSort, currentSort }: SortFilterBarProps) {
  const t = useTranslation()

  const sortOptions = [
    { value: 'cost' as const, label: t.results.byCost },
    { value: 'duration' as const, label: t.results.byDuration },
    { value: 'transfers' as const, label: t.results.byTransfers },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">{t.results.sortBy}:</span>
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSort(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                currentSort === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={currentSort === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
