/**
 * 여행 일정 페이지
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../app/store'
import { useTranslation } from '../i18n'
import { fetchPlaces } from '../lib/api'
import { buildItinerary } from '../lib/algorithms'
import ItineraryPlanner from '../components/ItineraryPlanner'
import PlaceCards from '../components/PlaceCards'

export default function Itinerary() {
  const t = useTranslation()
  const navigate = useNavigate()
  const {
    params,
    itinerary,
    setItinerary,
    places,
    setPlaces,
    loading,
    setLoading,
    error,
    setError,
  } = useAppStore()

  const [showPlaces, setShowPlaces] = useState(false)

  useEffect(() => {
    // 파라미터가 없으면 홈으로
    if (!params.to) {
      navigate('/')
      return
    }

    // 일정이 이미 있으면 재사용
    if (itinerary.length > 0) {
      return
    }

    // 일정 자동 생성
    const generate = async () => {
      setLoading(true)
      setError(null)

      try {
        // 장소 정보 가져오기
        const placesData = await fetchPlaces({
          destination: params.to!,
        })
        setPlaces(placesData)

        // 일정 생성
        const generatedItinerary = buildItinerary({
          destination: params.to!,
          days: params.days || 3,
          preferences: params.preferences,
          places: placesData,
        })

        setItinerary(generatedItinerary)
      } catch (err) {
        console.error('Failed to generate itinerary:', err)
        setError(t.common.error)
      } finally {
        setLoading(false)
      }
    }

    generate()
  }, [params, navigate])

  const handleRegenerateItinerary = async () => {
    setLoading(true)
    setError(null)

    try {
      const generatedItinerary = buildItinerary({
        destination: params.to!,
        days: params.days || 3,
        preferences: params.preferences,
        places,
      })

      setItinerary(generatedItinerary)
    } catch (err) {
      console.error('Failed to regenerate itinerary:', err)
      setError(t.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">{t.app.name}</h1>
            <nav className="flex gap-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              >
                {t.nav.home}
              </Link>
              <Link
                to="/results"
                className="text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              >
                {t.nav.results}
              </Link>
              <Link
                to="/itinerary"
                className="text-primary font-medium border-b-2 border-primary px-2 py-1"
              >
                {t.nav.itinerary}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t.itinerary.title}</h2>
            <p className="text-gray-600 mt-1">
              {params.to} • {params.days || 3}일
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRegenerateItinerary}
              disabled={loading}
              className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            >
              {t.itinerary.autoGenerate}
            </button>
            <button
              onClick={() => setShowPlaces(!showPlaces)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              {showPlaces ? '일정 보기' : t.places.title}
            </button>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t.common.loading}</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleRegenerateItinerary}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {t.common.retry}
            </button>
          </div>
        )}

        {/* 일정 또는 장소 */}
        {!loading && !error && (
          <>
            {showPlaces ? (
              <PlaceCards
                places={places}
                onSelect={(place) => {
                  console.log('Selected place:', place)
                  // TODO: 일정에 추가하는 기능
                }}
              />
            ) : (
              <ItineraryPlanner itinerary={itinerary} onUpdate={setItinerary} />
            )}
          </>
        )}

        {/* Triple 레이아웃 참고 안내 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 UX 참고</h3>
          <p className="text-blue-700 mb-2">
            이 일정 레이아웃은 Triple의 일정 플래너 UX를 참고하여 설계되었습니다.
          </p>
          <a
            href="https://triple.guide/trips/plan/O2KQAebXJvYqQD46lgB7aj36lWk4PM?outlet=int-package&is_public=true"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Triple 일정 예시 보기 →
          </a>
          <p className="text-sm text-blue-600 mt-2">
            (데이터는 크롤링하지 않고 Mock 데이터를 사용합니다)
          </p>
        </div>
      </main>
    </div>
  )
}
