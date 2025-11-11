/* eslint-disable license-header/header */

import { getGabId } from '$/io.ox/contacts/util'
import moment from 'moment'

export const handleProfileUpdate = async (email, iframe) => {
  try {
    const response = await fetch(`https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/get_updated_ox_user?email=${email}`)
    const data = await response.json()
    if (data.success) {
      const currentSrc = iframe.attr('src')
      iframe.attr('src', currentSrc)
    } else {
      console.error('Error updating user data:', data.error)
    }
  } catch (error) {
    console.error('Error updating user data:', error)
  }
}

// export const getDay = (dayNumber = 0) => {
//   const now = new Date()
//   const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

//   startOfDay.setDate(startOfDay.getDate() + dayNumber)
//   return startOfDay
// }

export const getStatusText = (status) => {
  const statusMap = {
    1: 'Not started',
    2: 'In progress',
    3: 'Done',
    4: 'Waiting',
    5: 'Deferred'
  }
  return statusMap[status] || 'Unknown'
}

export const getPriorityText = (priority) => {
  const priorityMap = {
    1: 'Low',
    2: 'Normal',
    3: 'High'
  }
  return priorityMap[priority] || 'Normal'
}

// ============================================
// CALENDAR
// ============================================
export const fetchCalendarAppointments = (calendarApi, startDays = 0, endDays = 30) => {
  if (!calendarApi) {
    throw new Error('Calendar API is required')
  }

  const collection = calendarApi.getCollection({
    start: moment().startOf('day').valueOf(),
    end: moment().endOf('day').add(30, 'days').valueOf()
  })

  return collection.sync().then(function (data) {
    // Fetch full details for each appointment
    const promises = collection.map(function (model) {
      return calendarApi.get({
        folder: model.get('folder'),
        id: model.get('id')
      })
    })

    return Promise.all(promises)
  }).then(function (fullAppointments) {
    // Convert models to plain objects and add some formatting
    fullAppointments.forEach(function (model) {
      const appointment = model.toJSON()
      console.log('📅 Full Appointment Details:', appointment)
    })
  }).catch(function (error) {
    console.error('❌ Failed to load calendar appointments:', error)
    throw error // Re-throw so caller can handle it
  })
}

// ============================================
// MAIL
// ============================================

export const fetchMailMessages = (mailApi, options = {}) => {
  if (!mailApi) {
    throw new Error('Mail API is required')
  }

  const {
    folder = mailApi.getDefaultFolder(), // or 'default0/INBOX'
    limit = 50,
    sort = '661', // received_date
    order = 'desc'
  } = options

  return mailApi.getAll({
    folder,
    sort,
    order,
    max: limit
  }).then(function (mails) {
    console.log(`📧 Found ${mails.length} mail messages`)

    // Fetch full details for each mail (optional - getAll already returns good data)
    const promises = mails.map(function (mail) {
      // Only fetch full details if needed (getAll returns summary data)
      if (options.fetchFullDetails) {
        return mailApi.get({
          folder: mail.folder || folder,
          id: mail.id
        })
      }
      return Promise.resolve(mail)
    })

    return Promise.all(promises)
  }).then(function (fullMails) {
    fullMails.forEach(function (mail) {
      // If it's a model, convert to JSON; otherwise it's already an object
      const mailData = mail.toJSON ? mail.toJSON() : mail

      console.log('📧 Mail Details:', {
        id: mailData.id,
        subject: mailData.subject || 'No subject',
        from: mailData.from?.[0]?.[1] || mailData.from?.[0]?.[0] || 'Unknown sender',
        date: new Date(mailData.date).toLocaleString(),
        folder: mailData.folder,
        flags: mailData.flags,
        attachments: mailData.attachments?.length || 0,
        // Show all available fields
        allFields: Object.keys(mailData)
      })
    })

    return fullMails.map(m => m.toJSON ? m.toJSON() : m)
  }).catch(function (error) {
    console.error('❌ Failed to load mail messages:', error)
    throw error
  })
}

// ============================================
// TASKS
// ============================================

