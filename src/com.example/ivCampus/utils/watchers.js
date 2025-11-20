/* eslint-disable license-header/header */

import { sendDataToBackend } from './backend'

/**
 * Watch for data changes and sync to backend
 * @param {Object} apiEndpoint - API endpoint instance
 * @param {Object} options - Watch options
 * @param {Function} options.fetchFunction - Function to refetch data
 * @param {string} options.userEmail - User email for backend sync
 * @param {Object} options.fetchOptions - Options to pass to fetch function
 * @param {string} options.dataType - Type of data ('calendar', 'mail', 'tasks')
 * @param {Object} options.allData - Current allData object to merge with
 */
export const watchForDataChanges = (apiEndpoint, options = {}) => {
  if (!apiEndpoint || !apiEndpoint.on) {
    console.warn('⚠️ API endpoint does not support event listening')
    return
  }

  const {
    fetchFunction,
    userEmail,
    fetchOptions = {},
    dataType,
    allData = {}
  } = options

  const handleChange = async (event, data) => {
    console.log(`📊 ${dataType || 'Data'} ${event} event detected`)

    try {
      if (!fetchFunction) {
        console.warn(`⚠️ No fetch function provided for ${dataType}`)
        return
      }

      const updatedData = await fetchFunction(apiEndpoint, fetchOptions)
      console.log(`✅ Refetched ${dataType || 'data'}:`, updatedData?.length || 'N/A')

      if (userEmail) {
        const dataToSend = { ...allData }

        const dataTypeMap = {
          calendar: 'appointments',
          mail: 'mails',
          tasks: 'tasks'
        }

        const dataKey = dataTypeMap[dataType]
        if (dataKey) {
          if (dataType === 'tasks') {
            dataToSend.tasks = { ...dataToSend.tasks, all: updatedData }
          } else {
            dataToSend[dataKey] = updatedData
          }
        }

        await sendDataToBackend(dataToSend, userEmail)
        console.log(`📤 Sent updated ${dataType} data to backend`)
      } else {
        console.warn('⚠️ No user email provided, skipping backend sync')
      }
    } catch (error) {
      console.error(`❌ Failed to refetch and send ${dataType} data:`, error)
    }
  }

  const events = ['create', 'update', 'delete', 'change']
  events.forEach((event) => {
    apiEndpoint.on(event, (data) => handleChange(event, data))
  })

  console.log(`👂 Watching for ${dataType || 'data'} changes`)
}
