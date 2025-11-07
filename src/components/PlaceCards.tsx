/**
 * 여행지 카드 컴포넌트
 */

import type { PlaceInfo } from '../lib/api'
import { useTranslation } from '../i18n'

interface PlaceCardsProps {
  places: PlaceInfo[]
  onSelect?: (place: PlaceInfo) => void
}

export default function PlaceCards({ places, onSelect }: PlaceCardsProps) {
  const t = useTranslation()

  if (places.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>추천 여행지가 없습니다.</p>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attraction':
        return '🏛️'
      case 'restaurant':
        return '🍽️'
      case 'experience':
        return '🎭'
      case 'nature':
        return '🌲'
      default:
        return '📍'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'attraction':
        return t.places.attraction
      case 'restaurant':
        return t.places.restaurant
      case 'experience':
        return t.places.experience
      case 'nature':
        return t.places.nature
      default:
        return category
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place) => (
        <div
          key={place.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => onSelect?.(place)}
          role="article"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect?.(place)
            }
          }}
          aria-label={place.name}
        >
          {/* 이미지 */}
          {place.imageUrl ? (
            <div className="h-48 bg-gray-200">
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-6xl">
              {getCategoryIcon(place.category)}
            </div>
          )}

          {/* 내용 */}
          <div className="p-4">
            {/* 카테고리 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary-dark bg-primary-light bg-opacity-20 px-2 py-1 rounded">
                {getCategoryLabel(place.category)}
              </span>
              <div className="flex items-center space-x-1 text-yellow-500">
                <span>⭐</span>
                <span className="text-sm font-semibold text-gray-700">{place.rating}</span>
              </div>
            </div>

            {/* 이름 */}
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{place.name}</h3>

            {/* 주소 */}
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{place.address}</p>

            {/* 메타 정보 */}
            <div className="space-y-1 text-xs text-gray-500">
              {place.openHours && (
                <div className="flex items-center space-x-1">
                  <span>🕐</span>
                  <span>{place.openHours}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span>💬</span>
                <span>
                  {place.reviewCount.toLocaleString()} {t.places.reviews}
                </span>
              </div>
            </div>

            {/* 웹사이트 */}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                onClick={(e) => e.stopPropagation()}
              >
                {t.places.website} →
              </a>
            )}

            {/* 저장 버튼 */}
            <button
              className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation()
                alert(`"${place.name}" 저장됨`)
              }}
            >
              {t.places.save}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
