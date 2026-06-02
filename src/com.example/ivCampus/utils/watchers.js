/* eslint-disable license-header/header */

// import { sendDataToBackend } from './backend' // Commented out - using postMessage instead
import { sendOxDataToIframe } from './postmessage'
import { toPlainObject, transformMail, transformTask } from './data-transformers'
import { overlapsToday } from './date-helpers'

const getMailKey = (mail) => {
  const id = mail?.id
  const folder = mail?.folder_id || mail?.folder
  return id == null || !folder ? null : `${folder}:${id}`
}

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

  const registeredHandlers = []
  const recentlyDeletedMailKeys = new Set()

  const registerHandler = (event, handler) => {
    apiEndpoint.on(event, handler)
    registeredHandlers.push({ event, handler })
  }

  const removeRecentlyDeletedMails = (mails) => {
    if (dataType !== 'mail' || recentlyDeletedMailKeys.size === 0 || !Array.isArray(mails)) return mails
    return mails.filter((mail) => {
      const mailKey = getMailKey(mail)
      return !mailKey || !recentlyDeletedMailKeys.has(mailKey)
    })
  }

  const rememberDeletedMails = (deletedMails = []) => {
    if (dataType !== 'mail') return
    const mailKeys = deletedMails
      .map(getMailKey)
      .filter(Boolean)

    if (mailKeys.length === 0) return

    mailKeys.forEach((mailKey) => recentlyDeletedMailKeys.add(mailKey))
    setTimeout(() => {
      mailKeys.forEach((mailKey) => recentlyDeletedMailKeys.delete(mailKey))
    }, 15000)
  }

  const extractItemInfo = (data) => {
    let itemId = null
    let itemFolder = null

    if (dataType === 'calendar') {
      if (data?.id && data?.folder) {
        itemId = data.id
        itemFolder = data.folder
      }
    } else if (dataType === 'tasks') {
      let model = null
      if (data && typeof data.get === 'function' && !Array.isArray(data.models)) {
        model = data
      } else if (data && typeof data.toJSON === 'function' && !Array.isArray(data.models)) {
        model = data
      } else if (data?.model) {
        model = data.model
      } else if (data?.target && typeof data.target.get === 'function') {
        model = data.target
      }

      if (model) {
        const modelData = typeof model.toJSON === 'function' ? model.toJSON() : { id: model.get?.('id'), folder: model.get?.('folder') || model.get?.('folder_id') }
        itemId = modelData?.id
        itemFolder = modelData?.folder || modelData?.folder_id
      } else if (data?.id) {
        itemId = data.id
        itemFolder = data.folder || data.folder_id
      }
    } else if (dataType === 'mail') {
      const model = data?.model || data?.target || data
      if (model) {
        const modelData = typeof model.toJSON === 'function' ? model.toJSON() : model
        itemId = modelData?.id
        itemFolder = modelData?.folder || modelData?.folder_id
      }
    }

    return { itemId, itemFolder }
  }

  // For 'create': add the new item directly to allData without replacing the whole list.
  // Replacing the list with a fresh fetch is unsafe because the OX collection may not have
  // indexed the new item yet, and any previously-created items that were also manually merged
  // would disappear from the list.
  const handleCreate = async (data) => {
    const { itemId, itemFolder } = extractItemInfo(data)

    if (!itemId || !itemFolder) {
      console.warn(`⚠️ Could not extract id/folder from ${dataType} create event, falling back to full refetch`)
      await handleRefetch()
      return
    }

    // Wait for the OX collection to index the new item before fetching it
    await new Promise(resolve => setTimeout(resolve, 200))

    const createdItem = await apiEndpoint.get({ folder: itemFolder, id: itemId })
    const createdItemData = typeof createdItem.toJSON === 'function' ? createdItem.toJSON() : createdItem
    // console.log(`📦 Fetched created ${dataType} item:`, createdItemData)

    if (dataType === 'tasks') {
      const plainTask = toPlainObject(createdItemData)
      const startTime = plainTask.start_time ? new Date(plainTask.start_time).getTime() : null
      const endTime = plainTask.end_time ? new Date(plainTask.end_time).getTime() : null
      if (!overlapsToday(startTime, endTime)) {
        console.log('⏭️ Created task does not overlap today, skipping')
        return
      }
      const transformedTask = transformTask(plainTask)
      const currentList = allData.tasks?.all ? [...allData.tasks.all] : []
      const existingIndex = currentList.findIndex(item => String(item.id) === String(itemId))
      if (existingIndex >= 0) {
        currentList[existingIndex] = transformedTask
      } else {
        currentList.push(transformedTask)
      }
      allData.tasks = { ...(allData.tasks || {}), all: currentList }
    } else if (dataType === 'mail') {
      const itemToAdd = transformMail(toPlainObject(createdItemData))
      const currentList = Array.isArray(allData.mails) ? [...allData.mails] : []
      const existingIndex = currentList.findIndex(item => String(item.id) === String(itemId))
      if (existingIndex >= 0) {
        currentList[existingIndex] = itemToAdd
      } else {
        currentList.push(itemToAdd)
      }
      allData.mails = currentList
    } else if (dataType === 'calendar') {
      const currentList = Array.isArray(allData.appointments) ? [...allData.appointments] : []
      const existingIndex = currentList.findIndex(item => String(item.id) === String(itemId))
      if (existingIndex >= 0) {
        currentList[existingIndex] = createdItemData
      } else {
        currentList.push(createdItemData)
      }
      allData.appointments = currentList
    }

    if (iframe) {
      sendOxDataToIframe(iframe, { ...allData })
      // const tasksCount = allData.tasks?.all?.length || 0
      // const appointmentsCount = allData.appointments?.length || 0
      // const mailsCount = allData.mails?.length || 0
      // console.log(`➕ Added created ${dataType} item to iframe data: ${tasksCount} tasks, ${appointmentsCount} appointments, ${mailsCount} mails`)
    }
  }

  // For 'update'/'delete': full refetch to sync the latest state from the API.
  const handleRefetch = async () => {
    let updatedData = await fetchFunction(apiEndpoint, fetchOptions)
    updatedData = removeRecentlyDeletedMails(updatedData)

    // console.log(`✅ Refetched ${dataType || 'data'}:`, updatedData?.length || 'N/A')

    if (!iframe) {
      console.warn('⚠️ No iframe provided, skipping postMessage')
      return
    }

    const dataTypeMap = { calendar: 'appointments', mail: 'mails', tasks: 'tasks' }
    const dataKey = dataTypeMap[dataType]
    if (dataKey) {
      if (dataType === 'tasks') {
        allData.tasks = allData.tasks ? { ...allData.tasks, all: updatedData } : { all: updatedData }
      } else {
        allData[dataKey] = Array.isArray(updatedData) ? updatedData : (updatedData || [])
      }
    }

    sendOxDataToIframe(iframe, { ...allData })
    // const tasksCount = allData.tasks?.all?.length || 0
    // const appointmentsCount = allData.appointments?.length || 0
    // const mailsCount = allData.mails?.length || 0
    // console.log(`📤 Sent updated ${dataType} data to iframe via postMessage: ${tasksCount} tasks, ${appointmentsCount} appointments, ${mailsCount} mails`)
  }

  const handleChange = async (event, data) => {
    // console.log(`📊 ${dataType || 'Data'} ${event} event detected`, data)

    try {
      if (event === 'create') {
        await handleCreate(data)
      } else {
        if (!fetchFunction) {
          console.warn(`⚠️ No fetch function provided for ${dataType}`)
          return
        }
        await handleRefetch()
      }
    } catch (error) {
      console.error(`❌ Failed to refetch and send ${dataType} data:`, error)
    }
  }

  // 'change' is intentionally excluded: it fires concurrently with 'create' and triggers a
  // full refetch that can return stale data (new item not yet indexed), overwriting the
  // correctly-merged item that the 'create' handler just added.
  const events = ['create', 'update', 'delete']
  events.forEach((event) => {
    registerHandler(event, (...args) => {
      // Backbone fires events as (model, collection?, options?) — args[0] is the model
      const first = args[0]
      const second = args[1]
      const isBackboneModel = (obj) => obj && !Array.isArray(obj?.models) &&
        (typeof obj.get === 'function' || typeof obj.toJSON === 'function')
      const modelArg = isBackboneModel(first) ? first : (isBackboneModel(second) ? second : first)
      handleChange(event, modelArg)
    })
  })

  if (dataType === 'mail') {
    registerHandler('deleted-mails', (...args) => {
      const deletedMails = args.find(Array.isArray) || []
      rememberDeletedMails(deletedMails)
      allData.mails = removeRecentlyDeletedMails(allData.mails || [])
      if (iframe) sendOxDataToIframe(iframe, { ...allData })
      // console.log(`📤 Removed ${deletedMails?.length || 0} deleted mails from iframe data`)
    })
  }

  // console.log(`👂 Watching for ${dataType || 'data'} changes`)

  return () => {
    if (typeof apiEndpoint.off !== 'function') return
    registeredHandlers.forEach(({ event, handler }) => {
      apiEndpoint.off(event, handler)
    })
  }
}
