// client/src/components/Dashboard.tsx
import React, { useMemo } from 'react'
import { useRawData } from '../hooks/useRawData'
import ReleaseTrendByMonth from './charts/ReleaseTrendByMonth'
import ReleaseTypeDistribution from './charts/ReleaseTypeDistribution'

// Dashboard 컴포넌트
export default function Dashboard() {
  // 1) 가장 위에서 훅을 무조건 한 번 호출
  const { data, loading, error } = useRawData()

  // 2) data가 undefined면 빈 배열로 처리 (훅 계산 시 undefined 방지)
  const releases = data ?? []

  // ────────────────
  // 3) 훅 훅 훅… useMemo 훅들을 모두 최상단에 배치 (절대 조건문 안으로 넣지 말 것)
  // ────────────────

  // 3-1) 월별 릴리즈 트렌드 준비
  const monthlyStats = useMemo(() => {
    const counts: Record<string, number> = {}
    releases.forEach(r => {
      const month = r.published_date.slice(0, 7) // "YYYY-MM"
      counts[month] = (counts[month] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, count]) => ({ month, count }))
  }, [releases])

  // 3-2) 릴리즈 타입 분포 준비
  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {}
    releases.forEach(r => {
      const t = r.release_type || 'unknown'
      counts[t] = (counts[t] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [releases])

  // 3-3) 요일별 릴리즈 분포 준비 (예시)
  const weekdayStats = useMemo(() => {
    const counts: Record<string, number> = {}
    releases.forEach(r => {
      const dow = r.weekday_name // "Sunday"… "Saturday"
      counts[dow] = (counts[dow] ?? 0) + 1
    })
    const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return order.map(w => ({ name: w, value: counts[w] ?? 0 }))
  }, [releases])

  // ────────────────
  // 4) 훅 계산이 끝난 뒤, 렌더링 분기
  // ────────────────

  // 로딩 중이면 아직 데이터가 없으니 바로 return
  if (loading) {
    return <div>Loading data...</div>
  }

  // 에러가 발생했다면 에러 메시지 표시
  if (error) {
    return <div>Error: {error}</div>
  }

  // data가 빈 배열이거나 undefined → “데이터 없음” 메시지
  if (!releases || releases.length === 0) {
    return <div>No data available.</div>
  }

  // ────────────────
  // 5) 실제 데이터가 준비됐으니 화면에 차트 출력
  // ────────────────
  return (
    <div style={{ padding: 20 }}>
      <h1>Release Dashboard</h1>

      {/* 월별 릴리즈 트렌드 */}
      <section style={{ marginBottom: 40 }}>
        <h2>월별 릴리즈 트렌드</h2>
        <ReleaseTrendByMonth data={monthlyStats} />
      </section>

      {/* 릴리즈 타입 분포 */}
      <section style={{ marginBottom: 40 }}>
        <h2>릴리즈 타입 분포</h2>
        <ReleaseTypeDistribution data={typeStats} />
      </section>

      {/* 요일별 릴리즈 분포 (예시) */}
      <section style={{ marginBottom: 40 }}>
        <h2>요일별 릴리즈 분포</h2>
        <ReleaseTypeDistribution data={weekdayStats} />
      </section>

      {/* 필요에 따라 추가 차트 섹션을 여기에 더할 수 있습니다 */}
    </div>
  )
}
