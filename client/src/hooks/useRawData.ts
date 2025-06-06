// client/src/hooks/useRawData.ts
import { useEffect, useState } from 'react'
import axios from 'axios'
//import type { EnrichedRelease } from '../types/release' // 서버에서 내려주는 형식에 맞춰 정의

export interface EnrichedRelease {
  repository: string
  id: number
  tag_name: string
  published_at: string
  author: string
  draft: boolean
  prerelease: boolean
  created_at: string
  body_length: number | null
  breaking_change_flag: boolean
  notes_url: string | null
  asset_count: number | null
  asset_total_size_kb: number | null
  download_count_total: number | null
  version_major: number | null
  version_minor: number | null
  version_patch: number | null
  release_type: 'major' | 'minor' | 'patch' | 'prerelease' | null
  published_date: string
  published_time: string
  year: number
  month: number
  day: number
  weekday: number
  weekday_name: string
  hour: number
  time_slot: string
  is_weekend: boolean
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

export function useRawData() {
  const [data, setData] = useState<EnrichedRelease[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await axios.get<EnrichedRelease[]>('/api/releases/enriched')
        console.log(res.data)
        setData(res.data)
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}
