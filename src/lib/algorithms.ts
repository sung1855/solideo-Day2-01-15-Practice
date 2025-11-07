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
 * 목적지별 일정 템플릿
 */
const destinationTemplates: Record<string, {
  morningStart: string
  eveningEnd: string
  recommendedActivities: number // 하루 권장 활동 수
  transportation: string
}> = {
  tokyo: {
    morningStart: '08:00',
    eveningEnd: '21:00',
    recommendedActivities: 5,
    transportation: '전철/도보',
  },
  osaka: {
    morningStart: '08:30',
    eveningEnd: '21:30',
    recommendedActivities: 5,
    transportation: '전철/도보',
  },
  jeju: {
    morningStart: '09:00',
    eveningEnd: '19:00',
    recommendedActivities: 4,
    transportation: '렌트카/택시',
  },
  busan: {
    morningStart: '09:00',
    eveningEnd: '20:00',
    recommendedActivities: 4,
    transportation: '전철/도보',
  },
  paris: {
    morningStart: '09:00',
    eveningEnd: '22:00',
    recommendedActivities: 5,
    transportation: '메트로/도보',
  },
  fukuoka: {
    morningStart: '09:00',
    eveningEnd: '21:00',
    recommendedActivities: 4,
    transportation: '전철/도보',
  },
}

/**
 * 여행 일정 자동 생성 (개선된 버전)
 * 목적지별로 세분화된 일정을 생성합니다.
 */
export function buildItinerary(options: BuildItineraryOptions): DayItinerary[] {
  const { destination, days, preferences, places = [] } = options
  const itinerary: DayItinerary[] = []

  // 목적지 정규화
  const normalizedDest = destination.toLowerCase().trim()
  const template = destinationTemplates[normalizedDest] || {
    morningStart: '09:00',
    eveningEnd: '20:00',
    recommendedActivities: 4,
    transportation: '대중교통/도보',
  }

  // 페이스에 따른 활동 수 조정
  let activitiesPerDay = template.recommendedActivities
  if (preferences?.pace === 'relaxed') {
    activitiesPerDay = Math.max(3, activitiesPerDay - 1)
  } else if (preferences?.pace === 'packed') {
    activitiesPerDay = activitiesPerDay + 1
  }

  // 선호도에 따른 가중치
  const categoryWeights: Record<string, number> = {
    attraction: 1,
    restaurant: 1,
    experience: 1,
    nature: 1,
  }

  if (preferences?.tags) {
    if (preferences.tags.includes('culture') || preferences.tags.includes('history')) {
      categoryWeights.attraction = 1.5
    }
    if (preferences.tags.includes('food')) {
      categoryWeights.restaurant = 1.5
    }
    if (preferences.tags.includes('nature')) {
      categoryWeights.nature = 1.5
    }
    if (preferences.tags.includes('shopping')) {
      categoryWeights.experience = 1.2
    }
  }

  // 장소 가중치 계산 및 정렬
  let availablePlaces = places.length > 0 ? [...places] : generateSamplePlaces(destination)
  if (availablePlaces.length === 0) {
    console.warn(`No places found for ${destination}`)
    return []
  }

  availablePlaces = availablePlaces
    .map((place) => ({
      ...place,
      weight: (place.rating * (categoryWeights[place.category] || 1) * place.reviewCount) / 1000,
    }))
    .sort((a: any, b: any) => b.weight - a.weight)

  for (let day = 1; day <= days; day++) {
    const dayItems: ItineraryItem[] = []
    let currentTime = timeToMinutes(template.morningStart)
    let currentPosition: { lat: number; lng: number } | null = null

    for (let activityIndex = 0; activityIndex < activitiesPerDay && availablePlaces.length > 0; activityIndex++) {
      // 시간대에 따른 활동 타입 결정
      const hour = Math.floor(currentTime / 60)
      let preferCategory: string | null = null

      if (hour >= 7 && hour < 9) {
        preferCategory = 'restaurant' // 아침
      } else if (hour >= 12 && hour < 14) {
        preferCategory = 'restaurant' // 점심
      } else if (hour >= 18 && hour < 21) {
        preferCategory = 'restaurant' // 저녁
      }

      // 장소 선택
      let selectedPlace: PlaceInfo | null = null
      let selectedIndex = -1

      if (preferCategory === 'restaurant') {
        // 레스토랑 우선 찾기
        const restaurants = availablePlaces.filter((p) => p.category === 'restaurant')
        if (restaurants.length > 0) {
          // 현재 위치에서 가까운 레스토랑 선택
          if (currentPosition) {
            restaurants.sort((a, b) => {
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
          selectedPlace = restaurants[0]
          selectedIndex = availablePlaces.findIndex((p) => p.id === selectedPlace!.id)
        }
      }

      if (!selectedPlace) {
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
            // 거리와 가중치 모두 고려
            return (distA / (a as any).weight) - (distB / (b as any).weight)
          })
        }
        selectedPlace = availablePlaces[0]
        selectedIndex = 0
      }

      if (selectedPlace && selectedIndex >= 0) {
        // 활동 시간 계산
        let duration = 60 // 기본 1시간

        if (selectedPlace.category === 'restaurant') {
          duration = 90 // 식사 1.5시간
        } else if (selectedPlace.category === 'attraction') {
          duration = 120 // 관광 2시간
        } else if (selectedPlace.category === 'nature') {
          duration = 150 // 자연 2.5시간
        } else if (selectedPlace.category === 'experience') {
          duration = 120 // 체험 2시간
        }

        // 이동 시간 계산
        let travelTime = 0
        let transportMode = '도보'
        if (currentPosition) {
          const distance = calculateDistanceKm(
            currentPosition.lat,
            currentPosition.lng,
            selectedPlace.position.lat,
            selectedPlace.position.lng
          )

          if (distance > 10) {
            travelTime = Math.ceil(distance / 30 * 60) // 시속 30km로 계산
            transportMode = template.transportation.split('/')[0]
          } else if (distance > 2) {
            travelTime = Math.ceil(distance / 15 * 60) // 시속 15km
            transportMode = template.transportation.split('/')[1] || '도보'
          } else {
            travelTime = Math.ceil(distance * 12) // 도보 시속 5km
            transportMode = '도보'
          }
        }

        // 이동 시간 추가
        currentTime += travelTime

        const startTime = minutesToTime(currentTime)
        currentTime += duration
        const endTime = minutesToTime(currentTime)

        // 비용 계산
        let cost = 0
        if (selectedPlace.category === 'restaurant') {
          if (preferences?.budget === 'high') {
            cost = 50000
          } else if (preferences?.budget === 'low') {
            cost = 15000
          } else {
            cost = 25000
          }
        } else if (selectedPlace.category === 'attraction') {
          cost = selectedPlace.name.includes('박물관') || selectedPlace.name.includes('타워') ? 15000 : 5000
        }

        dayItems.push({
          title: selectedPlace.name,
          placeId: selectedPlace.id,
          startTime,
          endTime,
          transport: activityIndex > 0 ? transportMode : undefined,
          cost: cost > 0 ? cost : undefined,
          note: (selectedPlace as any).description || selectedPlace.address,
          position: selectedPlace.position,
        })

        currentPosition = selectedPlace.position
        availablePlaces.splice(selectedIndex, 1)

        // 저녁 시간 초과 시 중단
        if (currentTime >= timeToMinutes(template.eveningEnd)) {
          break
        }
      }
    }

    if (dayItems.length > 0) {
      itinerary.push({ day, items: dayItems })
    }
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
