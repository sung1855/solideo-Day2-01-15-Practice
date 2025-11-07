/**
 * API 인터페이스 및 Mock 데이터
 * 실제 API 연동은 VITE_PROXY_BASE 환경변수 설정 시 활성화
 */

// 타입 정의
export interface TransportSegment {
  from: string
  to: string
  depart: string
  arrive: string
  carrier?: string
  flightNumber?: string
}

export interface TransportOption {
  mode: 'plane' | 'train' | 'bus'
  carrier: string
  totalMinutes: number
  totalCost: number
  transfers: number
  segments: TransportSegment[]
  cancellationAvailable?: boolean
  discounted?: boolean
}

export interface PlaceInfo {
  id: string
  name: string
  category: 'attraction' | 'restaurant' | 'experience' | 'nature'
  rating: number
  reviewCount: number
  address: string
  openHours?: string
  website?: string
  position: { lat: number; lng: number }
  imageUrl?: string
}

export interface ItineraryItem {
  title: string
  placeId?: string
  startTime: string
  endTime: string
  transport?: string
  cost?: number
  note?: string
  position?: { lat: number; lng: number }
}

export interface DayItinerary {
  day: number
  items: ItineraryItem[]
}

// 메모리 캐시
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5분

function getCached(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * 프록시를 통한 API 호출
 */
async function fetchProxy(path: string, params: Record<string, any> = {}): Promise<any> {
  const proxyBase = import.meta.env.VITE_PROXY_BASE
  if (!proxyBase) {
    throw new Error('VITE_PROXY_BASE not configured')
  }

  const url = new URL(path, proxyBase)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Mock 교통편 데이터
 */
const mockTransportData: Record<string, TransportOption[]> = {
  'seoul-tokyo': [
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 145,
      totalCost: 220000,
      transfers: 0,
      segments: [
        {
          from: 'ICN',
          to: 'NRT',
          depart: '09:20',
          arrive: '11:45',
          carrier: 'Korean Air',
          flightNumber: 'KE702',
        },
      ],
      cancellationAvailable: true,
    },
    {
      mode: 'plane',
      carrier: 'ANA',
      totalMinutes: 155,
      totalCost: 198000,
      transfers: 0,
      segments: [
        {
          from: 'ICN',
          to: 'HND',
          depart: '14:30',
          arrive: '16:45',
          carrier: 'ANA',
          flightNumber: 'NH864',
        },
      ],
      discounted: true,
    },
  ],
  'seoul-osaka': [
    {
      mode: 'plane',
      carrier: 'Asiana',
      totalMinutes: 120,
      totalCost: 185000,
      transfers: 0,
      segments: [
        {
          from: 'ICN',
          to: 'KIX',
          depart: '10:15',
          arrive: '12:15',
          carrier: 'Asiana',
          flightNumber: 'OZ112',
        },
      ],
    },
  ],
  'seoul-jeju': [
    {
      mode: 'plane',
      carrier: 'Jeju Air',
      totalMinutes: 65,
      totalCost: 55000,
      transfers: 0,
      segments: [
        {
          from: 'GMP',
          to: 'CJU',
          depart: '08:00',
          arrive: '09:05',
          carrier: 'Jeju Air',
          flightNumber: '7C101',
        },
      ],
      discounted: true,
    },
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 70,
      totalCost: 78000,
      transfers: 0,
      segments: [
        {
          from: 'ICN',
          to: 'CJU',
          depart: '13:30',
          arrive: '14:40',
          carrier: 'Korean Air',
          flightNumber: 'KE1201',
        },
      ],
    },
  ],
}

/**
 * 교통편 조회
 */
