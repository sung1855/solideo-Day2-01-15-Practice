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
  description?: string
  tags?: string[]
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
  const timeoutId = setTimeout(() => controller.abort(), 10000)

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
 * 도시 이름 정규화 (유연한 검색을 위해)
 */
function normalizeCity(city: string): string {
  const normalized = city.toLowerCase().trim()

  // 한글 -> 영문 매핑
  const cityMap: Record<string, string> = {
    '서울': 'seoul',
    '인천': 'incheon',
    '부산': 'busan',
    '제주': 'jeju',
    '도쿄': 'tokyo',
    '오사카': 'osaka',
    '후쿠오카': 'fukuoka',
    '삿포로': 'sapporo',
    '교토': 'kyoto',
    '파리': 'paris',
    '런던': 'london',
    '뉴욕': 'newyork',
    'new york': 'newyork',
  }

  return cityMap[normalized] || normalized
}

/**
 * Mock 교통편 데이터 (대폭 확장)
 */
const mockTransportData: Record<string, TransportOption[]> = {
  // 서울 -> 도쿄
  'seoul-tokyo': [
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 145,
      totalCost: 220000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'NRT', depart: '09:20', arrive: '11:45', carrier: 'Korean Air', flightNumber: 'KE702' }],
      cancellationAvailable: true,
    },
    {
      mode: 'plane',
      carrier: 'ANA',
      totalMinutes: 155,
      totalCost: 198000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'HND', depart: '14:30', arrive: '16:45', carrier: 'ANA', flightNumber: 'NH864' }],
      discounted: true,
    },
    {
      mode: 'plane',
      carrier: 'Asiana',
      totalMinutes: 150,
      totalCost: 205000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'NRT', depart: '11:00', arrive: '13:30', carrier: 'Asiana', flightNumber: 'OZ102' }],
    },
    {
      mode: 'plane',
      carrier: 'Jeju Air',
      totalMinutes: 140,
      totalCost: 165000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'NRT', depart: '07:30', arrive: '09:50', carrier: 'Jeju Air', flightNumber: '7C1101' }],
      discounted: true,
    },
  ],

  // 서울 -> 오사카
  'seoul-osaka': [
    {
      mode: 'plane',
      carrier: 'Asiana',
      totalMinutes: 120,
      totalCost: 185000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'KIX', depart: '10:15', arrive: '12:15', carrier: 'Asiana', flightNumber: 'OZ112' }],
    },
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 125,
      totalCost: 195000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'KIX', depart: '13:40', arrive: '15:45', carrier: 'Korean Air', flightNumber: 'KE722' }],
    },
    {
      mode: 'plane',
      carrier: 'Jin Air',
      totalMinutes: 115,
      totalCost: 155000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'KIX', depart: '08:00', arrive: '09:55', carrier: 'Jin Air', flightNumber: 'LJ202' }],
      discounted: true,
    },
  ],

  // 서울 -> 제주
  'seoul-jeju': [
    {
      mode: 'plane',
      carrier: 'Jeju Air',
      totalMinutes: 65,
      totalCost: 55000,
      transfers: 0,
      segments: [{ from: 'GMP', to: 'CJU', depart: '08:00', arrive: '09:05', carrier: 'Jeju Air', flightNumber: '7C101' }],
      discounted: true,
    },
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 70,
      totalCost: 78000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'CJU', depart: '13:30', arrive: '14:40', carrier: 'Korean Air', flightNumber: 'KE1201' }],
    },
    {
      mode: 'plane',
      carrier: 'Asiana',
      totalMinutes: 65,
      totalCost: 72000,
      transfers: 0,
      segments: [{ from: 'GMP', to: 'CJU', depart: '09:30', arrive: '10:35', carrier: 'Asiana', flightNumber: 'OZ8901' }],
    },
    {
      mode: 'plane',
      carrier: 'Jin Air',
      totalMinutes: 60,
      totalCost: 49000,
      transfers: 0,
      segments: [{ from: 'GMP', to: 'CJU', depart: '06:40', arrive: '07:40', carrier: 'Jin Air', flightNumber: 'LJ501' }],
      discounted: true,
    },
  ],

  // 서울 -> 부산
  'seoul-busan': [
    {
      mode: 'train',
      carrier: 'KTX',
      totalMinutes: 150,
      totalCost: 59800,
      transfers: 0,
      segments: [{ from: '서울역', to: '부산역', depart: '06:00', arrive: '08:30', carrier: 'KTX' }],
    },
    {
      mode: 'train',
      carrier: 'KTX',
      totalMinutes: 155,
      totalCost: 59800,
      transfers: 0,
      segments: [{ from: '서울역', to: '부산역', depart: '09:00', arrive: '11:35', carrier: 'KTX' }],
    },
    {
      mode: 'bus',
      carrier: '금호고속',
      totalMinutes: 270,
      totalCost: 35000,
      transfers: 0,
      segments: [{ from: '서울고속터미널', to: '부산종합터미널', depart: '07:30', arrive: '12:00', carrier: '금호고속' }],
    },
    {
      mode: 'plane',
      carrier: 'Air Busan',
      totalMinutes: 55,
      totalCost: 65000,
      transfers: 0,
      segments: [{ from: 'GMP', to: 'PUS', depart: '10:20', arrive: '11:15', carrier: 'Air Busan', flightNumber: 'BX711' }],
      discounted: true,
    },
  ],

  // 서울 -> 후쿠오카
  'seoul-fukuoka': [
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 110,
      totalCost: 165000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'FUK', depart: '10:30', arrive: '12:20', carrier: 'Korean Air', flightNumber: 'KE787' }],
    },
    {
      mode: 'plane',
      carrier: 'Asiana',
      totalMinutes: 115,
      totalCost: 158000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'FUK', depart: '14:00', arrive: '15:55', carrier: 'Asiana', flightNumber: 'OZ131' }],
      discounted: true,
    },
  ],

  // 서울 -> 교토 (오사카 경유)
  'seoul-kyoto': [
    {
      mode: 'plane',
      carrier: 'Korean Air + JR',
      totalMinutes: 210,
      totalCost: 225000,
      transfers: 1,
      segments: [
        { from: 'ICN', to: 'KIX', depart: '10:15', arrive: '12:15', carrier: 'Korean Air', flightNumber: 'KE722' },
        { from: 'KIX', to: 'Kyoto', depart: '13:30', arrive: '14:45', carrier: 'JR Haruka' }
      ],
    },
  ],

  // 서울 -> 삿포로
  'seoul-sapporo': [
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 165,
      totalCost: 285000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'CTS', depart: '09:30', arrive: '12:15', carrier: 'Korean Air', flightNumber: 'KE765' }],
    },
    {
      mode: 'plane',
      carrier: 'Asiana',
      totalMinutes: 170,
      totalCost: 275000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'CTS', depart: '13:20', arrive: '16:10', carrier: 'Asiana', flightNumber: 'OZ171' }],
      discounted: true,
    },
  ],

  // 서울 -> 파리
  'seoul-paris': [
    {
      mode: 'plane',
      carrier: 'Air France',
      totalMinutes: 720,
      totalCost: 1250000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'CDG', depart: '13:30', arrive: '18:30', carrier: 'Air France', flightNumber: 'AF262' }],
    },
    {
      mode: 'plane',
      carrier: 'Korean Air',
      totalMinutes: 735,
      totalCost: 1380000,
      transfers: 0,
      segments: [{ from: 'ICN', to: 'CDG', depart: '11:15', arrive: '16:30', carrier: 'Korean Air', flightNumber: 'KE901' }],
    },
  ],
}

