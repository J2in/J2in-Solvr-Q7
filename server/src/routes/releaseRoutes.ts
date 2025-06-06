import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'
import type { EnrichedRelease } from '../types/release'

export default async function releaseRoutes(fastify: FastifyInstance) {
  fastify.get('/api/releases/enriched', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // CSV 파일 경로 (프로젝트 구조에 맞춰서 조정)
      const csvPath = path.resolve(__dirname, '../../data/releases_output/release_enriched.csv')
      const fileContent = await fs.readFile(csvPath, 'utf-8')

      // parse에 제네릭(<EnrichedRelease>)을 빼고, 결과를 as EnrichedRelease[]로 단언
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      }) as EnrichedRelease[]

      return reply.code(200).send(records)
    } catch (err) {
      fastify.log.error('Error reading enriched_releases.csv:', err)
      return reply.status(500).send({ message: '서버 내부 에러', error: (err as Error).message })
    }
  })
}
