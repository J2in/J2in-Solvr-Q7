// server/src/types/github.ts
// GitHub API 원시 릴리즈 데이터 타입 정의

export interface GitHubAuthor {
  login: string
}

export interface GitHubReleaseRaw {
  id: number
  tag_name: string
  draft: boolean
  prerelease: boolean
  created_at: string // ISO 8601
  published_at: string // ISO 8601 (null이 될 가능성이 없다 가정)
  author: GitHubAuthor
}
