/* eslint-disable license-header/header */

import { STATUS_MAP, PRIORITY_MAP } from './constants'

/**
 * Get human-readable status text
 * @param {number} status - Status code
 * @returns {string}
 */
export const getStatusText = (status) => {
  return STATUS_MAP[status] || 'Unknown'
}

/**
 * Get human-readable priority text
 * @param {number} priority - Priority code
 * @returns {string}
 */
export const getPriorityText = (priority) => {
  return PRIORITY_MAP[priority] || 'Normal'
}
