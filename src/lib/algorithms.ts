/**
 * 정렬, 필터링, 일정 생성 알고리즘
 */

import type { TransportOption, PlaceInfo, DayItinerary, ItineraryItem } from './api'

/**
 * 비용 기준 정렬
 */
export const sortByCost = (a: TransportOption, b: TransportOption) => {
  return (a.totalCost ?? Infinity) - (b.totalCost ?? Infinity)
}

/**
 * 소요 시간 기준 정렬
 */
export const sortByDuration = (a: TransportOption, b: TransportOption) => {
  return (a.totalMinutes ?? Infinity) - (b.totalMinutes ?? Infinity)
}

/**
 * 환승 횟수 기준 정렬
 */
export const sortByTransfers = (a: TransportOption, b: TransportOption) => {
  return (a.transfers ?? Infinity) - (b.transfers ?? Infinity)
}

/**
 * 평점 기준 정렬
 */
export const sortByRating = (a: PlaceInfo, b: PlaceInfo) => {
  return (b.rating ?? 0) - (a.rating ?? 0)
}

/**
 * 리뷰 수 기준 정렬
 */
export const sortByReviewCount = (a: PlaceInfo, b: PlaceInfo) => {
  return (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
}

/**
 * 두 지점 간 거리 계산 (Haversine formula)
 */
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

interface BuildItineraryOptions {
  destination: string
  days: number
  preferences?: {
    tags?: string[] // 'culture', 'food', 'nature', 'shopping'
    budget?: 'low' | 'medium' | 'high'
    pace?: 'relaxed' | 'moderate' | 'packed'
  }
  places?: PlaceInfo[]
}

/**
 * 여행 일정 자동 생성
 * Triple 스타일의 데이 바이 데이 일정을 생성합니다.
 */
export function buildItinerary(options: BuildItineraryOptions): DayItinerary[] {
  const { destination, days, preferences, places = [] } = options
  const itinerary: DayItinerary[] = []

  // 하루 일정 시간대 슬롯
  const timeSlots = [
    { label: '아침', start: '09:00', end: '11:00' },
    { label: '점심', start: '11:00', end: '13:00' },
    { label: '오후', start: '13:00', end: '17:00' },
    { label: '저녁', start: '17:00', end: '19:00' },
    { label: '야간', start: '19:00', end: '21:00' },
  ]

  // 선호도에 따른 가중치
  const categoryWeights: Record<string, number> = {
    attraction: 1,
    restaurant: 1,
    experience: 1,
    nature: 1,
  }

  if (preferences?.tags) {
    if (preferences.tags.includes('culture')) {
      categoryWeights.attraction = 1.5
    }
    if (preferences.tags.includes('food')) {
      categoryWeights.restaurant = 1.5
    }
    if (preferences.tags.includes('nature')) {
      categoryWeights.nature = 1.5
    }
  }

  // 장소가 없으면 샘플 생성
  let availablePlaces = places.length > 0 ? [...places] : generateSamplePlaces(destination)

  // 가중치 적용 및 정렬
  availablePlaces = availablePlaces
    .map((place) => ({
      ...place,
      weight: (place.rating * (categoryWeights[place.category] || 1) * place.reviewCount) / 1000,
    }))
    .sort((a: any, b: any) => b.weight - a.weight)

  for (let day = 1; day <= days; day++) {
    const dayItems: ItineraryItem[] = []
    let currentPosition: { lat: number; lng: number } | null = null

    timeSlots.forEach((slot, slotIndex) => {
      // 점심과 저녁 시간대에는 레스토랑 우선
      const preferRestaurant = slot.label === '점심' || slot.label === '저녁'

      // 가까운 장소 찾기 (이동 최소화)
      let selectedPlace: PlaceInfo | null = null

      if (preferRestaurant) {
        // 레스토랑 찾기
        const restaurants = availablePlaces.filter((p) => p.category === 'restaurant')
        if (restaurants.length > 0) {
          selectedPlace = restaurants[0]
          availablePlaces = availablePlaces.filter((p) => p.id !== selectedPlace!.id)
        }
      }

      if (!selectedPlace && availablePlaces.length > 0) {
        // 현재 위치에서 가까운 장소 선택
        if (currentPosition) {
          availablePlaces.sort((a, b) => {
            const distA = calculateDistanceKm(
              currentPosition!.lat,
              currentPosition!.lng,
              a.position.lat,
              a.position.lng
            )
            const distB = calculateDistanceKm(
              currentPosition!.lat,
              currentPosition!.lng,
              b.position.lat,
              b.position.lng
            )
            return distA - distB
          })
        }

        selectedPlace = availablePlaces[0]
        availablePlaces = availablePlaces.filter((p) => p.id !== selectedPlace!.id)
      }

      if (selectedPlace) {
        const transportMode = currentPosition
          ? calculateDistanceKm(
              currentPosition.lat,
              currentPosition.lng,
              selectedPlace.position.lat,
              selectedPlace.position.lng
            ) > 5
            ? '지하철/버스'
            : '도보'
          : '이동'

        dayItems.push({
          title: selectedPlace.name,
          placeId: selectedPlace.id,
          startTime: slot.start,
          endTime: slot.end,
          transport: slotIndex > 0 ? transportMode : undefined,
          cost: preferRestaurant ? (preferences?.budget === 'high' ? 50000 : 20000) : 0,
          note: selectedPlace.address,
          position: selectedPlace.position,
        })

        currentPosition = selectedPlace.position
      }
    })

    itinerary.push({ day, items: dayItems })
  }

  return itinerary
}

/**
 * 샘플 장소 생성 (Mock places가 없을 때)
 */
function generateSamplePlaces(destination: string): PlaceInfo[] {
  const destinationLower = destination.toLowerCase()

  // 기본 좌표 (도시별)
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    tokyo: { lat: 35.6762, lng: 139.6503 },
    osaka: { lat: 34.6937, lng: 135.5023 },
    jeju: { lat: 33.4996, lng: 126.5312 },
    paris: { lat: 48.8566, lng: 2.3522 },
  }

  const baseCoord = cityCoords[destinationLower] || cityCoords.tokyo

  return [
    {
      id: `${destination}-sample-1`,
      name: `${destination} 주요 관광지`,
      category: 'attraction',
      rating: 4.5,
      reviewCount: 1000,
      address: `${destination} Center`,
      position: { lat: baseCoord.lat, lng: baseCoord.lng },
    },
    {
      id: `${destination}-sample-2`,
      name: `${destination} 맛집`,
      category: 'restaurant',
      rating: 4.3,
      reviewCount: 800,
      address: `${destination} Food Street`,
      position: { lat: baseCoord.lat + 0.01, lng: baseCoord.lng + 0.01 },
    },
    {
      id: `${destination}-sample-3`,
      name: `${destination} 자연 명소`,
      category: 'nature',
      rating: 4.6,
      reviewCount: 1200,
      address: `${destination} Natural Park`,
      position: { lat: baseCoord.lat - 0.01, lng: baseCoord.lng + 0.02 },
    },
  ]
}

/**
 * 시간 문자열을 분으로 변환
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 분을 시간 문자열로 변환
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
