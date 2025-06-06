// server/src/services/releaseService/analyzer.ts
// 릴리즈 원시 데이터(Raw)를 “기간별 집계” 데이터로 변환하는 로직

import { GitHubReleaseRaw } from '../../types/github'
import { ReleaseRecord, ReleaseStat } from '../../types/stats'
import { parseISO, format, getYear, getWeek, getDay } from 'date-fns'

/**
 * GitHubReleaseRaw 배열을 ReleaseRecord 배열로 변환
 * @param releases  GitHub API로부터 받아온 원시 릴리즈 목록
 * @param repoName  해당 릴리즈이 속한 레포 이름 (예: "stackflow")
 */
export function toReleaseRecords(releases: GitHubReleaseRaw[], repoName: string): ReleaseRecord[] {
  return releases
    .filter(r => r.published_at !== null)
    .map(r => ({
      repository: repoName,
      id: r.id,
      tag_name: r.tag_name,
      published_at: r.published_at,
      author: r.author.login,
      draft: r.draft,
      prerelease: r.prerelease
    }))
}

/**
 * 연간 통계 계산 (period = "2024")
 * @param records ReleaseRecord 배열
 */
export function computeYearlyStats(records: ReleaseRecord[]): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const year = getYear(parseISO(r.published_at)).toString()
    map[year] = (map[year] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}

/**
 * 월간 통계 계산 (period = "2024-06")
 * @param records ReleaseRecord 배열
 */
export function computeMonthlyStats(records: ReleaseRecord[]): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const date = parseISO(r.published_at)
    const ym = format(date, 'yyyy-MM') // 예: "2024-06"
    map[ym] = (map[ym] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}

/**
 * 주간 통계 계산 (period = "2024-W23")
 * - ISO week: 월요일을 주 시작일(weekStartsOn: 1)로 간주
 * @param records ReleaseRecord 배열
 */
export function computeWeeklyStats(records: ReleaseRecord[]): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const date = parseISO(r.published_at)
    const year = getYear(date)
    const week = getWeek(date, { weekStartsOn: 1 }) // 월요일이 한 주의 시작
    const key = `${year}-W${week.toString().padStart(2, '0')}` // 예: "2024-W23"
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}

/**
 * 일간 통계 계산 (period = "2024-06-15")
 * @param records ReleaseRecord 배열
 */
export function computeDailyStats(records: ReleaseRecord[]): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const date = parseISO(r.published_at)
    const day = format(date, 'yyyy-MM-dd') // 예: "2024-06-15"
    map[day] = (map[day] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}

/**
 * 시간대별 집계: period = "2024-06-15 14" (YYYY-MM-DD HH)
 * - 24시간 단위로 그룹화
 */
export function computeHourlyStats(records: ReleaseRecord[]): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const date = parseISO(r.published_at)
    const hourStr = format(date, 'yyyy-MM-dd HH') // 예: "2024-06-15 14"
    map[hourStr] = (map[hourStr] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}

/**
 * 단위(unit)에 따라 적절한 compute 함수를 호출하여 ReleaseStat[] 반환
 * @param records ReleaseRecord[]
 * @param options {
 *   unit: "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "custom",
 *   dateFormat?: string,                // unit==="custom"일 때 사용하는 포맷 문자열
 *   formatter?: (date: Date) => string, // unit==="custom"일 때 사용하는 함수
 *   filterFn?: (record: ReleaseRecord) => boolean // 레코드를 걸러낼 필터 함수
 * }
 */
export function computeStatsByUnit(
  records: ReleaseRecord[],
  options: {
    unit: 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'custom'
    dateFormat?: string
    formatter?: (date: Date) => string
    filterFn?: (record: ReleaseRecord) => boolean
  }
): ReleaseStat[] {
  const { unit, dateFormat, formatter, filterFn } = options
  const filteredRecords = filterFn ? records.filter(r => filterFn(r)) : records

  switch (unit) {
    case 'yearly':
      return computeYearlyStats(filteredRecords)
    case 'monthly':
      return computeMonthlyStats(filteredRecords)
    case 'weekly':
      return computeWeeklyStats(filteredRecords)
    case 'daily':
      return computeDailyStats(filteredRecords)
    case 'hourly':
      return computeHourlyStats(filteredRecords)
    case 'custom':
      if (formatter) {
        return computeCustomByFormatter(filteredRecords, formatter)
      } else if (dateFormat) {
        return computeCustomByDateFormat(filteredRecords, dateFormat)
      } else {
        throw new Error('For custom unit, either formatter or dateFormat must be provided')
      }
    default:
      return []
  }
}

/**
 * Custom 통계 계산 (period = format(date, dateFormat))
 * @param records ReleaseRecord[]
 * @param dateFormat string (예: "yyyy-MM-dd")
 */
function computeCustomByDateFormat(records: ReleaseRecord[], dateFormat: string): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const date = parseISO(r.published_at)
    const key = format(date, dateFormat)
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}

/**
 * Custom 통계 계산 (period = formatter(date))
 * @param records ReleaseRecord[]
 * @param formatter (date: Date) => string
 */
function computeCustomByFormatter(
  records: ReleaseRecord[],
  formatter: (date: Date) => string
): ReleaseStat[] {
  const map: Record<string, number> = {}
  for (const r of records) {
    const date = parseISO(r.published_at)
    const key = formatter(date)
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map).map(([period, count]) => ({ period, count }))
}
