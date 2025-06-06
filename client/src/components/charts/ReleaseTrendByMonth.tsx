// client/src/components/charts/ReleaseTrendByMonth.tsx
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface Props {
  data: Array<{ month: string; count: number }>
}

/**
 * props.data는 [{ month: '2023-01', count: 10 }, { month: '2023-02', count: 15 }, …]
 */
export default function ReleaseTrendByMonth({ data }: Props) {
  // 차트 x축 레이블을 'YYYY-MM' 형식으로 출력
  const formattedData = data.map(d => ({
    ...d,
    label: d.month // 필요에 따라 format(d.month…) 가능
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={value => [value, 'Releases']} labelFormatter={label => label} />
        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  )
}
