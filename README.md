# Travel Personalizer

국내외 여행 개인화 웹앱 - React + Vite + TypeScript + Zustand + Google Maps

당신만의 완벽한 여행을 계획하세요! 실시간 대중교통 연계, AI 여행 일정 자동 생성, 맞춤형 여행지 추천을 제공합니다.

## 주요 기능

### 1. 🔍 실시간 교통편 검색
- 버스/기차/항공편 통합 검색
- 최소 비용 / 최단 시간 / 최소 환승 정렬
- 취소표 및 특가 항공권 표시
- 타임라인 형식의 직관적인 경로 시각화

### 2. 🗓️ AI 여행 일정 자동 생성
- 목적지와 여행 일수만 입력하면 자동으로 일정 생성
- 아침/점심/오후/저녁/야간 시간대별 최적 일정 배치
- 이동 경로 최소화 알고리즘 적용
- 각 일정 항목의 지도 시각화 및 경로 표시

### 3. 📍 여행지 추천
- 관광지/맛집/체험/자연 카테고리별 추천
- 평점 및 리뷰 수 기반 정렬
- 상세 정보: 주소, 운영 시간, 웹사이트
- 원클릭 저장 기능

### 4. 🗺️ 지도 통합
- Google Maps API 연동
- 마커 및 폴리라인 경로 표시
- 장소 자동완성 (Places Autocomplete)
- 반응형 지도 인터페이스

### 5. 🌐 다국어 지원
- 한국어 / 영어 지원
- 확장 가능한 i18n 구조

## 스크린샷

### 홈 화면
![홈 화면](./docs/screenshots/home.png)
> 검색 폼과 최근 검색 기록

### 검색 결과
![검색 결과](./docs/screenshots/results.png)
> 교통편 검색 결과 및 정렬/필터

### 여행 일정
![여행 일정](./docs/screenshots/itinerary.png)
> AI 자동 생성 일정 및 지도 시각화

### 여행지 추천
![여행지 추천](./docs/screenshots/places.png)
> 카테고리별 추천 장소 카드

## 기술 스택

- **프레임워크**: React 18 + Vite
- **언어**: TypeScript
- **상태관리**: Zustand
- **라우팅**: React Router DOM
- **스타일링**: Tailwind CSS
- **지도**: Google Maps JavaScript API
- **빌드/배포**: Vite + GitHub Actions → GitHub Pages

## 프로젝트 구조

```
travel-personalizer/
├─ .github/
│  └─ workflows/
│     └─ pages.yml              # GitHub Pages CI/CD
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ app/
│  │  ├─ routes.tsx             # 라우팅 정의
│  │  └─ store.ts               # Zustand 전역 상태
│  ├─ components/
│  │  ├─ SearchForm.tsx         # 검색 폼
│  │  ├─ TransportResults.tsx   # 교통편 결과
│  │  ├─ SortFilterBar.tsx      # 정렬/필터 바
│  │  ├─ ItineraryPlanner.tsx   # 일정 플래너
│  │  ├─ MapView.tsx            # 지도 컴포넌트
│  │  └─ PlaceCards.tsx         # 장소 카드
│  ├─ lib/
│  │  ├─ maps.ts                # Google Maps 유틸
│  │  ├─ api.ts                 # API 인터페이스 (Mock + 실제 연동)
│  │  └─ algorithms.ts          # 정렬/일정 생성 로직
│  ├─ pages/
│  │  ├─ Home.tsx               # 홈 페이지
│  │  ├─ Results.tsx            # 결과 페이지
│  │  └─ Itinerary.tsx          # 일정 페이지
│  ├─ i18n/
│  │  ├─ index.ts               # i18n 초기화
│  │  ├─ ko.ts                  # 한국어
│  │  └─ en.ts                  # 영어
│  ├─ styles/
│  │  └─ index.css              # 글로벌 스타일
│  └─ main.tsx                  # 엔트리 포인트
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
├─ vite.config.ts
└─ README.md
```

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env`로 복사하고 API 키를 입력하세요.

```bash
cp .env.example .env
```

`.env` 파일:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_PROXY_BASE=
VITE_DEFAULT_LOCALE=ko
VITE_APP_NAME=Travel Personalizer
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 5. 빌드 미리보기

```bash
npm run preview
```

## GitHub Pages 배포

### 1. 리포지토리 설정

1. GitHub 리포지토리 생성
2. Settings → Pages로 이동
3. Build and deployment: **GitHub Actions** 선택

### 2. vite.config.ts 확인

`base` 경로가 리포지토리명과 일치하는지 확인:

```ts
export default defineConfig({
  base: '/your-repo-name/',  // GitHub Pages용 base path
})
```

### 3. 배포

`main` 브랜치에 push하면 자동으로 GitHub Actions가 실행되어 배포됩니다.

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

배포 완료 후 `https://your-username.github.io/your-repo-name/`에서 확인할 수 있습니다.

