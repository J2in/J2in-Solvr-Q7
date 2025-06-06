// server/src/utils/dateUtils.ts
import { parseISO, format, getYear, getMonth, getDate, getDay, getHours } from 'date-fns'

export function decomposeDateTime(isoString: string): {
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
} {
  const dt = parseISO(isoString)
  const published_date = format(dt, 'yyyy-MM-dd')
  const published_time = format(dt, 'HH:mm:ss')
  const year = getYear(dt)
  const month = getMonth(dt) + 1
  const day = getDate(dt)
  const weekday = getDay(dt)
  const weekday_name = format(dt, 'EEEE')
  const hour = getHours(dt)

  let time_slot = ''
  if (hour <= 3) time_slot = '00-03'
  else if (hour <= 7) time_slot = '04-07'
  else if (hour <= 11) time_slot = '08-11'
  else if (hour <= 15) time_slot = '12-15'
  else if (hour <= 19) time_slot = '16-19'
  else time_slot = '20-23'

  const is_weekend = weekday === 0 || weekday === 6

  return {
    published_date,
    published_time,
    year,
    month,
    day,
    weekday,
    weekday_name,
    hour,
    time_slot,
    is_weekend
  }
}
