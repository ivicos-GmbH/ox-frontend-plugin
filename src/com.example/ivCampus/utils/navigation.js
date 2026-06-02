/* eslint-disable license-header/header */

import ox from '$/ox'
import _ from '$/underscore'
// import $ from '$/jquery'
import api from '$/io.ox/calendar/api'
import calendarModel from '$/io.ox/calendar/model'
import { settings as coreSettings } from '$/io.ox/core/settings'
import registry from '$/io.ox/core/main/registry'

// Track pending operations to prevent duplicate launches
const pendingOperations = new Map()

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
 * Open a calendar appointment in the calendar app (detail window)
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

export const addAppointment = async (request = {}) => {
  try {
    const { default: edit } = await ox.load(() => import('$/io.ox/calendar/edit/main'))
    const app = edit.getApp()
    await app.launch()
    const now = Date.now()
    app.create(new calendarModel.Model({
      title: request.title || '',
      startDate: request.startDate || now,
      endDate: request.endDate || now + 3600000,
      note: request.description || undefined
    }))
  } catch (error) {
    console.error('❌ Failed to create appointment:', error)
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
  return id.indexOf('.') > -1 ? id : `${folderId}.${id}`
}

/**
 * Open a task in the tasks app (detail window)
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

    // Open detail view directly (like appointments and mail)
    const promise = ox.launch(() => import('$/io.ox/tasks/detail/main'), { cid })
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

export const addTask = async (request = {}) => {
  try {
    const { default: edit } = await ox.load(() => import('$/io.ox/tasks/edit/main'))
    const app = edit.getApp()
    app.launch({
      taskData: {
        title: request.title || '',
        note: request.note || '',
        folder_id: coreSettings.get('folder/tasks'),
        end_time: request.dueDate || undefined
      }
    })
  } catch (error) {
    console.error('❌ Failed to add task:', error)
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
 * Open a mail message in the mail app (detail window)
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
      // Use detail popup on mobile
      const registry = (await import('$/io.ox/core/detail-popup')).default
      promise = Promise.resolve(registry.call({ type: 'mail', data: { cid }, selector: '*' }))
    } else {
      // Open detail view directly (like appointments and tasks)
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

export const addMail = async (request = {}) => {
  try {
    registry.call('io.ox/mail/compose', 'open', {
      to: request.to ? [['', request.to]] : [],
      subject: request.subject || '',
      body: request.body || ''
    })
  } catch (error) {
    console.error('❌ Failed to add mail:', error)
    throw error
  }
}

/**
 * Handle navigation request from iframe
 * @param {Object} data - Navigation request
 * @param {string} data.type - 'appointment' | 'task' | 'mail'
 * @param {string} data.id - Item ID
 * @param {string} data.folder - Folder ID
 * @param {Object} data.request - Request object, optional for certain types
 * @param {string} [data.request.cid] - Pre-constructed composite ID (optional)
 */
export const handleNavigation = (data) => {
  const { type, request } = data
  if (!request || typeof request !== 'object') {
    console.warn('⚠️ Invalid navigation request:', request)
    return
  }

  if (!request.type) {
    console.warn('⚠️ Navigation request missing required fields:', request)
    return
  }

  if (type === 'ox-open-item' && (!request.id || !request.folder)) {
    console.warn('⚠️ Navigation request missing required fields:', request)
    return
  }

  try {
    switch (request.type) {
      case 'appointment':
        return openAppointment(request.id, request.folder, request.cid)
      case 'add-appointment':
        return addAppointment(request)
      case 'task':
        return openTask(request.id, request.folder)
      case 'add-task':
        return addTask(request)
      case 'mail':
        return openMail(request.id, request.folder)
      case 'add-mail':
        return addMail(request)
      default:
        console.warn('⚠️ Unknown navigation type:', request.type)
    }
  } catch (error) {
    console.error('❌ Navigation failed:', error)
  }
}
