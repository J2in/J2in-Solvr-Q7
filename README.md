# Release Tracker 프로젝트

**“Release Tracker”**는 두 개의 GitHub 저장소(`daangn/stackflow`, `daangn/seed-design`)의 릴리즈 데이터를 수집·가공하여
CSV 통계 파일을 생성하고, 이를 바탕으로 간단한 대시보드를 보여주는 풀스택 애플리케이션입니다.

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [폴더 구조](#폴더-구조)
4. [Change log](#Change-log)
5. [기존 내용](#기술-스택)

---

## 프로젝트 개요

“Release Tracker”는 Daangn(당근) 팀의 두 개 GitHub 저장소(`stackflow`, `seed-design`)에서
릴리즈 데이터를 추출하여 다양한 통계 정보를 생성·시각화하는 툴입니다.

1. **백엔드 (server)**

   - Task1/Task2: GitHub API로부터 릴리즈 목록을 받아 CSV로 저장
   - Task3: Raw 릴리즈 데이터를 보강(Enrich)하여 JSON/CSV 형태로 저장
   - Task4: 시각화용 데이터(API) 제공
   - [Fastify](https://www.fastify.io/), [Drizzle ORM](https://orm.drizzle.team/) 사용

2. **프론트엔드 (client)**
   - 백엔드에서 내려주는 EnrichedRelease 데이터를 기반으로 대시보드를 구성
   - [React](https://reactjs.org/), [Recharts](https://recharts.org/), [Vite](https://vitejs.dev/) 사용

대시보드는 “EnrichedRelease” 데이터를 시각화하여
팀원들이 릴리즈 현황을 빠르게 파악하도록 돕는 인터랙티브 페이지입니다.

주요 차트 및 기능 1. 월별 릴리즈 트렌드 (ReleaseTrendByMonth)
• x축: 연·월(YYYY-MM), y축: 릴리즈 개수
• 릴리즈가 집중된 시기를 한눈에 확인 가능 2. 릴리즈 타입 분포 (ReleaseTypeDistribution)
• 파이 차트 또는 막대 차트로 표현
• major, minor, patch, prerelease 별 비율을 시각화 3. 요일별 릴리즈 분포
• 각 요일(월~일) 별 릴리즈 건수
• 주중 집중도, 주말 릴리즈 여부 확인 4. 추가 확장 가능 차트
• 필요 시 시간대별 분포, 기여자 상위 3명 통계, 릴리즈 간 평균 주기 등 자유롭게 추가

---

## 기술 스택

- **백엔드 (server)**

  - Node.js (v22 이상) & TypeScript
  - Fastify (HTTP 서버)
  - Drizzle ORM + SQLite (간단한 로컬 DB)
  - axios (GitHub REST API 호출)
  - csv-writer / json2csv (CSV 생성)
  - date-fns (날짜·시간 파싱)
  - @octokit/rest (GitHub 메트릭/API 추가 호출)

- **프론트엔드 (client)**
  - React (v18) + TypeScript
  - Vite (개발 빌드)
  - react-router-dom (SPA 라우팅)
  - recharts (데이터 시각화)
  - axios (서버 API 호출)
  - date-fns (날짜 포맷)

---

## 폴더 구조

```
J2in-Solvr-Q7/
├─ server/ # 백엔드 소스
│ ├─ src/
│ │ ├─ config/
│ │ │ └─ env.ts # .env 변수 로딩
│ │ ├─ db/
│ │ │ ├─ migrate.ts # 마이그레이션 스크립트
│ │ │ ├─ schema.ts # Drizzle ORM 스키마 정의
│ │ │ └─ index.ts # DB 초기화
│ │ ├─ services/
│ │ │ └─ … # (추후 확장) 서비스 레이어
│ │ ├─ tasks/
│ │ │ ├─ generateStats.ts # Task1/Task2 통계 생성
│ │ │ ├─ generateRawData.ts # Task3 Raw 데이터 생성
│ │ │ └─ enrichRawData.ts # 세부 Enrichment 로직
│ │ ├─ types/
│ │ │ ├─ github.ts # GH API 원본 타입 정의
│ │ │ ├─ release.ts # EnrichedRelease 타입 정의
│ │ │ └─ stats.ts # 통계용 타입 정의
│ │ ├─ routes/
│ │ │ ├─ releaseRoutes.ts # /api/releases/\* 엔드포인트 정의
│ │ │ └─ index.ts # Fastify 플러그인 등록
│ │ └─ index.ts # 서버 엔트리포인트
│ ├─ package.json
│ └─ tsconfig.json
│
└─ client/ # 프론트엔드 소스
├─ public/
│ └─ index.html
├─ src/
│ ├─ components/
│ │ ├─ Dashboard.tsx
│ │ └─ charts/
│ │ ├─ ReleaseTrendByMonth.tsx
│ │ ├─ ReleaseTypeDistribution.tsx
│ │ └─ …추가 차트 컴포넌트
│ ├─ hooks/
│ │ └─ useRawData.ts # /api/releases/enriched 호출 커스텀 훅
│ ├─ pages/
│ │ └─ HomePage.tsx
│ ├─ routes/
│ │ └─ AppRoutes.tsx # React Router 설정
│ ├─ types/
│ │ └─ release.ts # 클라이언트용 EnrichedRelease 타입
│ ├─ App.tsx
│ └─ main.tsx
├─ package.json
└─ tsconfig.json
```

---

## Change log

모든 변경 내역은 날짜 순으로 기록됩니다.

## [1.0.0] – 2025-06-07

### Added

- **Task 1**:

  - GitHub API(daangn/stackflow, daangn/seed-design)로부터 릴리즈 데이터 수집
  - CSV(`release_statistics_yearly.csv`, `release_statistics_weekly.csv`, `release_statistics_daily.csv`) 생성

- **Task 2**:

  - 주말 제외 옵션을 적용하여 근무일 기준 통계 생성
    - CSV(`release_statistics_yearly_weekdays.csv`, `release_statistics_weekly_weekdays.csv`, `release_statistics_daily_weekdays.csv`) 생성

- **Task 3**:

  - Raw 릴리즈 데이터를 EnrichedRelease 형태로 보강 (릴리즈 노트, Asset, SemVer, 날짜·시간, 메트릭 등)
    - TODO: 릴리즈 노트, contributor등 데이터 활용 방안 고안
  - `release_enriched.csv` 생성 및 `/api/releases/enriched` 엔드포인트 추가

- **Task 4**:

  - React + Recharts 기반 대시보드 구현
    - 월별 릴리즈 트렌드, 릴리즈 타입 분포, 요일별 분포 차트 추가
  - `/api/releases/enriched` 호출 훅(`useRawData`) 구현

- **Task 5**:

  - 클라이언트: 서버 API 호출 후 차트 렌더링
  - `/api/statistics/{yearly,weekly,daily}` 엔드포인트 추가
  - `/api/statistics/` 호출 훅(`useStatistics`) 구현
  - `/api/statistics/{yearly,weekly,daily}`, `/api/releases/enriched` 라우트 최종 검증

---

## 기술 스택

### 공통

- 패키지 매니저: pnpm (workspace 기능 활용)
- 언어: TypeScript
- Node.js 버전: 22.x
- 테스트: Vitest
- 코드 품질: Prettier

### 클라이언트

- 프레임워크: React
- 빌드 도구: Vite
- 라우팅: React Router
- 스타일링: TailwindCSS

### 서버

- 프레임워크: Fastify
- 데이터베이스: SQLite with DirzzleORM

## 설치 및 실행

### 초기 설치

```bash
# 프로젝트 루트 디렉토리에서 실행
pnpm install
```

### 개발 서버 실행

```bash
# 클라이언트 및 서버 동시 실행
pnpm dev

# 클라이언트만 실행
pnpm dev:client

# 서버만 실행
pnpm dev:server
```

### 테스트 실행

```bash
# 클라이언트 테스트
pnpm test:client

# 서버 테스트
pnpm test:server

# 모든 테스트 실행
pnpm test
```

### 빌드

```bash
# 클라이언트 및 서버 빌드
pnpm build
```

## 환경 변수 설정

- 클라이언트: `client/.env` 파일에 설정 (예시는 `client/.env.example` 참조)
- 서버: `server/.env` 파일에 설정 (예시는 `server/.env.example` 참조)

## API 엔드포인트

서버는 다음과 같은 기본 API 엔드포인트를 제공합니다:

- `GET /api/health`: 서버 상태 확인
- `GET /api/users`: 유저 목록 조회
- `GET /api/users/:id`: 특정 유저 조회
- `POST /api/users`: 새 유저 추가
- `PUT /api/users/:id`: 유저 정보 수정
- `DELETE /api/users/:id`: 유저 삭제
