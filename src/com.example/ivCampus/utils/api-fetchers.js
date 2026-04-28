/* eslint-disable license-header/header */

import moment from 'moment'
import { getGabId } from '$/io.ox/contacts/util'
import { toPlainObject, fetchFullDetails, transformMail, transformTask, transformContact } from './data-transformers'
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
  })

  const deletedFlag = mailApi.FLAGS?.DELETED ?? 2

  console.log('📧 Total mails:', mails.length)
  console.log('📧 Mails:', mails)
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

  console.log('📧 Today mails:', transformed.length)
  console.log('📧 Today mails:', transformed)
  return transformed
}

// export const fetchMailMessages = (mailApi, options = {}) => {
//   if (!mailApi) {
//     throw new Error('Mail API is required')
//   }

//   const {
//     folder = mailApi.getDefaultFolder(),
//     limit = DEFAULT_FETCH_OPTIONS.mail.limit,
//     sort = '661',
//     order = 'desc',
//     fetchFullDetails: fetchFull = DEFAULT_FETCH_OPTIONS.mail.fetchFullDetails
//   } = { ...DEFAULT_FETCH_OPTIONS.mail, ...options }

//   return mailApi.getAll({
//     folder,
//     sort,
//     order,
//     max: limit
//   })
//     .then((mails) => {
//       console.log(`📧 Found ${mails.length} mail messages`)

//       const promises = mails.map((mail) => {
//         if (fetchFull) {
//           return mailApi.get({
//             folder: mail.folder || folder,
//             id: mail.id
//           })
//         }
//         return Promise.resolve(mail)
//       })

//       return Promise.all(promises)
//     })
//     .then((fullMails) => {
//       const { start, end } = getTodayRange()

//       const todayMails = fullMails.filter((mail) => {
//         const mailData = toPlainObject(mail)
//         const mailDate = mailData.date ? new Date(mailData.date).getTime() : null
//         return mailDate && mailDate >= start && mailDate <= end
//       })

//       todayMails.forEach((mail) => {
//         const mailData = toPlainObject(mail)
//         console.log('📧 Mail Details:', {
//           id: mailData.id,
//           subject: mailData.subject || 'No subject',
//           from: mailData.from?.[0]?.[1] || mailData.from?.[0]?.[0] || 'Unknown sender',
//           date: new Date(mailData.date).toLocaleString(),
//           folder: mailData.folder,
//           flags: mailData.flags,
//           attachments: mailData.attachments?.length || 0,
//           allFields: Object.keys(mailData)
//         })
//       })

//       return todayMails.map((m) => toPlainObject(m))
//     })
//     .catch((error) => {
//       console.error('❌ Failed to load mail messages:', error)
//       throw error
//     })
// }

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
      console.log(`🔍 Found ${tasks.length} tasks matching "${searchQuery}"`)
    } else if (useMyTasks !== false) {
      tasks = await taskAPI.getAllMyTasks({ excludeDelegatedToOthers })
      console.log(`✅ Found ${tasks.length} tasks (excludeDelegatedToOthers: ${excludeDelegatedToOthers})`)
    } else {
      tasks = await taskAPI.getAll({
        folder,
        sort: '317',
        order: 'asc'
      })
      console.log(`✅ Found ${tasks.length} tasks from folder ${folder}`)
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
export const fetchContacts = async (contactsAPI, options = {}) => {
  if (!contactsAPI) {
    throw new Error('Contacts API is required')
  }

  const {
    folder = getGabId(),
    searchQuery = null,
    limit = DEFAULT_FETCH_OPTIONS.contacts.limit
  } = { ...DEFAULT_FETCH_OPTIONS.contacts, ...options }

  const fetchFullContactDetails = (contacts) =>
    fetchFullDetails(contacts, (contact) =>
      contactsAPI.get({
        folder: contact.folder || contact.folder_id || folder,
        id: contact.id
      })
    )

  try {
    let contacts

    if (searchQuery) {
      contacts = await contactsAPI.advancedsearch(searchQuery, {
        folders: folder ? [folder] : undefined,
        limit: limit || 0
      })
      console.log(`👤 Found ${contacts.length} contacts matching "${searchQuery}"`)
    } else {
      contacts = await contactsAPI.getAll({
        folder,
        sort: '607',
        order: 'asc'
      })
      console.log(`👤 Found ${contacts.length} contacts`)
    }

    const fullContacts = await fetchFullContactDetails(contacts)
    const contactsData = fullContacts.map(toPlainObject)

    contactsData.forEach((contact) => {
      const contactInfo = transformContact(contact)
      console.log('👤 Contact Data (Fields with values only):', contactInfo)
    })

    return contactsData
  } catch (error) {
    console.error('❌ Failed to load contacts:', error)
    throw error
  }
}
