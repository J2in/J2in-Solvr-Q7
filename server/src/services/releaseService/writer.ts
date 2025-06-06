// server/src/services/releaseService/writer.ts
import { createObjectCsvWriter } from 'csv-writer'
import { ReleaseRecord, ReleaseStat } from '../../types/stats'
import fs from 'fs'
import path from 'path'

/**
 * ReleaseRecord[] → release_details.csv 생성
 * @param records ReleaseRecord[]
 * @param outDir  출력 디렉터리 경로 (예: server/data/releases_output)
 */
export async function writeReleaseRecordsCSV(records: ReleaseRecord[], outDir: string) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const csvWriter = createObjectCsvWriter({
    path: path.join(outDir, 'release_details.csv'),
    header: [
      { id: 'repository', title: 'repository' },
      { id: 'id', title: 'id' },
      { id: 'tag_name', title: 'tag_name' },
      { id: 'published_at', title: 'published_at' },
      { id: 'author', title: 'author' },
      { id: 'draft', title: 'draft' },
      { id: 'prerelease', title: 'prerelease' }
    ]
  })

  await csvWriter.writeRecords(records)
  console.log('✅ release_details.csv 생성 완료')
}

/**
 * ReleaseStat[] → release_statistics_<periodName>.csv 생성
 * @param stats      ReleaseStat[]
 * @param periodName "yearly"|"weekly"|"daily"
 * @param outDir     출력 디렉터리 경로
 */
export async function writeStatsCSV(stats: ReleaseStat[], periodName: string, outDir: string) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const fileName = `release_statistics_${periodName}.csv`
  const csvWriter = createObjectCsvWriter({
    path: path.join(outDir, fileName),
    header: [
      { id: 'period', title: 'period' },
      { id: 'count', title: 'count' }
    ]
  })

  await csvWriter.writeRecords(stats)
  console.log(`✅ ${fileName} 생성 완료`)
}
