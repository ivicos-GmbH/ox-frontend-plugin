/* eslint-disable license-header/header */

import { getStatusText, getPriorityText } from './mappers'
import { toLocalString } from './date-helpers'

/**
 * Convert model to plain object
 * @param {Object} item - Model or plain object
 * @returns {Object}
 */
export const toPlainObject = (item) => {
  return item && typeof item.toJSON === 'function' ? item.toJSON() : item
}

/**
 * Create a field adder that only adds non-empty values
 * @param {Object} target - Target object to add fields to
 * @returns {Function}
 */
export const createFieldAdder = (target) => {
  return (key, value) => {
    if (value === null || value === undefined) return
    if (typeof value === 'string' && value.trim() === '') return
    if (Array.isArray(value) && value.length === 0) return
    target[key] = value
  }
}

/**
 * Fetch full details for items with error handling
 * @param {Array} items - Array of items to fetch
 * @param {Function} fetchFn - Function to fetch full details
 * @returns {Promise<Array>}
 */
export const fetchFullDetails = async (items, fetchFn) => {
  return Promise.all(
    items.map((item) =>
      fetchFn(item).catch((error) => {
        console.warn(`Failed to fetch full details for item ${item.id}:`, error)
        return item
      })
    )
  )
}

/**
 * Transform task data to simplified format
 * @param {Object} taskData - Raw task data
 * @returns {Object}
 */
export const transformTask = (taskData) => {
  const taskInfo = { id: taskData.id }
  const addField = createFieldAdder(taskInfo)

  // Basic fields
  addField('title', taskData.title || 'No title')
  addField('folder', taskData.folder || taskData.folder_id)

  // Status & progress
  addField('status', taskData.status)
  if (taskData.status !== undefined && taskData.status !== null) {
    addField('statusText', getStatusText(taskData.status))
    addField('isDone', taskData.status === 3)
  }
  addField('percentCompleted', taskData.percent_completed || 0)

  // Dates
  addField('startTime', toLocalString(taskData.start_time))
  addField('endTime', toLocalString(taskData.end_time))
  addField('dateCompleted', toLocalString(taskData.date_completed))
  addField('alarm', toLocalString(taskData.alarm))

  // Priority
  if (taskData.priority !== undefined && taskData.priority !== null) {
    addField('priority', taskData.priority)
    addField('priorityText', getPriorityText(taskData.priority))
  }

  // Flags
  if (taskData.private_flag !== undefined) {
    addField('privateFlag', !!taskData.private_flag)
  }
  if (taskData.notification !== undefined) {
    addField('notification', taskData.notification !== false)
  }
  if (taskData.full_time !== undefined) {
    addField('fullTime', taskData.full_time !== false)
  }

  // Description / note
  if (taskData.note) {
    addField('note', taskData.note)
    addField('description', taskData.note)
  }

  // Participants
  const participants = taskData.participants || []
  if (participants.length > 0) {
    addField('participants', participants)
    addField('participantsCount', participants.length)
  }
  addField('createdBy', taskData.created_by)
  addField('createdFrom', taskData.created_from)

  // Categories
  const categories = taskData.categories || []
  if (categories.length > 0) {
    addField('categories', categories)
  }

  // Recurrence
  const recurrenceType = taskData.recurrence_type || 0
  if (recurrenceType > 0) {
    addField('recurrenceType', recurrenceType)
    addField('recurrenceDays', taskData.days || null)
    addField('recurrenceDayInMonth', taskData.day_in_month || null)
    addField('recurrenceMonth', taskData.month || null)
    addField('isRecurring', true)
  }

  // Attachments
  const attachments = taskData.attachments || []
  if (attachments.length > 0) {
    addField('attachments', attachments)
    addField('attachmentsCount', attachments.length)
  }

  // Metadata
  addField('lastModified', taskData.last_modified)
  addField('timestamp', taskData.timestamp)

  return taskInfo
}

/**
 * Transform contact data to simplified format
 * @param {Object} contactData - Raw contact data
 * @returns {Object}
 */
export const transformContact = (contactData) => {
  const contactInfo = {
    id: contactData.id,
    folder: contactData.folder || contactData.folder_id
  }
  const addField = createFieldAdder(contactInfo)

  // Name fields
  addField('displayName', contactData.display_name || contactData[20])
  addField('firstName', contactData.first_name || contactData[500])
  addField('lastName', contactData.last_name || contactData[501])
  addField('secondName', contactData.second_name)
  addField('suffix', contactData.suffix)
  addField('title', contactData.title)
  addField('nickname', contactData.nickname)

  // Company/Business fields
  addField('company', contactData.company || contactData[502])
  addField('department', contactData.department)
  addField('position', contactData.position)
  addField('profession', contactData.profession)
  addField('roomNumber', contactData.room_number)
  addField('employeeType', contactData.employee_type)
  addField('managerName', contactData.manager_name)
  addField('assistantName', contactData.assistant_name)

  // Email fields
  addField('email1', contactData.email1 || contactData[501])
  addField('email2', contactData.email2)
  addField('email3', contactData.email3)

  // Phone fields
  addField('cellularTelephone1', contactData.cellular_telephone1)
  addField('cellularTelephone2', contactData.cellular_telephone2)
  addField('telephoneBusiness1', contactData.telephone_business1)
  addField('telephoneBusiness2', contactData.telephone_business2)
  addField('telephoneHome1', contactData.telephone_home1)
  addField('telephoneHome2', contactData.telephone_home2)
  addField('telephoneOther', contactData.telephone_other)
  addField('telephoneCompany', contactData.telephone_company)
  addField('telephoneCar', contactData.telephone_car)
  addField('telephoneAssistant', contactData.telephone_assistant)
  addField('faxBusiness', contactData.fax_business)
  addField('faxHome', contactData.fax_home)
  addField('faxOther', contactData.fax_other)

  // Address fields - Home
  addField('streetHome', contactData.street_home)
  addField('postalCodeHome', contactData.postal_code_home)
  addField('cityHome', contactData.city_home)
  addField('stateHome', contactData.state_home)
  addField('countryHome', contactData.country_home)

  // Address fields - Business
  addField('streetBusiness', contactData.street_business)
  addField('postalCodeBusiness', contactData.postal_code_business)
  addField('cityBusiness', contactData.city_business)
  addField('stateBusiness', contactData.state_business)
  addField('countryBusiness', contactData.country_business)

  // Address fields - Other
  addField('streetOther', contactData.street_other)
  addField('postalCodeOther', contactData.postal_code_other)
  addField('cityOther', contactData.city_other)
  addField('stateOther', contactData.state_other)
  addField('countryOther', contactData.country_other)

  // Personal fields
  addField('birthday', contactData.birthday)
  addField('anniversary', contactData.anniversary)
  addField('maritalStatus', contactData.marital_status)
  addField('spouseName', contactData.spouse_name)
  addField('numberOfChildren', contactData.number_of_children)
  addField('url', contactData.url)

  // Other fields
  addField('note', contactData.note)
  addField('categories', contactData.categories)
  addField('attachments', contactData.attachments)
  addField('privateFlag', contactData.private_flag)
  addField('distributionList', contactData.distribution_list)

  return contactInfo
}
