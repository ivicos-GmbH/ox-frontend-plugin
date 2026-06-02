/* eslint-disable license-header/header */

export const getTodayRange = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start: start.getTime(), end: end.getTime() }
}

export const isToday = (timestamp) => {
  const { start, end } = getTodayRange()
  return timestamp >= start && timestamp <= end
}

export const overlapsToday = (startMs, endMs) => {
  const { start, end } = getTodayRange()
  const s = startMs ?? start
  const e = endMs ?? end
  return s <= end && e >= start
}

export const toLocalString = (timestamp) =>
  new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  })
