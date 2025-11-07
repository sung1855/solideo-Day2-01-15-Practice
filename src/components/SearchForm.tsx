/**
 * 여행 검색 폼 컴포넌트
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../app/store'
import { useTranslation } from '../i18n'
import { loadGoogleMaps, initAutocomplete } from '../lib/maps'

// 인기 목적지 리스트 (자동완성용)
const popularCities = [
  '서울', 'Seoul', '인천', 'Incheon', '부산', 'Busan', '제주', 'Jeju',
  '도쿄', 'Tokyo', '오사카', 'Osaka', '교토', 'Kyoto', '후쿠오카', 'Fukuoka', '삿포로', 'Sapporo',
  '파리', 'Paris', '런던', 'London', '뉴욕', 'New York', '로마', 'Rome', '바르셀로나', 'Barcelona',
  '방콕', 'Bangkok', '싱가포르', 'Singapore', '홍콩', 'Hong Kong', '타이베이', 'Taipei'
]

export default function SearchForm() {
  const t = useTranslation()
  const navigate = useNavigate()
  const { params, setParams, addRecentSearch } = useAppStore()

  const [from, setFrom] = useState(params.from || '')
  const [to, setTo] = useState(params.to || '')
  const [departAt, setDepartAt] = useState(params.departAt || '')
  const [days, setDays] = useState(params.days || 3)
  const [pax, setPax] = useState(params.pax || 1)
  const [budget, setBudget] = useState(params.budget || 1000000)
  const [modes, setModes] = useState<string[]>(params.modes || ['plane', 'train', 'bus'])

  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)

  // Google Places Autocomplete 초기화 (있을 경우)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.info('Google Maps API 키가 없습니다. 기본 자동완성을 사용합니다.')
      return
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        if (fromRef.current) {
          const autocomplete = initAutocomplete(fromRef.current)
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.formatted_address) {
              setFrom(place.formatted_address)
            } else if (place.name) {
              setFrom(place.name)
            }
          })
        }
        if (toRef.current) {
          const autocomplete = initAutocomplete(toRef.current)
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.formatted_address) {
              setTo(place.formatted_address)
            } else if (place.name) {
              setTo(place.name)
            }
          })
        }
        setGoogleMapsLoaded(true)
      })
      .catch((error) => {
        console.warn('Google Maps를 로드할 수 없습니다. 기본 자동완성을 사용합니다:', error)
      })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!from || !to || !departAt) {
      alert('출발지, 목적지, 출발일시를 입력해주세요.')
      return
    }

    const searchParams = {
      from,
      to,
      departAt,
      days,
      pax,
      budget,
      modes,
    }

    setParams(searchParams)
    addRecentSearch(searchParams)
    navigate('/results')
  }

  const handleReset = () => {
    setFrom('')
    setTo('')
    setDepartAt('')
    setDays(3)
    setPax(1)
    setBudget(1000000)
    setModes(['plane', 'train', 'bus'])
  }

  const toggleMode = (mode: string) => {
    if (modes.includes(mode)) {
      setModes(modes.filter((m) => m !== mode))
    } else {
      setModes([...modes, mode])
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
      aria-label={t.search.title}
    >
      <h2 className="text-2xl font-bold text-gray-800">{t.search.title}</h2>

      {/* 출발지/목적지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
            {t.search.from}
          </label>
          <input
            ref={fromRef}
            id="from"
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="서울"
            list={googleMapsLoaded ? undefined : "cities-from"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          {!googleMapsLoaded && (
            <datalist id="cities-from">
              {popularCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          )}
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            {t.search.to}
          </label>
          <input
            ref={toRef}
            id="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="도쿄"
            list={googleMapsLoaded ? undefined : "cities-to"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          {!googleMapsLoaded && (
            <datalist id="cities-to">
              {popularCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      {/* 출발일시/일수 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departAt" className="block text-sm font-medium text-gray-700 mb-1">
            {t.search.departAt}
          </label>
          <input
            id="departAt"
            type="datetime-local"
            value={departAt}
            onChange={(e) => setDepartAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
            {t.search.days}
          </label>
          <input
            id="days"
            type="number"
            min="1"
            max="30"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* 인원/예산 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pax" className="block text-sm font-medium text-gray-700 mb-1">
            {t.search.pax}
          </label>
          <input
            id="pax"
            type="number"
            min="1"
            max="20"
            value={pax}
            onChange={(e) => setPax(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            {t.search.budget} ({t.results.won})
          </label>
          <input
            id="budget"
            type="number"
            min="0"
            step="10000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* 교통수단 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.search.modes}</label>
        <div className="flex gap-4">
          {['plane', 'train', 'bus'].map((mode) => (
            <label key={mode} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modes.includes(mode)}
                onChange={() => toggleMode(mode)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">
                {mode === 'plane' && t.search.plane}
                {mode === 'train' && t.search.train}
                {mode === 'bus' && t.search.bus}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {t.search.search}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          {t.search.reset}
        </button>
      </div>
    </form>
  )
}
