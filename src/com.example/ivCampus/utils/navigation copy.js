/* eslint-disable license-header/header */

import ox from '$/ox'
import _ from '$/underscore'
import $ from '$/jquery'
import api from '$/io.ox/calendar/api'

// Track pending operations to prevent duplicate launches
const pendingOperations = new Map()

// Debounce helper to prevent rapid successive calls
const debounce = (fn, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Construct composite ID for calendar appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} folderId - Folder ID
 * @param {string} cid - Pre-constructed CID (optional)
 * @returns {string} Composite ID
 */
function getAppointmentCid (appointmentId, folderId, cid) {
  if (cid) return cid
  if (appointmentId.includes('cal://') || appointmentId.includes('.')) return appointmentId
  if (folderId) return api.cid({ folder: folderId, id: appointmentId })
  throw new Error('Appointment ID or folder ID is required')
}

/**
 * Open a calendar appointment in the calendar app
 * @param {string} appointmentId - Appointment ID
 * @param {string} folderId - Folder ID (optional)
 * @param {string} cid - Composite ID (optional, if already constructed)
 */
export const openAppointment = async (appointmentId, folderId, cid) => {
  try {
    const targetId = getAppointmentCid(appointmentId, folderId, cid)
    const operationKey = `appointment:${targetId}`

    // Prevent duplicate calls
    if (pendingOperations.has(operationKey)) {
      console.log('⏭️ Appointment open already in progress')
      return pendingOperations.get(operationKey)
    }

    console.log(`📅 Opening appointment: cid=${targetId}`)

    const promise = ox.launch(() => import('$/io.ox/calendar/detail/main'), { cid: targetId })
      .catch(error => {
        console.error('❌ Failed to open appointment:', error)
        throw error
      })
      .finally(() => {
        setTimeout(() => pendingOperations.delete(operationKey), 1000)
      })

    pendingOperations.set(operationKey, promise)
    return promise
  } catch (error) {
    console.error('❌ Failed to open appointment:', error)
    throw error
  }
}

/**
 * Construct composite ID for task
 * @param {string} taskId - Task ID
 * @param {string} folderId - Folder ID
 * @returns {string} Composite ID
 */
function getTaskCid (taskId, folderId) {
  if (!folderId) throw new Error('Folder ID is required for tasks')
  const id = String(taskId || '').replace(/\//, '.')
  return id.indexOf('.') > -1 ? id : _.cid({ folder: folderId, id })
}

/**
 * Open a task in the tasks app
 * @param {string} taskId - Task ID
 * @param {string} folderId - Folder ID
 */
export const openTask = async (taskId, folderId) => {
  try {
    const cid = getTaskCid(taskId, folderId)
    const operationKey = `task:${cid}`

    // Prevent duplicate calls
    if (pendingOperations.has(operationKey)) {
      console.log('⏭️ Task open already in progress')
      return pendingOperations.get(operationKey)
    }

    console.log(`✅ Opening task: cid=${cid}, folder=${folderId}`)

    const promise = ox.launch(() => import('$/io.ox/tasks/main'), { folder: folderId })
      .then(function (app) {
        // Set folder if needed, then select the item
        return $.when()
          .then(function () {
            if (app.folder.get() !== folderId) {
              return app.folder.set(folderId)
            }
          })
          .then(function () {
            if (cid) {
              return app.getGrid().selection.set(cid)
            }
          })
      })
      .catch(error => {
        console.error('❌ Failed to open task:', error)
        throw error
      })
      .finally(() => {
        setTimeout(() => pendingOperations.delete(operationKey), 1000)
      })

    pendingOperations.set(operationKey, promise)
    return promise
  } catch (error) {
    console.error('❌ Failed to open task:', error)
    throw error
  }
}

/**
 * Construct composite ID for mail
 * @param {string} mailId - Mail ID
 * @param {string} folderId - Folder ID
 * @returns {string} Composite ID
 */
function getMailCid (mailId, folderId) {
  if (!mailId || !folderId) {
    throw new Error('Mail ID and Folder ID are required')
  }
  return _.cid({ folder: folderId, id: mailId })
}

/**
 * Open a mail message in the mail app
 * @param {string} mailId - Mail ID
 * @param {string} folderId - Folder ID
 */
export const openMail = async (mailId, folderId) => {
  try {
    const cid = getMailCid(mailId, folderId)
    const operationKey = `mail:${cid}`

    // Prevent duplicate calls
    if (pendingOperations.has(operationKey)) {
      console.log('⏭️ Mail open already in progress')
      return pendingOperations.get(operationKey)
    }

    console.log(`📧 Opening mail: cid=${cid}`)

    let promise
    if (_.device('smartphone')) {
      const registry = (await import('$/io.ox/core/detail-popup')).default
      promise = Promise.resolve(registry.call({ type: 'mail', data: { cid }, selector: '*' }))
    } else {
      promise = ox.launch(() => import('$/io.ox/mail/detail/main'), { cid })
    }

    promise = promise
      .catch(error => {
        console.error('❌ Failed to open mail:', error)
        throw error
      })
      .finally(() => {
        setTimeout(() => pendingOperations.delete(operationKey), 1000)
      })

    pendingOperations.set(operationKey, promise)
    return promise
  } catch (error) {
    console.error('❌ Failed to open mail:', error)
    throw error
  }
}

/**
 * Handle navigation request from iframe
 * @param {Object} request - Navigation request
 * @param {string} request.type - 'appointment' | 'task' | 'mail'
 * @param {string} request.id - Item ID
 * @param {string} request.folder - Folder ID
 * @param {string} [request.cid] - Pre-constructed composite ID (optional)
 */
export const handleNavigation = (request) => {
  if (!request || typeof request !== 'object') {
    console.warn('⚠️ Invalid navigation request:', request)
    return
  }

  const { type, id, folder, cid } = request

  if (!type || !id || !folder) {
    console.warn('⚠️ Navigation request missing required fields:', request)
    return
  }

  try {
    switch (type) {
      case 'appointment':
        return openAppointment(id, folder, cid)
      case 'task':
        return openTask(id, folder)
      case 'mail':
        return openMail(id, folder)
      default:
        console.warn('⚠️ Unknown navigation type:', type)
    }
  } catch (error) {
    console.error('❌ Navigation failed:', error)
  }
}

// Debounced handler to prevent rapid successive calls
const debouncedHandleNavigation = debounce(handleNavigation, 300)

// Set up postMessage listener only once
let messageListenerSetup = false

if (typeof window !== 'undefined' && !messageListenerSetup) {
  window.addEventListener('message', function (event) {
    // Verify origin for security (adjust to your plugin's origin)
    // if (event.origin !== 'https://your-plugin-domain.com') return

    if (event.data && event.data.type === 'ox-open-item' && event.data.request) {
      debouncedHandleNavigation(event.data.request)
    }
  }, false)
  messageListenerSetup = true
}
