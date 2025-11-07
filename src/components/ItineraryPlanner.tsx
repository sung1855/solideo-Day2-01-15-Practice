/**
 * 여행 일정 플래너 컴포넌트
 */

import { useState } from 'react'
import type { DayItinerary } from '../lib/api'
import { useTranslation } from '../i18n'
import MapView from './MapView'

interface ItineraryPlannerProps {
  itinerary: DayItinerary[]
  onUpdate?: (itinerary: DayItinerary[]) => void
}

export default function ItineraryPlanner({ itinerary, onUpdate }: ItineraryPlannerProps) {
  const t = useTranslation()
  const [showMap, setShowMap] = useState(true)
  const [selectedDay, setSelectedDay] = useState(1)

  if (itinerary.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t.itinerary.noItinerary}</p>
      </div>
    )
  }

  const currentDayItinerary = itinerary.find((day) => day.day === selectedDay)

  // 지도 waypoints 생성
  const waypoints =
    currentDayItinerary?.items
      .filter((item) => item.position)
      .map((item, index) => ({
        position: item.position!,
        title: item.title,
        label: String(index + 1),
      })) || []

  const handleDeleteItem = (dayIndex: number, itemIndex: number) => {
    if (!onUpdate) return

    const newItinerary = [...itinerary]
    newItinerary[dayIndex].items.splice(itemIndex, 1)
    onUpdate(newItinerary)
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 바 */}
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div className="flex gap-2">
          {itinerary.map((day) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                selectedDay === day.day
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={selectedDay === day.day}
            >
              {t.itinerary.day} {day.day}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          {showMap ? t.itinerary.hideMap : t.itinerary.showMap}
        </button>
      </div>

      {/* 지도 */}
      {showMap && waypoints.length > 0 && (
        <MapView waypoints={waypoints} mode="polyline" className="w-full" />
      )}

      {/* 일정 상세 */}
      {currentDayItinerary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {t.itinerary.day} {currentDayItinerary.day} {t.itinerary.title}
          </h3>

          <div className="space-y-6">
            {currentDayItinerary.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="relative pl-8 border-l-2 border-primary pb-6 last:pb-0 last:border-l-0"
              >
                {/* 타임 마커 */}
                <div className="absolute -left-3 top-0 w-5 h-5 bg-primary rounded-full border-2 border-white"></div>

                {/* 항목 카드 */}
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-semibold text-primary">
                          {item.startTime} - {item.endTime}
                        </span>
                        {item.transport && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {item.transport}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>
                      {item.note && <p className="text-sm text-gray-600 mb-2">{item.note}</p>}
                      {item.cost && item.cost > 0 && (
                        <p className="text-sm text-gray-500">
                          💰 {item.cost.toLocaleString()} {t.results.won}
                        </p>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    {onUpdate && (
                      <button
                        onClick={() =>
                          handleDeleteItem(
                            itinerary.findIndex((d) => d.day === selectedDay),
                            itemIndex
                          )
                        }
                        className="ml-4 text-red-500 hover:text-red-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-300 rounded p-1"
                        aria-label={t.itinerary.deleteItem}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
