/**
 * 지도 컴포넌트
 */

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps, initMap, addMarker, drawPolyline, fitBounds } from '../lib/maps'

interface Waypoint {
  position: { lat: number; lng: number }
  title?: string
  label?: string
}

interface MapViewProps {
  waypoints: Waypoint[]
  mode?: 'polyline' | 'pins'
  className?: string
  onMarkerClick?: (waypoint: Waypoint, index: number) => void
}

export default function MapView({
  waypoints,
  mode = 'pins',
  className = '',
  onMarkerClick,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API 키가 설정되지 않았습니다.')
      setLoading(false)
      return
    }

    if (!mapContainerRef.current) return

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!mapContainerRef.current) return

        // 지도 초기화
        const center = waypoints[0]?.position || { lat: 37.5665, lng: 126.978 }
        const map = initMap(mapContainerRef.current, {
          center,
          zoom: 12,
        })

        // 마커 추가
        const markers: google.maps.Marker[] = []
        waypoints.forEach((waypoint, index) => {
          const marker = addMarker(map, {
            position: waypoint.position,
            title: waypoint.title,
            label: waypoint.label || String(index + 1),
          })

          if (onMarkerClick) {
            marker.addListener('click', () => {
              onMarkerClick(waypoint, index)
            })
          }

          markers.push(marker)
        })

        // 폴리라인 모드
        if (mode === 'polyline' && waypoints.length > 1) {
          const path = waypoints.map((w) => w.position)
          drawPolyline(map, path)
        }

        // 지도 범위 조정
        if (waypoints.length > 0) {
          fitBounds(
            map,
            waypoints.map((w) => w.position)
          )
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err)
        setError('지도를 로드할 수 없습니다.')
        setLoading(false)
      })
  }, [waypoints, mode, onMarkerClick])

  if (error) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight: '400px' }}
      >
        <div className="text-center text-gray-500">
          <p>{error}</p>
          <p className="text-sm mt-2">.env 파일에 VITE_GOOGLE_MAPS_API_KEY를 설정하세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div
          className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10"
          style={{ minHeight: '400px' }}
        >
          <div className="text-gray-500">지도 로딩 중...</div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
        role="region"
        aria-label="지도"
      />
    </div>
  )
}
