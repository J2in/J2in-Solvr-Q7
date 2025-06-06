// server/src/utils/githubClient.ts
// ────────────────────────────────────────────────────────────────
// 이 파일은 CommonJS 모드(= tsconfig.json에 "module": "commonjs" 등)에서 동작한다고 가정합니다.
// 타입 전용 import를 전부 제거하고, 런타임에만 동적으로 Octokit을 불러오도록 수정합니다.
// ────────────────────────────────────────────────────────────────

const pino = require('pino')
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

let octokitInstance: any = null

/**
 * 싱글톤으로 Octokit 인스턴스를 생성하거나 재사용합니다.
 * @returns Octokit 인스턴스
 */
async function getOctokit() {
  if (octokitInstance) {
    return octokitInstance
  }

  // dynamic import 방식을 사용해서 ESM 전용 @octokit/rest를 불러옵니다.
  const { Octokit } = await import('@octokit/rest')

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    logger.error('❌ GITHUB_TOKEN 환경 변수가 설정되어 있지 않습니다.')
    process.exit(1)
  }

  octokitInstance = new Octokit({
    auth: token,
    userAgent: 'J2in-Solvr-Q7-Enrich/1.0',
    timeZone: 'Asia/Seoul',
    baseUrl: 'https://api.github.com'
  })

  // Rate limit 재시도 훅
  octokitInstance.hook.error('request', async (error: any, options: any) => {
    if (error.status === 403 && error.headers['x-ratelimit-remaining'] === '0') {
      const resetTs = Number(error.headers['x-ratelimit-reset']) * 1000
      const waitMs = resetTs - Date.now() + 5000
      logger.warn(`🌐 GitHub Rate limit 초과. ${waitMs}ms 후 재시도합니다.`)
      await new Promise(r => setTimeout(r, waitMs))
      return octokitInstance.request(options)
    }
    // 다른 에러는 그대로 throw
    throw error
  })

  return octokitInstance
}

/**
 * 특정 릴리즈의 assets 정보를 가져옵니다.
 */
export async function fetchReleaseAssets(
  owner: string,
  repo: string,
  releaseId: number
): Promise<
  Array<{
    id: number
    name: string
    size: number
    download_count: number
    browser_download_url: string
  }>
> {
  const octokit = await getOctokit()
  const response = await octokit.rest.repos.getRelease({
    owner,
    repo,
    release_id: releaseId
  })
  const assets = response.data.assets || []
  return assets.map((asset: any) => ({
    id: asset.id,
    name: asset.name,
    size: asset.size,
    download_count: asset.download_count,
    browser_download_url: asset.browser_download_url
  }))
}

/**
 * 두 커밋 사이의 커밋 개수를 조회합니다.
 */
export async function fetchCommitCountSince(
  owner: string,
  repo: string,
  baseSha: string,
  headSha: string
): Promise<number> {
  const octokit = await getOctokit()
  const compare = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${baseSha}...${headSha}`
  })
  return compare.data.total_commits
}

/**
 * 두 태그 사이에 머지된 PR 개수를 조회합니다.
 */
export async function fetchPRCountSince(
  owner: string,
  repo: string,
  baseTag: string,
  headTag: string
): Promise<number> {
  const octokit = await getOctokit()

  // baseTag와 headTag의 published_at을 먼저 가져옴
  const baseRel = await octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag: baseTag
  })
  const headRel = await octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag: headTag
  })
  const baseDate = baseRel.data.published_at!
  const headDate = headRel.data.published_at!

  // Search API로 merged PR 수 조회
  const searchQuery = `repo:${owner}/${repo} is:pr is:merged merged:${baseDate}..${headDate}`
  const searchRes = await octokit.rest.search.issuesAndPullRequests({
    q: searchQuery,
    per_page: 1
  })
  return searchRes.data.total_count
}

/**
 * 특정 시점 이후에 닫힌 이슈 개수를 조회합니다.
 */
export async function fetchClosedIssuesSince(
  owner: string,
  repo: string,
  sinceIso: string
): Promise<number> {
  const octokit = await getOctokit()
  const searchQuery = `repo:${owner}/${repo} is:issue is:closed closed:>=${sinceIso}`
  const searchRes = await octokit.rest.search.issuesAndPullRequests({
    q: searchQuery,
    per_page: 1
  })
  return searchRes.data.total_count
}

/**
 * 두 커밋 사이에 기여가 많은 상위 N명 기여자를 조회합니다.
 */
export async function fetchTopContributors(
  owner: string,
  repo: string,
  baseSha: string,
  headSha: string,
  topN = 3
): Promise<Array<{ author: string; count: number }>> {
  const octokit = await getOctokit()
  const compare = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${baseSha}...${headSha}`
  })
  const commits = compare.data.commits
  const freqMap: Record<string, number> = {}

  for (const c of commits) {
    // author.login이 없을 수 있으므로 fallback
    const login = c.author?.login || c.commit?.author?.name || 'unknown'
    freqMap[login] = (freqMap[login] || 0) + 1
  }

  const sorted = Object.entries(freqMap)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)

  return sorted
}
