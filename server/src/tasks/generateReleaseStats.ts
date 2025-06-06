// server/src/tasks/generateReleaseStats.ts
// “fetcher → analyzer → writer” 순서대로 호출하여, 릴리즈 통계 CSV를 생성하는 진입점 스크립트

import path from 'path'
import { fetchAllReleases } from '../services/releaseService/fetcher'
import {
  toReleaseRecords,
  computeYearlyStats,
  //computeMonthlyStats,
  computeWeeklyStats,
  computeDailyStats
} from '../services/releaseService/analyzer'
import { writeReleaseRecordsCSV, writeStatsCSV } from '../services/releaseService/writer'

async function main() {
  try {
    const owner = 'daangn'
    const repos = ['stackflow', 'seed-design']

    // CSV를 저장할 디렉터리 (예: server/data/releases_output)
    const outDir = path.resolve(__dirname, '../../data/releases_output')

    // 모든 레포에서 가져온 ReleaseRecord를 누적 저장할 배열
    let allRecords: ReturnType<typeof toReleaseRecords> = []

    for (const repo of repos) {
      console.log(`🔍 [${repo}] 릴리즈 데이터 가져오는 중...`)
      const rawReleases = await fetchAllReleases(owner, repo)
      console.log(`✅ [${repo}] 릴리즈 ${rawReleases.length}개 로드 완료`)

      const records = toReleaseRecords(rawReleases, repo)
      allRecords.push(...records)
    }

    // 1) 원시 릴리즈 레코드 CSV (release_details.csv) 생성
    await writeReleaseRecordsCSV(allRecords, outDir)

    // 2) 연간/월간/주간/일간 통계 계산
    const yearlyStats = computeYearlyStats(allRecords)
    //const monthlyStats = computeMonthlyStats(allRecords)
    const weeklyStats = computeWeeklyStats(allRecords)
    const dailyStats = computeDailyStats(allRecords)

    // 3) 통계별 CSV 생성
    await writeStatsCSV(yearlyStats, 'yearly', outDir)
    //await writeStatsCSV(monthlyStats, 'monthly', outDir)
    await writeStatsCSV(weeklyStats, 'weekly', outDir)
    await writeStatsCSV(dailyStats, 'daily', outDir)

    console.log('🎉 릴리즈 통계 CSV 생성 완료!')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