## 환경변수 및 보안

### Google Maps API 키

- **필수**: 지도 및 자동완성 기능에 필요
- **보안**: HTTP referrer 제한 설정 필수
  - Google Cloud Console → APIs & Services → Credentials
  - API Key 제한사항: Website restrictions
  - 허용 도메인 추가: `your-username.github.io/*`

### 교통/취소표/장소 API

현재 구현은 **Mock 데이터**를 사용합니다. 실제 API 연동을 위해서는:

1. **백엔드 프록시 서버** 필요 (보안상 클라이언트에서 직접 호출 금지)
2. `.env`에 `VITE_PROXY_BASE` 설정
3. 프록시 서버 예시 (Cloudflare Workers):

```javascript
// Cloudflare Workers example
export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/api/transport') {
      // 실제 교통 API 호출
      const response = await fetch('https://real-transport-api.com/search', {
        headers: {
          'Authorization': `Bearer ${YOUR_API_KEY}`
        }
      })
      return response
    }

    return new Response('Not Found', { status: 404 })
  }
}
```

### 추천 프록시 솔루션

- **Cloudflare Workers** (무료 티어 사용 가능)
- **Vercel Serverless Functions**
- **AWS Lambda + API Gateway**
- **Google Cloud Functions**

## 실제 API 연동 가이드

### 1. 교통편 API 연동

`src/lib/api.ts`의 `fetchTransport` 함수를 수정:

```typescript
export async function fetchTransport(options: {
  from: string
  to: string
  departAt: string
  modes: string[]
}): Promise<TransportOption[]> {
  const proxyBase = import.meta.env.VITE_PROXY_BASE
  if (!proxyBase) {
    // Mock 데이터 사용
    return mockData
  }

  // 실제 API 호출
  const data = await fetchProxy('/api/transport', options)
  return data
}
```

### 2. 장소 API 연동

Google Places API 또는 다른 POI API 사용:

```typescript
export async function fetchPlaces(options: {
  destination: string
  category?: string
}): Promise<PlaceInfo[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Google Places API 호출
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${options.destination}+${options.category}&key=${apiKey}`
  )

  const data = await response.json()
  // 데이터 변환
  return transformPlacesData(data.results)
}
```

## UX 참고 사항

이 프로젝트의 일정 플래너 UX는 **Triple**의 일정 레이아웃을 참고하여 설계되었습니다:

- [Triple 일정 예시](https://triple.guide/trips/plan/O2KQAebXJvYqQD46lgB7aj36lWk4PM?outlet=int-package&is_public=true)

**주의**: 데이터는 크롤링하지 않으며, UX 패턴만 참고하였습니다. 모든 데이터는 Mock 또는 자체 API를 통해 생성됩니다.

## 접근성 (Accessibility)

- 키보드 네비게이션 지원
- ARIA 라벨 및 역할 명시
- 명도 대비 WCAG 2.1 AA 준수
- 스크린 리더 호환

## 타입 체크 및 린트

```bash
# 타입 체크
npm run typecheck

# ESLint 실행
npm run lint
```

## 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 라이선스

MIT License

## 기여

Pull Request를 환영합니다! 큰 변경사항은 먼저 Issue를 열어 논의해주세요.

## 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/your-username/travel-personalizer/issues)

---

**Built with** ❤️ **using React + Vite + TypeScript + Zustand + Google Maps**
