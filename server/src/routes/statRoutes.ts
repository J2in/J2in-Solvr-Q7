// server/src/routes/statRoutes.ts

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

/**
 * 통계 CSV 파일들이 있는 디렉토리 (예시: project-root/data/statistics/)
 * - release_statistics_yearly.csv
 * - release_statistics_weekly.csv
 * - release_statistics_daily.csv
 */
function csvPath(filename: string): string {
  return path.resolve(__dirname, '../../data/releases_output', filename)
}

/**
 * 동기 파싱: “period, count” 헤더를 가진 CSV 파일을 읽어
 * [{ period: string, count: number }, …] 형태로 반환
 */
function parseStatCsvSync(filename: string): Array<{ period: string; count: number }> {
  const raw = fs.readFileSync(csvPath(filename), 'utf-8')
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Array<Record<string, string>>

  return rows.map(r => ({
    period: r['period'],
    count: Number(r['count'] ?? 0)
  }))
}

/**
 * statisticsRoutes 플러그인:
 *  - GET /api/statistics/yearly  → release_statistics_yearly_weekday.csv
 *  - GET /api/statistics/weekly  → release_statistics_weekly_weekday.csv
 *  - GET /api/statistics/daily   → release_statistics_daily_weekday.csv
 */
export default async function statisticsRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────
  // 1) 연도별 통계
  // GET /api/statistics/yearly
  // ─────────────────────────────────────────
  fastify.get('/api/statistics/yearly', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = parseStatCsvSync('release_statistics_yearly_weekday.csv')
      return reply.code(200).send(data)
    } catch (err) {
      fastify.log.error('Error parsing yearly CSV:', err)
      return reply.code(500).send({ error: 'CSV 파싱 중 오류가 발생했습니다.' })
    }
  })

  // ─────────────────────────────────────────
  // 2) 주간 통계
  // GET /api/statistics/weekly
  // ─────────────────────────────────────────
  fastify.get('/api/statistics/weekly', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = parseStatCsvSync('release_statistics_weekly_weekday.csv')
      return reply.code(200).send(data)
    } catch (err) {
      fastify.log.error('Error parsing weekly CSV:', err)
      return reply.code(500).send({ error: 'CSV 파싱 중 오류가 발생했습니다.' })
    }
  })

  // ─────────────────────────────────────────
  // 3) 일간 통계
  // GET /api/statistics/daily
  // ─────────────────────────────────────────
  fastify.get('/api/statistics/daily', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = parseStatCsvSync('release_statistics_daily_weekday.csv')
      return reply.code(200).send(data)
    } catch (err) {
      fastify.log.error('Error parsing daily CSV:', err)
      return reply.code(500).send({ error: 'CSV 파싱 중 오류가 발생했습니다.' })
    }
  })
}
