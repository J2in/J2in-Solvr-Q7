// client/src/components/charts/ReleaseTypeDistribution.tsx
import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  data: Array<{ name: string; value: number }>
}

/**
 * props.data는 [{ name: 'major', value: 5 }, { name: 'minor', value: 12 }, { name: 'patch', value: 30 }, …]
 */
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A']

export default function ReleaseTypeDistribution({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label={entry => entry.name}
        >
          {data.map((entry, index) => (
            <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  )
}
