/* eslint-disable license-header/header */

// import { sendDataToBackend } from './backend' // Commented out - using postMessage instead
import { sendOxDataToIframe } from './postmessage'

/**
 * Watch for data changes and send to iframe via postMessage
 * @param {Object} apiEndpoint - API endpoint instance
 * @param {Object} options - Watch options
 * @param {Function} options.fetchFunction - Function to refetch data
 * @param {jQuery} options.iframe - Iframe element for postMessage
 * @param {string} options.userEmail - User email (kept for compatibility, not used)
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
    iframe,
    // userEmail, // Not used - postMessage doesn't need email
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

      if (iframe) {
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

        // Send to iframe via postMessage instead of backend
        sendOxDataToIframe(iframe, dataToSend)
        console.log(`📤 Sent updated ${dataType} data to iframe via postMessage`)

        // Backend sync commented out - using postMessage instead
        // await sendDataToBackend(dataToSend, userEmail)
        // console.log(`📤 Sent updated ${dataType} data to backend`)
      } else {
        console.warn('⚠️ No iframe provided, skipping postMessage')
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
