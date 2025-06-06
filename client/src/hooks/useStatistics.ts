// client/src/hooks/useStatistics.ts
import { useState, useEffect } from 'react'

export type StatRecord = {
  period: string // ex) "2023", "2023-W23", "2023-06-15"
  count: number
}

type Period = 'yearly' | 'weekly' | 'daily'

interface UseStatisticsResult {
  data: StatRecord[] | null
  loading: boolean
  error: string | null
}

export function useStatistics(period: Period): UseStatisticsResult {
  const [data, setData] = useState<StatRecord[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch(`/api/statistics/${period}`)
      .then(async res => {
        if (!res.ok) throw new Error(`${period} 통계 요청 실패: ${res.status}`)
        const json = (await res.json()) as StatRecord[]
        if (isMounted) {
          setData(json)
          setLoading(false)
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [period])

  return { data, loading, error }
}
