/* eslint-disable license-header/header */

import moment from 'moment'

/**
 * Get start and end timestamps for today
 * @returns {{start: number, end: number}}
 */
export const getTodayRange = () => ({
  start: moment().startOf('day').valueOf(),
  end: moment().endOf('day').valueOf()
})

/**
 * Check if a timestamp falls within today
 * @param {number|null} timestamp - Timestamp to check
 * @returns {boolean}
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false
  const { start, end } = getTodayRange()
  return timestamp >= start && timestamp <= end
}

/**
 * Check if a date range spans or overlaps with today
 * @param {number|null} startTime - Start timestamp
 * @param {number|null} endTime - End timestamp
 * @returns {boolean}
 */
export const overlapsToday = (startTime, endTime) => {
  const { start, end } = getTodayRange()

  if (startTime && isToday(startTime)) return true
  if (endTime && isToday(endTime)) return true
  if (startTime && endTime && startTime < start && endTime > end) return true

  return false
}

/**
 * Convert timestamp to localized string
 * @param {number|string|null} date - Date to convert
 * @returns {string|null}
 */
export const toLocalString = (date) => {
  return date ? new Date(date).toLocaleString() : null
}