/**
 * Mock 장소 데이터 (대폭 확장)
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
      description: '도쿄에서 가장 오래된 사원으로 전통 문화를 느낄 수 있는 곳',
      tags: ['culture', 'history', 'photo'],
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
      description: '츠키지 시장의 최고급 스시 맛집',
      tags: ['food', 'sushi', 'breakfast'],
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
      description: '634m 높이의 전망대에서 도쿄 전경 감상',
      tags: ['landmark', 'view', 'photo'],
    },
    {
      id: 'tokyo-4',
      name: '시부야 크로싱',
      category: 'attraction',
      rating: 4.4,
      reviewCount: 9234,
      address: 'Shibuya City, Tokyo',
      openHours: '24시간',
      position: { lat: 35.6595, lng: 139.7004 },
      description: '세계에서 가장 붐비는 횡단보도',
      tags: ['landmark', 'photo', 'shopping'],
    },
    {
      id: 'tokyo-5',
      name: '이치란 라멘 신주쿠',
      category: 'restaurant',
      rating: 4.5,
      reviewCount: 7823,
      address: 'Shinjuku City, Tokyo',
      openHours: '24시간',
      position: { lat: 35.6926, lng: 139.7006 },
      description: '개인 부스에서 즐기는 진한 돈코츠 라멘',
      tags: ['food', 'ramen', 'lunch'],
    },
    {
      id: 'tokyo-6',
      name: '메이지 신궁',
      category: 'attraction',
      rating: 4.6,
      reviewCount: 11234,
      address: '1-1 Yoyogi-Kamizono-cho, Shibuya City, Tokyo',
      openHours: '06:00 - 18:00',
      position: { lat: 35.6764, lng: 139.6993 },
      description: '도심 속 평화로운 신사',
      tags: ['culture', 'nature', 'history'],
    },
    {
      id: 'tokyo-7',
      name: '우에노 공원',
      category: 'nature',
      rating: 4.5,
      reviewCount: 8765,
      address: 'Ueno Park, Taito City, Tokyo',
      openHours: '05:00 - 23:00',
      position: { lat: 35.7151, lng: 139.7737 },
      description: '벚꽃 명소이자 박물관이 밀집한 문화 공간',
      tags: ['nature', 'park', 'culture'],
    },
    {
      id: 'tokyo-8',
      name: '긴자 텐동 야쿠모',
      category: 'restaurant',
      rating: 4.6,
      reviewCount: 5432,
      address: 'Ginza, Chuo City, Tokyo',
      openHours: '11:00 - 21:00',
      position: { lat: 35.6718, lng: 139.7649 },
      description: '미슐랭 추천 텐동 맛집',
      tags: ['food', 'tempura', 'lunch'],
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
      description: '오사카를 대표하는 역사적 성곽',
      tags: ['history', 'landmark', 'photo'],
    },
    {
      id: 'osaka-2',
      name: '이치란 라멘 도톤보리',
      category: 'restaurant',
      rating: 4.5,
      reviewCount: 7654,
      address: 'Dotonbori, Chuo Ward, Osaka',
      openHours: '24시간',
      position: { lat: 34.6686, lng: 135.5021 },
      description: '개인 부스의 라멘 전문점',
      tags: ['food', 'ramen', 'dinner'],
    },
    {
      id: 'osaka-3',
      name: '도톤보리',
      category: 'attraction',
      rating: 4.6,
      reviewCount: 13456,
      address: 'Dotonbori, Chuo Ward, Osaka',
      openHours: '24시간',
      position: { lat: 34.6687, lng: 135.5017 },
      description: '오사카 최고의 번화가와 먹거리 거리',
      tags: ['shopping', 'food', 'nightlife'],
    },
    {
      id: 'osaka-4',
      name: '쿠로몬 시장',
      category: 'experience',
      rating: 4.4,
      reviewCount: 6789,
      address: 'Kuromon Market, Chuo Ward, Osaka',
      openHours: '09:00 - 18:00',
      position: { lat: 34.6656, lng: 135.5072 },
      description: '오사카의 부엌, 신선한 해산물과 거리 음식',
      tags: ['food', 'market', 'shopping'],
    },
    {
      id: 'osaka-5',
      name: '우메다 스카이 빌딩',
      category: 'attraction',
      rating: 4.5,
      reviewCount: 5678,
      address: 'Umeda, Kita Ward, Osaka',
      openHours: '10:00 - 22:00',
      position: { lat: 34.7055, lng: 135.4903 },
      description: '173m 높이의 공중 정원 전망대',
      tags: ['view', 'landmark', 'photo'],
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
      description: 'UNESCO 세계자연유산, 일출 명소',
      tags: ['nature', 'sunrise', 'hiking'],
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
      description: '제주 흑돼지 구이 전문 거리',
      tags: ['food', 'pork', 'dinner'],
    },
    {
      id: 'jeju-3',
      name: '한라산',
      category: 'nature',
      rating: 4.7,
      reviewCount: 6789,
      address: '제주특별자치도 제주시',
      openHours: '05:00 - 13:00 (입산)',
      position: { lat: 33.3617, lng: 126.5292 },
      description: '한국 최고봉, 등산 명소',
      tags: ['nature', 'hiking', 'mountain'],
    },
    {
      id: 'jeju-4',
      name: '제주 민속촌',
      category: 'attraction',
      rating: 4.2,
      reviewCount: 2345,
      address: '제주특별자치도 서귀포시 표선면',
      openHours: '08:30 - 18:00',
      position: { lat: 33.3189, lng: 126.7969 },
      description: '제주 전통 문화 체험',
      tags: ['culture', 'history', 'experience'],
    },
    {
      id: 'jeju-5',
      name: '섭지코지',
      category: 'nature',
      rating: 4.5,
      reviewCount: 4567,
      address: '제주특별자치도 서귀포시 성산읍',
      openHours: '24시간',
      position: { lat: 33.4244, lng: 126.9302 },
      description: '해안 절경과 유채꽃 명소',
      tags: ['nature', 'photo', 'ocean'],
    },
  ],

  busan: [
    {
      id: 'busan-1',
      name: '해운대 해수욕장',
      category: 'nature',
      rating: 4.5,
      reviewCount: 8765,
      address: '부산광역시 해운대구',
      openHours: '24시간',
      position: { lat: 35.1587, lng: 129.1604 },
      description: '한국 최고의 해변 리조트',
      tags: ['beach', 'ocean', 'summer'],
    },
    {
      id: 'busan-2',
      name: '자갈치 시장',
      category: 'experience',
      rating: 4.3,
      reviewCount: 5432,
      address: '부산광역시 중구 남포동',
      openHours: '05:00 - 22:00',
      position: { lat: 35.0965, lng: 129.0306 },
      description: '한국 최대 수산시장',
      tags: ['food', 'market', 'seafood'],
    },
    {
      id: 'busan-3',
      name: '감천 문화마을',
      category: 'attraction',
      rating: 4.6,
      reviewCount: 6789,
      address: '부산광역시 사하구 감천동',
      openHours: '09:00 - 18:00',
      position: { lat: 35.0976, lng: 129.0104 },
      description: '한국의 산토리니, 예술 마을',
      tags: ['art', 'photo', 'culture'],
    },
  ],

  fukuoka: [
    {
      id: 'fukuoka-1',
      name: '후쿠오카 타워',
      category: 'attraction',
      rating: 4.4,
      reviewCount: 3456,
      address: 'Fukuoka Tower, Fukuoka',
      openHours: '09:30 - 22:00',
      position: { lat: 33.5937, lng: 130.3559 },
      description: '234m 높이의 전망대',
      tags: ['view', 'landmark', 'photo'],
    },
    {
      id: 'fukuoka-2',
      name: '하카타 라멘 거리',
      category: 'restaurant',
      rating: 4.5,
      reviewCount: 5678,
      address: 'Hakata, Fukuoka',
      openHours: '11:00 - 23:00',
      position: { lat: 33.5904, lng: 130.4197 },
      description: '돈코츠 라멘의 본고장',
      tags: ['food', 'ramen', 'dinner'],
    },
  ],

  paris: [
    {
      id: 'paris-1',
      name: '에펠탑',
      category: 'attraction',
      rating: 4.7,
      reviewCount: 25678,
      address: 'Champ de Mars, Paris',
      openHours: '09:00 - 00:45',
      position: { lat: 48.8584, lng: 2.2945 },
      description: '파리의 상징',
      tags: ['landmark', 'photo', 'view'],
    },
    {
      id: 'paris-2',
      name: '루브르 박물관',
      category: 'attraction',
      rating: 4.8,
      reviewCount: 34567,
      address: 'Rue de Rivoli, Paris',
      openHours: '09:00 - 18:00',
      position: { lat: 48.8606, lng: 2.3376 },
      description: '세계 최대 박물관',
      tags: ['art', 'culture', 'history'],
    },
    {
      id: 'paris-3',
      name: '르 줄 베른',
      category: 'restaurant',
      rating: 4.6,
      reviewCount: 4567,
      address: 'Eiffel Tower, Paris',
      openHours: '12:00 - 14:00, 19:00 - 21:00',
      position: { lat: 48.8583, lng: 2.2945 },
      description: '에펠탑 내 미슐랭 레스토랑',
      tags: ['food', 'fine-dining', 'view'],
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
  await new Promise((resolve) => setTimeout(resolve, 500)) // 네트워크 시뮬레이션

  const fromCity = normalizeCity(options.from)
  const toCity = normalizeCity(options.to)

  // 양방향 검색 지원
  let key = `${fromCity}-${toCity}`
  let results = mockTransportData[key]

  if (!results) {
    // 역방향 검색
    key = `${toCity}-${fromCity}`
    results = mockTransportData[key]

    if (results) {
      // 출발/도착 반전
      results = results.map(option => ({
        ...option,
        segments: option.segments.map(seg => ({
          ...seg,
          from: seg.to,
          to: seg.from,
        })).reverse(),
      }))
    }
  }

  if (!results || results.length === 0) {
    // 기본 데이터 생성
    results = [
      {
        mode: 'plane',
        carrier: 'Generic Airline',
        totalMinutes: 180,
        totalCost: 250000,
        transfers: 0,
        segments: [{
          from: options.from,
          to: options.to,
          depart: '09:00',
          arrive: '12:00',
          carrier: 'Generic Airline',
        }],
      },
    ]
  }

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
  await new Promise((resolve) => setTimeout(resolve, 300))

  const key = normalizeCity(options.destination)
  let results = mockPlacesData[key] || []

  if (options.category) {
    results = results.filter((p) => p.category === options.category)
  }

  setCache(cacheKey, results)
  return results
}
