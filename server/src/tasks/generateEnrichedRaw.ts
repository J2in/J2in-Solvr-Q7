// server/src/tasks/generateEnrichedRaw.ts

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import { stringify } from 'csv-stringify'
import {
  format,
  parseISO,
  getYear,
  getMonth,
  getDate,
  getDay,
  getHours,
  differenceInCalendarDays,
  isWeekend
} from 'date-fns'
import { EnrichedRelease } from '../types/enrich'

// 1) 원시 CSV 경로 & 결과 CSV 경로
const RAW_CSV_PATH = path.resolve(__dirname, '../../data/releases_output/release_details.csv')
const ENRICHED_CSV_PATH = path.resolve(__dirname, '../../data/releases_output/release_enriched.csv')

// 2) “사전 처리용” 변수: 직전 릴리즈 날짜를 계산하려면 같은 리포지토리 내 날짜순 정렬이 필요합니다.
//    일단 raw 레코드를 로드할 때 저장해 놓고, 각 레코드가 속한 리포지토리별로 정렬 → prev_release_date 계산
interface RawRow {
  repository: string
  id: string
  tag_name: string
  published_at: string
  author: string
  draft: string
  prerelease: string
}

// 3) CSV 읽어서 Row 배열로 저장
async function readRawCSV(): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    const rows: RawRow[] = []
    fs.createReadStream(RAW_CSV_PATH)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true
        })
      )
      .on('data', (record: RawRow) => {
        rows.push(record)
      })
      .on('end', () => resolve(rows))
      .on('error', err => reject(err))
  })
}

// 4) SemVer 로직: tag_name에서 “1.5.2” 같은 숫자만 골라내기
function parseSemVer(tag: string): {
  major: number | null
  minor: number | null
  patch: number | null
  release_type: 'major' | 'minor' | 'patch' | 'prerelease' | null
} {
  // “@stackflow/react-ui-core@1.3.2” → “1.3.2”
  const semverMatch = tag.match(/(\d+)\.(\d+)\.(\d+)/)
  if (!semverMatch) {
    // prerelease / irregular tag
    if (/rc|alpha|beta|pre/.test(tag.toLowerCase())) {
      return {
        major: null,
        minor: null,
        patch: null,
        release_type: 'prerelease'
      }
    }
    return { major: null, minor: null, patch: null, release_type: null }
  }
  const [_, majorStr, minorStr, patchStr] = semverMatch
  const major = parseInt(majorStr)
  const minor = parseInt(minorStr)
  const patch = parseInt(patchStr)

  // 단순 비교: 다음 자리 중 하나라도 0이 아닌 경우 major/minor/patch
  if (minor === 0 && patch === 0) {
    return { major, minor, patch, release_type: 'major' }
  } else if (patch === 0) {
    return { major, minor, patch, release_type: 'minor' }
  } else {
    return { major, minor, patch, release_type: 'patch' }
  }
}

// 5) “직전 릴리즈” 정보를 채워주기 위해, repo별로 날짜순 정렬
type GroupedByRepo = Record<string, RawRow[]>

