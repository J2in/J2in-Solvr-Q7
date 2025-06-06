// server/src/utils/semverUtils.ts
import { parse, SemVer } from 'semver'

export function parseSemVer(tagName: string): {
  major: number | null
  minor: number | null
  patch: number | null
  releaseType: 'major' | 'minor' | 'patch' | 'prerelease' | null
} {
  let cleaned = tagName.trim()
  if (cleaned.startsWith('v')) cleaned = cleaned.slice(1)

  try {
    const sem = parse(cleaned)
    if (!sem) return { major: null, minor: null, patch: null, releaseType: null }

    const major = sem.major
    const minor = sem.minor
    const patch = sem.patch

    let releaseType: 'major' | 'minor' | 'patch' | 'prerelease' | null = null
    if (sem.prerelease.length > 0) {
      releaseType = 'prerelease'
    } else if (major > 0 && minor === 0 && patch === 0) {
      releaseType = 'major'
    } else if (minor > 0 && patch === 0) {
      releaseType = 'minor'
    } else {
      releaseType = 'patch'
    }

    return { major, minor, patch, releaseType }
  } catch {
    return { major: null, minor: null, patch: null, releaseType: null }
  }
}