export const fetchTasks = async (taskAPI, options = {}) => {
  if (!taskAPI) {
    throw new Error('Tasks API is required')
  }

  const defaultFolder = taskAPI.getDefaultFolder()

  const {
    excludeDelegatedToOthers = false, // See explanation below
    folder = defaultFolder,
    searchQuery = null,      // Search support
    searchStartDate = null,  // Optional: start date for search range
    searchEndDate = null,    // Optional: end date for search range
    useMyTasks = true,       // Controls "my tasks" vs folder
  } = options

  /**
   * excludeDelegatedToOthers explanation:
   * - true:  Only returns tasks YOU created that have NO participants (not delegated)
   * - false: Returns tasks YOU created (even if delegated to others)
   *          PLUS tasks that were delegated TO YOU by others
   */

  const toPlainTask = (task) =>
    task && typeof task.toJSON === 'function' ? task.toJSON() : task

  const fetchFullTasks = (tasks, defaultFolderForGet) =>
    Promise.all(
      tasks.map((task) =>
        taskAPI
          .get({
            folder: task.folder || task.folder_id || defaultFolderForGet,
            id: task.id,
          })
          .catch((error) => {
            console.warn(`Failed to fetch full details for task ${task.id}:`, error)
            return task
          })
      )
    )

  const toLocalString = (date) =>
    date ? new Date(date).toLocaleString() : null

  const mapTaskToInfo = (taskData) => {
    const taskInfo = {
      // Always keep id
      id: taskData.id,
    }

    // Only keep fields that actually have a value
    const addFieldIfValue = (key, value) => {
      if (value === null || value === undefined) return
      if (typeof value === 'string' && value.trim() === '') return
      if (Array.isArray(value) && value.length === 0) return
      taskInfo[key] = value
    }

    // Basic fields
    addFieldIfValue('title', taskData.title || 'No title')
    addFieldIfValue('folder', taskData.folder || taskData.folder_id)

    // Status & progress
    addFieldIfValue('status', taskData.status)
    if (taskData.status !== undefined && taskData.status !== null) {
      addFieldIfValue('statusText', getStatusText(taskData.status))
      addFieldIfValue('isDone', taskData.status === 3)
    }
    addFieldIfValue('percentCompleted', taskData.percent_completed || 0)

    // Dates
    addFieldIfValue('startTime', toLocalString(taskData.start_time))
    addFieldIfValue('endTime', toLocalString(taskData.end_time))
    addFieldIfValue('dateCompleted', toLocalString(taskData.date_completed))
    addFieldIfValue('alarm', toLocalString(taskData.alarm))

    // Priority (1=Low, 2=Normal, 3=High)
    if (taskData.priority !== undefined && taskData.priority !== null) {
      addFieldIfValue('priority', taskData.priority)
      addFieldIfValue('priorityText', getPriorityText(taskData.priority))
    }

    // Flags
    if (taskData.private_flag !== undefined) {
      addFieldIfValue('privateFlag', !!taskData.private_flag)
    }
    if (taskData.notification !== undefined) {
      addFieldIfValue('notification', taskData.notification !== false)
    }
    if (taskData.full_time !== undefined) {
      addFieldIfValue('fullTime', taskData.full_time !== false)
    }

    // Description / note
    if (taskData.note) {
      addFieldIfValue('note', taskData.note)
      addFieldIfValue('description', taskData.note) // alias
    }

    // Participants
    const participants = taskData.participants || []
    if (participants.length > 0) {
      addFieldIfValue('participants', participants)
      addFieldIfValue('participantsCount', participants.length)
    }
    addFieldIfValue('createdBy', taskData.created_by)
    addFieldIfValue('createdFrom', taskData.created_from)

    // Categories
    const categories = taskData.categories || []
    if (categories.length > 0) {
      addFieldIfValue('categories', categories)
    }

    // Recurrence
    const recurrenceType = taskData.recurrence_type || 0
    if (recurrenceType > 0) {
      addFieldIfValue('recurrenceType', recurrenceType)
      addFieldIfValue('recurrenceDays', taskData.days || null)
      addFieldIfValue('recurrenceDayInMonth', taskData.day_in_month || null)
      addFieldIfValue('recurrenceMonth', taskData.month || null)
      addFieldIfValue('isRecurring', true)
    }

    // Attachments
    const attachments = taskData.attachments || []
    if (attachments.length > 0) {
      addFieldIfValue('attachments', attachments)
      addFieldIfValue('attachmentsCount', attachments.length)
    }

    // Metadata
    addFieldIfValue('lastModified', taskData.last_modified)
    addFieldIfValue('timestamp', taskData.timestamp)

    console.log('✅ Task Details (Fields with values only):', taskInfo)
    return taskInfo
  }

  try {
    let tasks

    // Option 1: Search tasks
    if (searchQuery) {
      const searchParams = {
        pattern: searchQuery,
      }

      // Respect custom folder (only if not default)
      if (folder && folder !== defaultFolder) {
        searchParams.folder = folder
      }

      if (searchStartDate) searchParams.start = searchStartDate
      if (searchEndDate) searchParams.end = searchEndDate

      tasks = await taskAPI.search(searchParams)
      console.log(`🔍 Found ${tasks.length} tasks matching "${searchQuery}"`)
    } else if (useMyTasks !== false) {
      // Option 2: Get all my tasks (recommended)
      tasks = await taskAPI.getAllMyTasks({ excludeDelegatedToOthers })
      console.log(
        `✅ Found ${tasks.length} tasks (excludeDelegatedToOthers: ${excludeDelegatedToOthers})`
      )
    } else {
      // Option 3: Get tasks from specific folder
      tasks = await taskAPI.getAll({
        folder,
        sort: '317', // end_time
        order: 'asc',
      })
      console.log(`✅ Found ${tasks.length} tasks from folder ${folder}`)
    }

    const fullTasks = await fetchFullTasks(tasks, folder)
    const tasksData = fullTasks.map(toPlainTask).map(mapTaskToInfo)

    return tasksData
  } catch (error) {
    console.error('❌ Failed to load tasks:', error)
    throw error
  }
}

