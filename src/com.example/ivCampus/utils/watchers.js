/* eslint-disable license-header/header */

// import { sendDataToBackend } from './backend' // Commented out - using postMessage instead
import { sendOxDataToIframe } from './postmessage'
import { toPlainObject, transformTask } from './data-transformers'
import { overlapsToday } from './date-helpers'

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
    console.log(`📊 ${dataType || 'Data'} ${event} event detected`, data)

    try {
      if (!fetchFunction) {
        console.warn(`⚠️ No fetch function provided for ${dataType}`)
        return
      }

      const updatedData = await fetchFunction(apiEndpoint, fetchOptions)

      // For create events, the collection might not include the new item yet
      // Fetch the specific item from event data and merge it
      if (event === 'create') {
        try {
          // Extract item data from event - different APIs structure events differently
          let itemId = null
          let itemFolder = null

          if (dataType === 'calendar') {
            // Calendar events pass the appointment object directly
            if (data?.id && data?.folder) {
              itemId = data.id
              itemFolder = data.folder
            }
          } else if (dataType === 'tasks') {
            // Task events: data might be the model directly, or a jQuery event object
            // Check if data itself is a model (has get/toJSON methods)
            let model = null

            if (data && typeof data.get === 'function') {
              // Data is a Backbone model
              model = data
            } else if (data && typeof data.toJSON === 'function') {
              // Data is a model with toJSON
              model = data
            } else if (data?.model) {
              // Model is nested in event object
              model = data.model
            } else if (data?.target && typeof data.target.get === 'function') {
              // Model is in target
              model = data.target
            } else if (data?.result && data.result.then) {
              // Model might be in a Promise result - try to get it
              try {
                const result = await data.result
                if (result && (typeof result.get === 'function' || typeof result.toJSON === 'function')) {
                  model = result
                }
              } catch (e) {
                // Promise might have failed, ignore
              }
            }

            if (model) {
              let modelData
              if (typeof model.toJSON === 'function') {
                modelData = model.toJSON()
              } else if (typeof model.get === 'function') {
                modelData = {
                  id: model.get('id'),
                  folder: model.get('folder') || model.get('folder_id'),
                  folder_id: model.get('folder_id')
                }
              } else {
                modelData = model
              }
              itemId = modelData?.id
              itemFolder = modelData?.folder || modelData?.folder_id
              console.log(`🔍 Extracted task data from event: id=${itemId}, folder=${itemFolder}`)
            } else if (data?.id) {
              // Fallback: event data might have id directly
              itemId = data.id
              itemFolder = data.folder || data.folder_id
              console.log(`🔍 Using task data directly from event: id=${itemId}, folder=${itemFolder}`)
            } else {
              console.warn('⚠️ Could not find task model in event data. Event keys:', Object.keys(data || {}))
              console.warn('⚠️ Event data type:', typeof data, 'has get:', typeof data?.get, 'has toJSON:', typeof data?.toJSON)
            }
          } else if (dataType === 'mail') {
            // Mail events might pass the mail object directly or as a model
            const model = data?.model || data?.target || data
            if (model) {
              const modelData = typeof model.toJSON === 'function' ? model.toJSON() : model
              itemId = modelData?.id || modelData?.get?.('id')
              itemFolder = modelData?.folder || modelData?.get?.('folder')
            }
          }

          if (itemId && itemFolder) {
            // Add a small delay to allow collection to sync
            await new Promise(resolve => setTimeout(resolve, 200))

            // Fetch the specific item that was just created
            const createdItem = await apiEndpoint.get({
              folder: itemFolder,
              id: itemId
            })

            const createdItemData = typeof createdItem.toJSON === 'function' ? createdItem.toJSON() : createdItem
            console.log(`📦 Fetched created ${dataType} item:`, createdItemData)

            // For tasks, we need to transform the data to match the fetched format
            if (dataType === 'tasks') {
              const plainTask = toPlainObject(createdItemData)
              const startTime = plainTask.start_time ? new Date(plainTask.start_time).getTime() : null
              const endTime = plainTask.end_time ? new Date(plainTask.end_time).getTime() : null
              // Only include if it overlaps today (matching fetchTasks filter)
              if (overlapsToday(startTime, endTime)) {
                const transformedTask = transformTask(plainTask)
                const existingIndex = updatedData.findIndex(item => item.id === itemId)
                if (existingIndex >= 0) {
                  updatedData[existingIndex] = transformedTask
                  console.log('🔄 Replaced existing task in fetched data')
                } else {
                  updatedData.push(transformedTask)
                  console.log('➕ Added created task to fetched data')
                }
              } else {
                console.log('⏭️ Created task does not overlap today, skipping')
              }
            } else {
              // For calendar and mail, use the fetched data directly
              const existingIndex = updatedData.findIndex(item => item.id === itemId)
              if (existingIndex >= 0) {
                updatedData[existingIndex] = createdItemData
                console.log(`🔄 Replaced existing ${dataType} item in fetched data`)
              } else {
                updatedData.push(createdItemData)
                console.log(`➕ Added created ${dataType} item to fetched data`)
              }
            }
          } else {
            console.warn(`⚠️ Could not extract id/folder from ${dataType} create event data`)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch created ${dataType} item:`, error)
        }
      }

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
    // Some APIs (like tasks) pass the model as a separate argument
    // Accept multiple arguments to handle both cases
    apiEndpoint.on(event, (...args) => {
      // First arg is usually the event object, second might be the model
      const eventData = args[0]
      const model = args[1] || eventData?.model || eventData?.target
      handleChange(event, model || eventData)
    })
  })

  console.log(`👂 Watching for ${dataType || 'data'} changes`)
}
