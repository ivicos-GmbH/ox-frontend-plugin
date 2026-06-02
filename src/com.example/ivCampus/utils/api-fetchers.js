/* eslint-disable license-header/header */

import moment from 'moment'
// import { getGabId } from '$/io.ox/contacts/util'
import { toPlainObject, fetchFullDetails, transformMail, transformTask } from './data-transformers'
import { getTodayRange, overlapsToday } from './date-helpers'
import { DEFAULT_FETCH_OPTIONS } from './constants'
import http from '$/io.ox/core/http'

/**
 * Fetch calendar appointments
 * @param {Object} calendarApi - Calendar API instance
 * @returns {Promise<Array>}
 */
export const fetchCalendarAppointments = (calendarApi) => {
  if (!calendarApi) {
    throw new Error('Calendar API is required')
  }

  const collection = calendarApi.getCollection({
    start: moment().startOf('day').valueOf(),
    end: moment().endOf('day').valueOf()
  })

  return collection.sync()
    .then(() => {
      const promises = collection.map((model) =>
        calendarApi.get({
          folder: model.get('folder'),
          id: model.get('id')
        })
      )
      return Promise.all(promises)
    })
    .then((fullAppointments) => {
      const appointments = fullAppointments.map((model) => {
        const appointment = model.toJSON()
        console.log('📅 Full Appointment Details:', appointment)
        return appointment
      })
      return appointments
    })
    .catch((error) => {
      console.error('❌ Failed to load calendar appointments:', error)
      throw error
    })
}

/**
 * Fetch mail messages
 * @param {Object} mailApi - Mail API instance
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>}
 */

export const fetchMailMessages = async (mailApi, options = {}) => {
  if (!mailApi) throw new Error('Mail API is required')
  const {
    folder = mailApi.getDefaultFolder(),
    limit = DEFAULT_FETCH_OPTIONS.mail.limit,
    sort = '661',
    order = 'desc',
    // ensures the list rows already include `date` (661) + subject/from/etc
    columns = http.defaultColumns.mail.all
  } = { ...DEFAULT_FETCH_OPTIONS.mail, ...options }
  const mails = await mailApi.getAll({
    folder,
    sort,
    order,
    max: limit,
    columns,
    deleted: false,
    // unseen: true
  }, false) // bypass OX client-side cache — forces a live IMAP request on every call

  const deletedFlag = mailApi.FLAGS?.DELETED ?? 2

  // if you still want "today only"
  const { start, end } = getTodayRange()
  const todayMails = mails
    .map(toPlainObject)
    .filter((m) => typeof m.flags !== 'number' || (m.flags & deletedFlag) !== deletedFlag)
    .filter((m) => {
      const raw = m.received_date ?? m.sent_date ?? m.date
      const t =
        raw == null
          ? null
          : typeof raw === 'number'
            ? raw
            : new Date(raw).getTime()
      return t != null && t >= start && t <= end
    })

  const transformed = todayMails.map((m) => transformMail(m))

  return transformed
}

/**
 * Fetch tasks
 * @param {Object} taskAPI - Task API instance
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>}
 */
export const fetchTasks = async (taskAPI, options = {}) => {
  if (!taskAPI) {
    throw new Error('Tasks API is required')
  }

  const defaultFolder = taskAPI.getDefaultFolder()
  const {
    excludeDelegatedToOthers = DEFAULT_FETCH_OPTIONS.tasks.excludeDelegatedToOthers,
    folder = defaultFolder,
    searchQuery = null,
    searchStartDate = null,
    searchEndDate = null,
    useMyTasks = true
  } = { ...DEFAULT_FETCH_OPTIONS.tasks, ...options }

  const fetchFullTaskDetails = (tasks) =>
    fetchFullDetails(tasks, (task) =>
      taskAPI.get({
        folder: task.folder || task.folder_id || folder,
        id: task.id
      })
    )

  try {
    let tasks

    if (searchQuery) {
      const searchParams = { pattern: searchQuery }
      if (folder && folder !== defaultFolder) {
        searchParams.folder = folder
      }
      if (searchStartDate) searchParams.start = searchStartDate
      if (searchEndDate) searchParams.end = searchEndDate

      tasks = await taskAPI.search(searchParams)
    } else if (useMyTasks !== false) {
      tasks = await taskAPI.getAllMyTasks({ excludeDelegatedToOthers })
    } else {
      tasks = await taskAPI.getAll({
        folder,
        sort: '317',
        order: 'asc'
      })
    }

    const fullTasks = await fetchFullTaskDetails(tasks)
    const plainTasks = fullTasks.map(toPlainObject)

    const todayTasks = plainTasks.filter((task) => {
      const startTime = task.start_time ? new Date(task.start_time).getTime() : null
      const endTime = task.end_time ? new Date(task.end_time).getTime() : null
      return overlapsToday(startTime, endTime)
    })

    const tasksData = todayTasks.map(transformTask)
    tasksData.forEach((task) => console.log('✅ Task Details (Fields with values only):', task))

    return tasksData
  } catch (error) {
    console.error('❌ Failed to load tasks:', error)
    throw error
  }
}

/**
 * Fetch contacts
 * @param {Object} contactsAPI - Contacts API instance
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>}
 */
// export const fetchContacts = async (contactsAPI, options = {}) => {
//   if (!contactsAPI) {
//     throw new Error('Contacts API is required')
//   }

//   const {
//     folder = getGabId(),
//     searchQuery = null,
//     limit = DEFAULT_FETCH_OPTIONS.contacts.limit
//   } = { ...DEFAULT_FETCH_OPTIONS.contacts, ...options }

//   const fetchFullContactDetails = (contacts) =>
//     fetchFullDetails(contacts, (contact) =>
//       contactsAPI.get({
//         folder: contact.folder || contact.folder_id || folder,
//         id: contact.id
//       })
//     )

//   try {
//     let contacts

//     if (searchQuery) {
//       contacts = await contactsAPI.advancedsearch(searchQuery, {
//         folders: folder ? [folder] : undefined,
//         limit: limit || 0
//       })
//       console.log(`👤 Found ${contacts.length} contacts matching "${searchQuery}"`)
//     } else {
//       contacts = await contactsAPI.getAll({
//         folder,
//         sort: '607',
//         order: 'asc'
//       })
//       console.log(`👤 Found ${contacts.length} contacts`)
//     }

//     const fullContacts = await fetchFullContactDetails(contacts)
//     const contactsData = fullContacts.map(toPlainObject)

//     contactsData.forEach((contact) => {
//       const contactInfo = transformContact(contact)
//       console.log('👤 Contact Data (Fields with values only):', contactInfo)
//     })

//     return contactsData
//   } catch (error) {
//     console.error('❌ Failed to load contacts:', error)
//     throw error
//   }
// }
