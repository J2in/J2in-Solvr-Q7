// server/src/services/releaseService/fetcher.ts
import axios from 'axios'
import dotenv from 'dotenv'
import { GitHubReleaseRaw } from '../../types/github'

dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

/** GitHub API 호출 시 인증 헤더 구성 */
function getHeaders() {
  return GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}
}

/**
 * 한 페이지(최대 100개)씩 릴리즈를 가져오는 함수
 * @param owner GitHub 소유자 (예: "daangn")
 * @param repo  GitHub 레포 이름 (예: "stackflow")
 * @param page  페이지 번호 (1부터 시작)
 */
async function fetchReleasesPage(
  owner: string,
  repo: string,
  page: number
): Promise<GitHubReleaseRaw[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`
  const response = await axios.get<GitHubReleaseRaw[]>(url, {
    headers: getHeaders(),
    params: {
      per_page: 100,
      page
    }
  })
  return response.data
}

/**
 * 페이지를 반복 호출하여 저장소의 모든 릴리즈를 가져오는 함수
 * @param owner GitHub 소유자
 * @param repo  GitHub 레포 이름
 */
export async function fetchAllReleases(owner: string, repo: string): Promise<GitHubReleaseRaw[]> {
  let allReleases: GitHubReleaseRaw[] = []
  let page = 1

  while (true) {
    const pageData = await fetchReleasesPage(owner, repo, page)
    if (pageData.length === 0) break
    allReleases.push(...pageData)
    page += 1
  }

  return allReleases
}
