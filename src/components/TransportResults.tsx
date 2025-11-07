/**
 * 교통편 검색 결과 컴포넌트
 */

import type { TransportOption } from '../lib/api'
import { useTranslation } from '../i18n'

interface TransportResultsProps {
  results: TransportOption[]
}

export default function TransportResults({ results }: TransportResultsProps) {
  const t = useTranslation()

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t.results.noResults}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          role="article"
          aria-label={`교통편 옵션 ${index + 1}`}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {result.mode === 'plane' && '✈️'}
                {result.mode === 'train' && '🚄'}
                {result.mode === 'bus' && '🚌'}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{result.carrier}</h3>
                <p className="text-sm text-gray-500">
                  {result.transfers} {t.results.transfers}
                </p>
              </div>
            </div>

            {/* 배지 */}
            <div className="flex gap-2">
              {result.discounted && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  {t.results.discounted}
                </span>
              )}
              {result.cancellationAvailable && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  {t.results.cancellation}
                </span>
              )}
            </div>
          </div>

          {/* 타임라인 */}
          <div className="relative pl-8 space-y-4">
            {result.segments.map((segment, segIndex) => (
              <div key={segIndex} className="relative">
                {/* 시간 라인 */}
                {segIndex > 0 && (
                  <div className="absolute left-0 top-0 w-0.5 h-full bg-gray-300 -translate-x-4"></div>
                )}

                {/* 시작 지점 */}
                <div className="flex items-center space-x-4">
                  <div className="absolute -left-10 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-800">{segment.depart}</span>
                        <span className="ml-3 text-gray-600">{segment.from}</span>
                      </div>
                      {segment.flightNumber && (
                        <span className="text-sm text-gray-500">{segment.flightNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 경로 선 */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-primary -translate-x-4"></div>

                {/* 도착 지점 */}
                <div className="flex items-center space-x-4 mt-8">
                  <div className="absolute -left-10 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-800">{segment.arrive}</span>
                        <span className="ml-3 text-gray-600">{segment.to}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 환승 표시 */}
                {segIndex < result.segments.length - 1 && (
                  <div className="mt-4 ml-4 text-sm text-gray-500 italic">
                    → {t.results.transfers}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 푸터 */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">⏱️ {result.totalMinutes}</span> {t.results.minutes}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {result.totalCost.toLocaleString()} {t.results.won}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
