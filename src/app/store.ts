/**
 * Zustand 전역 상태 관리
 */

import { create } from 'zustand'
import type { TransportOption, PlaceInfo, DayItinerary } from '../lib/api'

export interface SearchParams {
  from: string
  to: string
  departAt: string
  returnAt?: string
  days?: number
  pax?: number
  budget?: number
  modes: string[]
  preferences?: {
    tags?: string[]
    budget?: 'low' | 'medium' | 'high'
    pace?: 'relaxed' | 'moderate' | 'packed'
  }
}

export interface AppState {
  // 검색 파라미터
  params: Partial<SearchParams>
  setParams: (params: Partial<SearchParams>) => void

  // 교통편 결과
  results: TransportOption[]
  setResults: (results: TransportOption[]) => void

  // 여행 일정
  itinerary: DayItinerary[]
  setItinerary: (itinerary: DayItinerary[]) => void

  // 여행지 정보
  places: PlaceInfo[]
  setPlaces: (places: PlaceInfo[]) => void

  // 로딩 상태
  loading: boolean
  setLoading: (loading: boolean) => void

  // 에러
  error: string | null
  setError: (error: string | null) => void

  // 최근 검색 기록 (localStorage 연동)
  recentSearches: Partial<SearchParams>[]
  addRecentSearch: (search: Partial<SearchParams>) => void
  clearRecentSearches: () => void

  // UI 상태
  mapVisible: boolean
  setMapVisible: (visible: boolean) => void

  selectedPlace: PlaceInfo | null
  setSelectedPlace: (place: PlaceInfo | null) => void
}

// localStorage 키
const RECENT_SEARCHES_KEY = 'travel-personalizer-recent-searches'

// localStorage에서 최근 검색 로드
function loadRecentSearches(): Partial<SearchParams>[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// localStorage에 최근 검색 저장
function saveRecentSearches(searches: Partial<SearchParams>[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 5)))
  } catch (error) {
    console.warn('Failed to save recent searches:', error)
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // 초기 상태
  params: {
    modes: ['plane', 'train', 'bus'],
    pax: 1,
    days: 3,
  },
  results: [],
  itinerary: [],
  places: [],
  loading: false,
  error: null,
  recentSearches: loadRecentSearches(),
  mapVisible: true,
  selectedPlace: null,

  // Actions
  setParams: (params) => {
    set((state) => ({
      params: { ...state.params, ...params },
    }))
  },

  setResults: (results) => {
    set({ results })
  },

  setItinerary: (itinerary) => {
    set({ itinerary })
  },

  setPlaces: (places) => {
    set({ places })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setError: (error) => {
    set({ error })
  },

  addRecentSearch: (search) => {
    const recentSearches = get().recentSearches
    const newSearches = [search, ...recentSearches.filter((s) => s.to !== search.to)].slice(0, 5)
    set({ recentSearches: newSearches })
    saveRecentSearches(newSearches)
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] })
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  },

  setMapVisible: (mapVisible) => {
    set({ mapVisible })
  },

  setSelectedPlace: (selectedPlace) => {
    set({ selectedPlace })
  },
}))
