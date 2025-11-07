/**
 * Google Maps JavaScript API 로더 및 유틸리티
 */

let googleMapsPromise: Promise<typeof google.maps> | null = null

/**
 * Google Maps API를 동적으로 로드
 */
export async function loadGoogleMaps(apiKey: string): Promise<typeof google.maps> {
  if ((window as any).google?.maps) {
    return (window as any).google.maps
  }

  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => {
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps)
      } else {
        reject(new Error('Google Maps failed to load'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })

  return googleMapsPromise
}

/**
 * 지도 초기화
 */
export function initMap(
  container: HTMLElement,
  options: {
    center: google.maps.LatLngLiteral
    zoom: number
  }
): google.maps.Map {
  return new google.maps.Map(container, {
    center: options.center,
    zoom: options.zoom,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  })
}

/**
 * 마커 추가
 */
export function addMarker(
  map: google.maps.Map,
  options: {
    position: google.maps.LatLngLiteral
    title?: string
    label?: string
    icon?: string | google.maps.Icon | google.maps.Symbol
  }
): google.maps.Marker {
  return new google.maps.Marker({
    map,
    position: options.position,
    title: options.title,
    label: options.label,
    icon: options.icon,
  })
}

/**
 * 폴리라인(경로) 그리기
 */
export function drawPolyline(
  map: google.maps.Map,
  path: google.maps.LatLngLiteral[],
  options?: {
    strokeColor?: string
    strokeOpacity?: number
    strokeWeight?: number
  }
): google.maps.Polyline {
  return new google.maps.Polyline({
    map,
    path,
    strokeColor: options?.strokeColor || '#3B82F6',
    strokeOpacity: options?.strokeOpacity || 0.8,
    strokeWeight: options?.strokeWeight || 4,
  })
}

/**
 * 지도 범위를 마커들에 맞게 조정
 */
export function fitBounds(
  map: google.maps.Map,
  positions: google.maps.LatLngLiteral[]
): void {
  if (positions.length === 0) return

  const bounds = new google.maps.LatLngBounds()
  positions.forEach((pos) => bounds.extend(pos))
  map.fitBounds(bounds)
}

/**
 * Places Autocomplete 초기화
 */
export function initAutocomplete(
  input: HTMLInputElement,
  options?: google.maps.places.AutocompleteOptions
): google.maps.places.Autocomplete {
  return new google.maps.places.Autocomplete(input, {
    types: ['(cities)'],
    ...options,
  })
}

/**
 * 두 지점 간 거리 계산 (미터)
 */
export function calculateDistance(
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral
): number {
  const fromLatLng = new google.maps.LatLng(from.lat, from.lng)
  const toLatLng = new google.maps.LatLng(to.lat, to.lng)
  return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng)
}
