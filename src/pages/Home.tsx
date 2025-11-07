/**
 * 홈 페이지
 */

import { Link } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import { useTranslation } from '../i18n'
import { useAppStore } from '../app/store'

export default function Home() {
  const t = useTranslation()
  const { recentSearches, clearRecentSearches } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                className="text-gray-700 hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              >
                {t.nav.itinerary}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 히어로 섹션 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.app.subtitle}</h2>
          <p className="text-lg text-gray-600">
            실시간 대중교통 연계, AI 일정 자동 생성, 맞춤형 여행지 추천
          </p>
        </div>

        {/* 검색 폼 */}
        <SearchForm />

        {/* 최근 검색 */}
        {recentSearches.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.search.recentSearches}</h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded px-2 py-1"
              >
                {t.common.delete}
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <Link
                  key={index}
                  to="/results"
                  onClick={() => {
                    // 최근 검색을 파라미터로 설정
                    useAppStore.getState().setParams(search)
                  }}
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600">
                        {search.from} → {search.to}
                      </span>
                      {search.days && (
                        <span className="text-sm text-gray-500">
                          {search.days}일
                        </span>
                      )}
                    </div>
                    <span className="text-primary">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 기능 소개 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">🚄</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">실시간 교통편</h3>
            <p className="text-sm text-gray-600">
              버스, 기차, 항공편을 한 번에 비교하고 최적의 경로를 찾아보세요.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">🗓️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 일정 생성</h3>
            <p className="text-sm text-gray-600">
              목적지와 일수만 입력하면 완벽한 여행 일정이 자동으로 만들어집니다.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">맞춤 추천</h3>
            <p className="text-sm text-gray-600">
              인기 관광지, 맛집, 체험 활동을 평점과 리뷰 기반으로 추천합니다.
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>&copy; 2024 Travel Personalizer. All rights reserved.</p>
          <p className="mt-2">
            Powered by React + Vite + Zustand + Google Maps
          </p>
        </div>
      </footer>
    </div>
  )
}