// 6) 전체 처리 함수
async function generateEnrichedRaw() {
  const rawRows = await readRawCSV()

  // 6-1) repository별로 그룹핑
  const byRepo: GroupedByRepo = {}
  rawRows.forEach(r => {
    if (!byRepo[r.repository]) byRepo[r.repository] = []
    byRepo[r.repository].push(r)
  })

  // 6-2) 각 그룹별로 published_at 기준 오름차순 정렬
  for (const repo of Object.keys(byRepo)) {
    byRepo[repo].sort((a, b) => {
      const da = new Date(a.published_at).getTime()
      const db = new Date(b.published_at).getTime()
      return da - db
    })
  }

  // 6-3) EnrichedRelease 배열 생성
  const enrichedList: EnrichedRelease[] = []
  for (const repo of Object.keys(byRepo)) {
    let prevRecord: RawRow | null = null

    for (const row of byRepo[repo]) {
      // -- 기본 필드들
      const id = parseInt(row.id, 10)
      const tag_name = row.tag_name
      const draft = row.draft.toLowerCase() === 'true'
      const prerelease = row.prerelease.toLowerCase() === 'true'
      const created_at = row.published_at // (편의상 동일하게 사용 가능)
      const published_at = row.published_at
      const author = row.author

      // -- SemVer 파싱
      const { major, minor, patch, release_type } = parseSemVer(tag_name)

      // -- 날짜·시간 분해
      const dt = parseISO(published_at)
      const year = getYear(dt)
      const month = getMonth(dt) + 1 // getMonth: 0~11
      const day = getDate(dt)
      const weekday = getDay(dt) // 0=Sun
      const weekday_name = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ][weekday]
      const hour = getHours(dt)
      // 예: 00~03 → "00-03", 04~07 → "04-07", …
      const time_slot = `${String(Math.floor(hour / 4) * 4).padStart(2, '0')}-${String(Math.floor(hour / 4) * 4 + 3).padStart(2, '0')}`
      const is_weekend_flag = isWeekend(dt)

      // -- 직전 릴리즈 대비 메트릭
      let prev_release_date: string | null = null
      let days_since_prev: number | null = null
      if (prevRecord) {
        prev_release_date = prevRecord.published_at.slice(0, 10) // "YYYY-MM-DD"
        days_since_prev = differenceInCalendarDays(
          parseISO(published_at),
          parseISO(prev_release_date)
        )
      }

      // -- (간단화) 커밋/PR/이슈 카운트 및 top contributor는 ‘스캔 시점’에 구현이 복잡하므로
      //    여기서는 null로 둡니다. 실제로는 GitHub API 추가 호출해서 계산하면 됩니다.
      const commit_count_since_prev: number | null = null
      const pr_count_since_prev: number | null = null
      const closed_issues_since_prev: number | null = null
      const top_contributor_1: string | null = null
      const top_contributor_1_count: number | null = null
      const top_contributor_2: string | null = null
      const top_contributor_2_count: number | null = null
      const top_contributor_3: string | null = null
      const top_contributor_3_count: number | null = null

      // -- 릴리즈 노트(body)나 Asset 정보는 이 예제에서 따로 API 호출하지 않았으므로 null 처리
      const body_length: number | null = null
      const breaking_change_flag: boolean = false
      const notes_url: string | null = null
      const asset_count: number | null = null
      const asset_total_size_kb: number | null = null
      const download_count_total: number | null = null

      enrichedList.push({
        repository: repo,
        id,
        tag_name,
        draft,
        prerelease,
        created_at,
        published_at,
        author,

        body_length,
        breaking_change_flag,
        notes_url,
        asset_count,
        asset_total_size_kb,
        download_count_total,

        version_major: major,
        version_minor: minor,
        version_patch: patch,
        release_type,

        published_date: published_at.slice(0, 10), // “YYYY-MM-DD”
        published_time: format(dt, 'HH:mm:ss'),
        year,
        month,
        day,
        weekday,
        weekday_name,
        hour,
        time_slot,
        is_weekend: is_weekend_flag,

        prev_release_date,
        days_since_prev_release: days_since_prev,

        commit_count_since_prev,
        pr_count_since_prev,
        closed_issues_since_prev,

        top_contributor_1,
        top_contributor_1_count,
        top_contributor_2,
        top_contributor_2_count,
        top_contributor_3,
        top_contributor_3_count
      })

      prevRecord = row
    }
  }

  // 7) CSV로 쓰기: EnrichedRelease 배열 → release_enriched.csv
  //    헤더 순서는 EnrichedRelease의 필드 순서와 동일하게 맞춥니다.
  const headers = [
    'repository',
    'id',
    'tag_name',
    'draft',
    'prerelease',
    'created_at',
    'published_at',
    'author',

    'body_length',
    'breaking_change_flag',
    'notes_url',
    'asset_count',
    'asset_total_size_kb',
    'download_count_total',

    'version_major',
    'version_minor',
    'version_patch',
    'release_type',

    'published_date',
    'published_time',
    'year',
    'month',
    'day',
    'weekday',
    'weekday_name',
    'hour',
    'time_slot',
    'is_weekend',

    'prev_release_date',
    'days_since_prev_release',

    'commit_count_since_prev',
    'pr_count_since_prev',
    'closed_issues_since_prev',

    'top_contributor_1',
    'top_contributor_1_count',
    'top_contributor_2',
    'top_contributor_2_count',
    'top_contributor_3',
    'top_contributor_3_count'
  ]

  return new Promise<void>((resolve, reject) => {
    const outStream = fs.createWriteStream(ENRICHED_CSV_PATH)
    const stringifier = stringify({
      header: true,
      columns: headers
    })
    stringifier.pipe(outStream)

    for (const rec of enrichedList) {
      const row = headers.map(h => (rec as any)[h])
      stringifier.write(row)
    }
    stringifier.end(() => resolve())
    stringifier.on('error', err => reject(err))
  })
}

// 8) 스크립트 실행
generateEnrichedRaw()
  .then(() => {
    console.log('▶ release_enriched.csv가 성공적으로 생성되었습니다.')
  })
  .catch(err => {
    console.error('❌ release_enriched.csv 생성 중 오류:', err)
    process.exit(1)
  })