export async function fetchTransport(options: {
  from: string
  to: string
  departAt: string
  modes: string[]
}): Promise<TransportOption[]> {
  const cacheKey = `transport_${options.from}_${options.to}_${options.departAt}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  // 실제 API 연동 시도
  const proxyBase = import.meta.env.VITE_PROXY_BASE
  if (proxyBase) {
    try {
      const data = await fetchProxy('/api/transport', options)
      setCache(cacheKey, data)
      return data
    } catch (error) {
      console.warn('Failed to fetch from proxy, using mock data:', error)
    }
  }

  // Mock 데이터 사용
  await new Promise((resolve) => setTimeout(resolve, 300)) // 네트워크 시뮬레이션

  const key = `${options.from.toLowerCase()}-${options.to.toLowerCase()}`
  const results = mockTransportData[key] || []

  setCache(cacheKey, results)
  return results
}

/**
 * 취소표/특가 조회
 */
export async function fetchCancellations(options: {
  from: string
  to: string
  dateRange: string[]
}): Promise<TransportOption[]> {
  const proxyBase = import.meta.env.VITE_PROXY_BASE
  if (proxyBase) {
    try {
      return await fetchProxy('/api/cancellations', options)
    } catch (error) {
      console.warn('Failed to fetch cancellations:', error)
    }
  }

  // Mock: 기존 교통편에서 할인된 것만 필터
  const allTransport = Object.values(mockTransportData).flat()
  return allTransport.filter((t) => t.discounted || t.cancellationAvailable)
}

/**
 * Mock 장소 데이터
 */
const mockPlacesData: Record<string, PlaceInfo[]> = {
  tokyo: [
    {
      id: 'tokyo-1',
      name: '센소지 (浅草寺)',
      category: 'attraction',
      rating: 4.5,
      reviewCount: 12453,
      address: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
      openHours: '06:00 - 17:00',
      position: { lat: 35.7148, lng: 139.7967 },
      imageUrl: '/images/sensoji.jpg',
    },
    {
      id: 'tokyo-2',
      name: '스시 다이 (すしだい)',
      category: 'restaurant',
      rating: 4.7,
      reviewCount: 8921,
      address: 'Tsukiji Market, Chuo City, Tokyo',
      openHours: '05:00 - 14:00',
      position: { lat: 35.665, lng: 139.7701 },
    },
    {
      id: 'tokyo-3',
      name: '도쿄 스카이트리',
      category: 'attraction',
      rating: 4.6,
      reviewCount: 15678,
      address: '1 Chome-1-2 Oshiage, Sumida City, Tokyo',
      openHours: '09:00 - 21:00',
      position: { lat: 35.7101, lng: 139.8107 },
    },
  ],
  osaka: [
    {
      id: 'osaka-1',
      name: '오사카성',
      category: 'attraction',
      rating: 4.4,
      reviewCount: 9876,
      address: '1-1 Osakajo, Chuo Ward, Osaka',
      openHours: '09:00 - 17:00',
      position: { lat: 34.6873, lng: 135.5262 },
    },
    {
      id: 'osaka-2',
      name: '이치란 라멘',
      category: 'restaurant',
      rating: 4.5,
      reviewCount: 7654,
      address: 'Dotonbori, Chuo Ward, Osaka',
      openHours: '24시간',
      position: { lat: 34.6686, lng: 135.5021 },
    },
  ],
  jeju: [
    {
      id: 'jeju-1',
      name: '성산일출봉',
      category: 'nature',
      rating: 4.6,
      reviewCount: 5432,
      address: '제주특별자치도 서귀포시 성산읍',
      openHours: '07:00 - 19:00',
      position: { lat: 33.4595, lng: 126.9424 },
    },
    {
      id: 'jeju-2',
      name: '흑돼지거리',
      category: 'restaurant',
      rating: 4.3,
      reviewCount: 3210,
      address: '제주특별자치도 제주시 건입동',
      openHours: '11:00 - 22:00',
      position: { lat: 33.4996, lng: 126.5312 },
    },
  ],
}

/**
 * 여행지/맛집 조회
 */
export async function fetchPlaces(options: {
  destination: string
  category?: string
}): Promise<PlaceInfo[]> {
  const cacheKey = `places_${options.destination}_${options.category || 'all'}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const proxyBase = import.meta.env.VITE_PROXY_BASE
  if (proxyBase) {
    try {
      const data = await fetchProxy('/api/places', options)
      setCache(cacheKey, data)
      return data
    } catch (error) {
      console.warn('Failed to fetch places:', error)
    }
  }

  // Mock 데이터
  await new Promise((resolve) => setTimeout(resolve, 200))

  const key = options.destination.toLowerCase()
  let results = mockPlacesData[key] || []

  if (options.category) {
    results = results.filter((p) => p.category === options.category)
  }

  setCache(cacheKey, results)
  return results
}
