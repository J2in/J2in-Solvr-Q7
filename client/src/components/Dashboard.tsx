// client/src/components/Dashboard.tsx
import { useMemo } from 'react'
import { useRawData } from '../hooks/useRawData'
import MonthlyChart from './charts/ReleaseTrendByMonth'
import ReleaseTypeDistribution from './charts/ReleaseTypeDistribution'

import { useStatistics } from '../hooks/useStatistics'
import YearlyChart from './charts/YearlyChart'
import WeeklyChart from './charts/WeeklyChart'
import DailyChart from './charts/DailyChart'

export default function Dashboard() {
  // 1) 가장 위에서 훅을 무조건 한 번 호출
  const { data, loading, error } = useRawData()

  // 2) 연·주·일 통계 훅 호출
  const { data: yearlyData, loading: yearlyLoading, error: yearlyError } = useStatistics('yearly')
  const { data: weeklyData, loading: weeklyLoading, error: weeklyError } = useStatistics('weekly')
  const { data: dailyData, loading: dailyLoading, error: dailyError } = useStatistics('daily')

  // 3) raw 데이터가 undefined면 빈 배열로 처리
  const releases = data ?? []

  // ──────────────────────────────────────
  // 4) useMemo 훅들을 최상단에 배치
  // ──────────────────────────────────────
  // 4-1) 월별 릴리즈 트렌드 준비
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

  // 4-2) 릴리즈 타입 분포 준비
  const typeStats = useMemo<{ name: string; value: number }[]>(() => {
    const counts: Record<string, number> = {}
    releases.forEach(r => {
      const t = r.release_type || 'unknown'
      counts[t] = (counts[t] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [releases])

  // 4-3) 요일별 릴리즈 분포 준비
  const weekdayStats = useMemo<{ name: string; value: number }[]>(() => {
    const counts: Record<string, number> = {}
    releases.forEach(r => {
      const dow = r.weekday_name // "Sunday"… "Saturday"
      counts[dow] = (counts[dow] ?? 0) + 1
    })
    const order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return order.map(w => ({ name: w, value: counts[w] ?? 0 }))
  }, [releases])

  // 1) 연도별 통계
  const yearlyStats = useMemo<{ period: string; count: number }[]>(() => {
    if (!yearlyData) return []
    return [...yearlyData]
      .map(r => ({ period: r.period, count: r.count }))
      .sort((a, b) => (a.period < b.period ? -1 : 1)) // 문자열 비교 오름차순
  }, [yearlyData])

  // 2) 주간별 통계
  const weeklyStats = useMemo<{ period: string; count: number }[]>(() => {
    if (!weeklyData) return []
    return [...weeklyData]
      .map(r => ({ period: r.period, count: r.count }))
      .sort((a, b) => (a.period < b.period ? -1 : 1)) // “2024-W01” < “2024-W02” < … < “2025-W01”
  }, [weeklyData])

  // 3) 일간별 통계
  const dailyStats = useMemo<{ period: string; count: number }[]>(() => {
    if (!dailyData) return []
    return [...dailyData]
      .map(r => ({ period: r.period, count: r.count }))
      .sort((a, b) => (a.period < b.period ? -1 : 1)) // “2023-01-01” < “2023-01-02” < …
  }, [dailyData])

  // ──────────────────────────────────────
  // 5) 렌더링 분기: 로딩 / 에러 / 데이터 없음
  // ──────────────────────────────────────

  // raw 데이터 로딩 중
  if (loading) {
    return <div>Loading release data…</div>
  }

  // raw 데이터 에러
  if (error) {
    return <div>Error loading raw data: {error}</div>
  }

  // raw 데이터가 비어 있으면
  if (!releases || releases.length === 0) {
    return <div>No release data available.</div>
  }

  // 통계 훅 중 하나라도 로딩 중
  if (yearlyLoading || weeklyLoading || dailyLoading) {
    return <div>Loading statistics…</div>
  }

  // 통계 훅 중 에러가 발생했으면
  if (yearlyError || weeklyError || dailyError) {
    return (
      <div style={{ color: 'red' }}>
        {yearlyError && <p>Yearly stats error: {yearlyError}</p>}
        {weeklyError && <p>Weekly stats error: {weeklyError}</p>}
        {dailyError && <p>Daily stats error: {dailyError}</p>}
      </div>
    )
  }

  // ──────────────────────────────────────
  // 6) 실제 데이터가 준비됐으니 화면에 차트 출력
  // ──────────────────────────────────────
  return (
    <div style={{ padding: 20 }}>
      <h1>Release Dashboard</h1>

      {/* 연도별 통계 차트 */}
      <section style={{ marginBottom: 40 }}>
        <h2>연도별 릴리즈 통계</h2>
        {yearlyStats && <YearlyChart data={yearlyStats} />}
      </section>

      {/* 월별 릴리즈 트렌드 */}
      <section style={{ marginBottom: 40 }}>
        <h2>월별 릴리즈 통계</h2>
        <MonthlyChart data={monthlyStats} />{' '}
        {/* 타 기간별 데이터들과 비교해서 monthly는 enrich관련 api에서 결과값을 받아오기 때문에 파일 명이 다름.
          hooks의 useRawData와 useStatistics를 하나로 리팩토링해도 됨. 그러나 지금은 시간 부족으로 불가능하여 주석만 남겨둠.
        */}
      </section>

      {/* 주간별 통계 차트 */}
      <section style={{ marginBottom: 40 }}>
        <h2>주간별 릴리즈 통계</h2>
        {weeklyStats && <WeeklyChart data={weeklyStats} />}
      </section>

      {/* 일간별 통계 차트 */}
      <section style={{ marginBottom: 40 }}>
        <h2>일간별 릴리즈 통계</h2>
        {dailyStats && <DailyChart data={dailyStats} />}
      </section>

      {/* 릴리즈 타입 분포 */}
      <section style={{ marginBottom: 40 }}>
        <h2>릴리즈 타입 분포</h2>
        <ReleaseTypeDistribution data={typeStats} />
      </section>

      {/* 요일별 릴리즈 분포 */}
      <section style={{ marginBottom: 40 }}>
        <h2>요일별 릴리즈 분포</h2>
        <ReleaseTypeDistribution data={weekdayStats} />
      </section>
    </div>
  )
}
