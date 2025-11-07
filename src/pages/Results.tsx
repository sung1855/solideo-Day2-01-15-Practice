/**
 * 검색 결과 페이지
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../app/store'
import { useTranslation } from '../i18n'
import { fetchTransport } from '../lib/api'
import { sortByCost, sortByDuration, sortByTransfers } from '../lib/algorithms'
import TransportResults from '../components/TransportResults'
import SortFilterBar from '../components/SortFilterBar'

export default function Results() {
  const t = useTranslation()
  const navigate = useNavigate()
  const { params, results, setResults, loading, setLoading, error, setError } = useAppStore()

  const [sortBy, setSortBy] = useState<'cost' | 'duration' | 'transfers'>('cost')
  const [sortedResults, setSortedResults] = useState(results)

  useEffect(() => {
    // 파라미터가 없으면 홈으로
    if (!params.from || !params.to) {
      navigate('/')
      return
    }

    // 결과가 이미 있으면 재사용
    if (results.length > 0) {
      setSortedResults(results)
      return
    }

    // 교통편 검색
    const search = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchTransport({
          from: params.from!,
          to: params.to!,
          departAt: params.departAt!,
          modes: params.modes || ['plane', 'train', 'bus'],
        })
        setResults(data)
        setSortedResults(data)
      } catch (err) {
        console.error('Failed to fetch transport:', err)
        setError(t.common.error)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [params, navigate])

  // 정렬 적용
  useEffect(() => {
    if (results.length === 0) return

    const sorted = [...results]
    if (sortBy === 'cost') {
      sorted.sort(sortByCost)
    } else if (sortBy === 'duration') {
      sorted.sort(sortByDuration)
    } else if (sortBy === 'transfers') {
      sorted.sort(sortByTransfers)
    }
    setSortedResults(sorted)
  }, [sortBy, results])

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
                className="text-primary font-medium border-b-2 border-primary px-2 py-1"
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t.results.title}</h2>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>
              {params.from} → {params.to}
            </span>
            {params.days && <span>• {params.days}일</span>}
            {params.pax && <span>• {params.pax}명</span>}
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
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {t.common.retry}
            </button>
          </div>
        )}

        {/* 결과 */}
        {!loading && !error && (
          <>
            <SortFilterBar onSort={setSortBy} currentSort={sortBy} />
            <TransportResults results={sortedResults} />

            {/* 일정 생성 버튼 */}
            {sortedResults.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  to="/itinerary"
                  className="inline-block bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                >
                  {t.itinerary.autoGenerate} →
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
