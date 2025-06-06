// server/src/types/stats.ts
// 릴리즈 통계를 위한 내부 데이터 타입 정의

/** CSV에 저장할 “원시 릴리즈 레코드” 구조 */
export interface ReleaseRecord {
  repository: string // 예: "stackflow" 또는 "seed-design"
  id: number
  tag_name: string
  published_at: string // ISO 8601
  author: string // author.login
  draft: boolean
  prerelease: boolean
}

/** 연간/월간/주간/일간 통계 결과 타입 */
export interface ReleaseStat {
  period: string // 예: "2024", "2024-06", "2024-W23", "2024-06-15"
  count: number // 해당 기간의 릴리즈 개수
}
