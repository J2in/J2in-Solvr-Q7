export interface EnrichedRelease {
  // ────────────────────────────────────────────────
  // 1) GitHubReleaseRaw에 있던 필드
  // ────────────────────────────────────────────────
  repository: string // 예: "stackflow" 또는 "seed-design"
  id: number // raw.id와 동일
  tag_name: string // raw.tag_name
  published_at: string // raw.published_at
  author: string // raw.author.login
  draft: boolean // raw.draft
  prerelease: boolean // raw.prerelease
  created_at: string // raw.created_at

  // ────────────────────────────────────────────────
  // 2) 릴리즈 노트 & Asset 정보
  // ────────────────────────────────────────────────
  body_length: number | null
  breaking_change_flag: boolean
  notes_url: string | null

  asset_count: number | null
  asset_total_size_kb: number | null
  download_count_total: number | null

  // ────────────────────────────────────────────────
  // 3) SemVer 정보
  // ────────────────────────────────────────────────
  version_major: number | null
  version_minor: number | null
  version_patch: number | null
  release_type: 'major' | 'minor' | 'patch' | 'prerelease' | null

  // ────────────────────────────────────────────────
  // 4) 날짜·시간 분해
  // ────────────────────────────────────────────────
  published_date: string // "YYYY-MM-DD"
  published_time: string // "HH:mm:ss"
  year: number
  month: number
  day: number
  weekday: number // 0=Sunday…6=Saturday
  weekday_name: string // "Sunday"… "Saturday"
  hour: number
  time_slot: string // ex) "00-03", "04-07"…
  is_weekend: boolean

  // ────────────────────────────────────────────────
  // 5) 직전 릴리즈 대비 메트릭
  // ────────────────────────────────────────────────
  prev_release_date: string | null
  days_since_prev_release: number | null

  commit_count_since_prev: number | null
  pr_count_since_prev: number | null
  closed_issues_since_prev: number | null

  top_contributor_1: string | null
  top_contributor_1_count: number | null
  top_contributor_2: string | null
  top_contributor_2_count: number | null
  top_contributor_3: string | null
  top_contributor_3_count: number | null
}