// ============================================
// CONTACTS / ADDRESS BOOK
// ============================================
export const fetchContacts = async (contactsAPI, options = {}) => {
  if (!contactsAPI) {
    throw new Error('Contacts API is required')
  }

  const {
    folder = getGabId(),
    searchQuery = null,
    limit = 100,
  } = options

  const toPlainObject = (contact) =>
    contact && typeof contact.toJSON === 'function'
      ? contact.toJSON()
      : contact

  const fetchFullContacts = (contacts, defaultFolder) =>
    Promise.all(
      contacts.map((contact) =>
        contactsAPI
          .get({
            folder: contact.folder || contact.folder_id || defaultFolder,
            id: contact.id,
          })
          .catch((error) => {
            console.warn(`Failed to fetch full details for contact ${contact.id}:`, error)
            return contact
          })
      )
    )

  const mapContactToInfo = (contactData) => {
    const contactInfo = {
      id: contactData.id,
      folder: contactData.folder || contactData.folder_id,
    }

    const addFieldIfValue = (key, value) => {
      if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        contactInfo[key] = value
      }
    }

    // Name fields
    addFieldIfValue('displayName', contactData.display_name || contactData[20])
    addFieldIfValue('firstName', contactData.first_name || contactData[500])
    addFieldIfValue('lastName', contactData.last_name || contactData[501])
    addFieldIfValue('secondName', contactData.second_name)
    addFieldIfValue('suffix', contactData.suffix)
    addFieldIfValue('title', contactData.title)
    addFieldIfValue('nickname', contactData.nickname)

    // Company/Business fields
    addFieldIfValue('company', contactData.company || contactData[502])
    addFieldIfValue('department', contactData.department)
    addFieldIfValue('position', contactData.position)
    addFieldIfValue('profession', contactData.profession)
    addFieldIfValue('roomNumber', contactData.room_number)
    addFieldIfValue('employeeType', contactData.employee_type)
    addFieldIfValue('managerName', contactData.manager_name)
    addFieldIfValue('assistantName', contactData.assistant_name)

    // Email fields
    addFieldIfValue('email1', contactData.email1 || contactData[501])
    addFieldIfValue('email2', contactData.email2)
    addFieldIfValue('email3', contactData.email3)

    // Phone fields
    addFieldIfValue('cellularTelephone1', contactData.cellular_telephone1)
    addFieldIfValue('cellularTelephone2', contactData.cellular_telephone2)
    addFieldIfValue('telephoneBusiness1', contactData.telephone_business1)
    addFieldIfValue('telephoneBusiness2', contactData.telephone_business2)
    addFieldIfValue('telephoneHome1', contactData.telephone_home1)
    addFieldIfValue('telephoneHome2', contactData.telephone_home2)
    addFieldIfValue('telephoneOther', contactData.telephone_other)
    addFieldIfValue('telephoneCompany', contactData.telephone_company)
    addFieldIfValue('telephoneCar', contactData.telephone_car)
    addFieldIfValue('telephoneAssistant', contactData.telephone_assistant)
    addFieldIfValue('faxBusiness', contactData.fax_business)
    addFieldIfValue('faxHome', contactData.fax_home)
    addFieldIfValue('faxOther', contactData.fax_other)

    // Address fields - Home
    addFieldIfValue('streetHome', contactData.street_home)
    addFieldIfValue('postalCodeHome', contactData.postal_code_home)
    addFieldIfValue('cityHome', contactData.city_home)
    addFieldIfValue('stateHome', contactData.state_home)
    addFieldIfValue('countryHome', contactData.country_home)

    // Address fields - Business
    addFieldIfValue('streetBusiness', contactData.street_business)
    addFieldIfValue('postalCodeBusiness', contactData.postal_code_business)
    addFieldIfValue('cityBusiness', contactData.city_business)
    addFieldIfValue('stateBusiness', contactData.state_business)
    addFieldIfValue('countryBusiness', contactData.country_business)

    // Address fields - Other
    addFieldIfValue('streetOther', contactData.street_other)
    addFieldIfValue('postalCodeOther', contactData.postal_code_other)
    addFieldIfValue('cityOther', contactData.city_other)
    addFieldIfValue('stateOther', contactData.state_other)
    addFieldIfValue('countryOther', contactData.country_other)

    // Personal fields
    addFieldIfValue('birthday', contactData.birthday)
    addFieldIfValue('anniversary', contactData.anniversary)
    addFieldIfValue('maritalStatus', contactData.marital_status)
    addFieldIfValue('spouseName', contactData.spouse_name)
    addFieldIfValue('numberOfChildren', contactData.number_of_children)
    addFieldIfValue('url', contactData.url)

    // Other fields
    addFieldIfValue('note', contactData.note)
    addFieldIfValue('categories', contactData.categories)
    addFieldIfValue('attachments', contactData.attachments)
    addFieldIfValue('privateFlag', contactData.private_flag)
    addFieldIfValue('distributionList', contactData.distribution_list)

    console.log('👤 Contact Data (Fields with values only):', contactInfo)
    return contactInfo
  }

  try {
    let contacts

    if (searchQuery) {
      contacts = await contactsAPI.advancedsearch(searchQuery, {
        folders: folder ? [folder] : undefined,
        limit: limit || 0,
      })
      console.log(`👤 Found ${contacts.length} contacts matching "${searchQuery}"`)
    } else {
      contacts = await contactsAPI.getAll({
        folder,
        sort: '607',
        order: 'asc',
      })
      console.log(`👤 Found ${contacts.length} contacts`)
    }

    const fullContacts = await fetchFullContacts(contacts, folder)
    const contactsData = fullContacts.map(toPlainObject)

    // still log the filtered view, but return the full data
    contactsData.forEach(mapContactToInfo)

    return contactsData
  } catch (error) {
    console.error('❌ Failed to load contacts:', error)
    throw error
  }
}
