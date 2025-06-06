// server/src/tasks/generateReleaseStats.ts
import path from 'path'
import { fetchAllReleases } from '../services/releaseService/fetcher'
import { toReleaseRecords, computeStatsByUnit } from '../services/releaseService/analyzer'
import { writeReleaseRecordsCSV, writeStatsCSV } from '../services/releaseService/writer'
import { parseISO, getDay } from 'date-fns'

async function main() {
  const owner = 'daangn'
  const repos = ['stackflow', 'seed-design']
  const outDir = path.resolve(__dirname, '../../data/releases_output')

  // 1) Task1: 전체 릴리즈 가져와서 ReleaseRecord[] 생성
  let allRecords = [] as ReturnType<typeof toReleaseRecords>
  for (const repo of repos) {
    console.log(`🔍 [${repo}] 릴리즈 데이터 가져오는 중...`)
    const rawReleases = await fetchAllReleases(owner, repo)
    console.log(`✅ [${repo}] 릴리즈 ${rawReleases.length}개 로드 완료`)
    const records = toReleaseRecords(rawReleases, repo)
    allRecords.push(...records)
  }

  // 2) Task1: 전체 릴리즈 CSV 생성
  //    (원시 데이터에 추가 변경 없이, Task1용 CSV만 필요하다면 주석 처리하기)
  await writeReleaseRecordsCSV(allRecords, outDir)
  console.log('✅ Task1: release_details.csv 생성 완료')

  // 3) Task1: 전체 기준 연·주·일 통계 생성 (기존 방식)
  //const yearlyStats = computeStatsByUnit(allRecords, { unit: 'yearly' })
  //const weeklyStats = computeStatsByUnit(allRecords, { unit: 'weekly' })
  //const dailyStats = computeStatsByUnit(allRecords, { unit: 'daily' })

  //await writeStatsCSV(yearlyStats, 'yearly', outDir)
  //await writeStatsCSV(weeklyStats, 'weekly', outDir)
  //await writeStatsCSV(dailyStats, 'daily', outDir)
  //console.log('✅ Task1: 전체 릴리즈 통계 CSV 생성 완료')

  // ─────────────────────────────────────────┐
  // │   아래부터가 “Task2: 주말 제외 통계” 부분  │
  // └─────────────────────────────────────────┘

  // 4) “주말 제외” 필터 함수 정의
  //   getDay(parseISO(published_at)) === 0이면 Sunday, 6이면 Saturday
  const isWeekday = (r: (typeof allRecords)[0]) => {
    const dayIndex = getDay(parseISO(r.published_at))
    return dayIndex !== 0 && dayIndex !== 6
  }

  // 5) 주말 제외된 상태로 연·주·일 통계 계산
  //    computeStatsByUnit 호출 시 { unit, filterFn: isWeekday } 옵션을 전달
  const yearlyWeekdayStats = computeStatsByUnit(allRecords, {
    unit: 'yearly',
    filterFn: isWeekday
  })

  const weeklyWeekdayStats = computeStatsByUnit(allRecords, {
    unit: 'weekly',
    filterFn: isWeekday
  })

  const dailyWeekdayStats = computeStatsByUnit(allRecords, {
    unit: 'daily',
    filterFn: isWeekday
  })

  // 6) 주말 제외된 통계 CSV 생성 (파일명에 “_weekday”를 붙여 구분)
  await writeStatsCSV(yearlyWeekdayStats, 'yearly_weekday', outDir)
  await writeStatsCSV(weeklyWeekdayStats, 'weekly_weekday', outDir)
  await writeStatsCSV(dailyWeekdayStats, 'daily_weekday', outDir)
  console.log('✅ Task2: 주말 제외 통계 CSV 생성 완료')
}

main()
