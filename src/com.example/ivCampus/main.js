/* eslint-disable license-header/header */

import $ from '$/jquery'
import ox from '$/ox'
import { settings } from './settings'
import {
  handleProfileUpdate,
  fetchCalendarAppointments,
  fetchTasks,
  fetchMailMessages,
  // fetchContacts, // Keep for future contact sync; currently not sent via postMessage
  // sendDataToBackend, // Commented out - using postMessage instead
  watchForDataChanges,
  DEFAULT_FETCH_OPTIONS,
  sendOxDataToIframe,
  handleNavigation
} from './utils'
import userApi from '$/io.ox/core/api/user'
import { settings as coreSettings } from '$/io.ox/core/settings'
import calendarApi from '$/io.ox/calendar/api'
import taskAPI from '$/io.ox/tasks/api'
import mailApi from '$/io.ox/mail/api'
// import contactsAPI from '$/io.ox/contacts/api' // Keep for future contact sync

const APP_CONFIG = {
  name: 'app.ivicos-campus/ivCampus',
  id: 'app.ivicos-campus/ivCampus',
  title: 'ivCAMPUS'
}

const app = ox.ui.createApp(APP_CONFIG)
let cleanupDataWatchers = null
const PENDING_LANGUAGE_SYNC_KEY = 'ivCampus.pendingLanguageSync'

/**
 * Build iframe URL with user email and OX language parameters
 * @param {string} baseUrl - Base URL from settings
 * @returns {string}
 */
const buildIframeUrl = (baseUrl) => {
  const url = new URL(baseUrl)
  const userEmail = ox.rampup.user?.email1
  if (userEmail) {
    url.searchParams.set('email', userEmail)
  }

  // const selectedLanguage = ox.language
  // if (selectedLanguage) {
  //   url.searchParams.set('language', selectedLanguage)
  // }

  return url.toString()
}

/**
 * Create and configure iframe element
 * @param {string} src - Iframe source URL
 * @returns {jQuery}
 */
const createIframe = (src) => {
  return $('<iframe>')
    .attr('src', src)
    .attr('allow', 'camera; microphone; autoplay')
    .css({
      width: '100%',
      height: '100%',
      border: 'none'
    })
}

/**
 * Extract successful results from Promise.allSettled results
 * @param {Array} results - Promise.allSettled results
 * @returns {Object}
 */
const extractDataResults = (results) => {
  // Re-enable contacts here if sendOxDataToIframe starts forwarding contacts.
  // const [appointments, mails, allTasks, contacts] = results
  const [appointments, mails, allTasks] = results

  return {
    appointments: appointments.status === 'fulfilled' ? appointments.value : null,
    mails: mails.status === 'fulfilled' ? mails.value : null,
    tasks: {
      all: allTasks.status === 'fulfilled' ? allTasks.value : null
    }
    // contacts: contacts.status === 'fulfilled' ? contacts.value : null
  }
}

/**
 * Log errors from Promise.allSettled results
 * @param {Array} results - Promise.allSettled results
 */
const logFetchErrors = (results) => {
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`❌ Failed to fetch data at index ${index}:`, result.reason)
    }
  })
}

/**
 * Fetch all data sources in parallel
 * @returns {Promise<Array>}
 */
const fetchAllData = () => {
  return Promise.allSettled([
    fetchCalendarAppointments(calendarApi),
    fetchMailMessages(mailApi, DEFAULT_FETCH_OPTIONS.mail),
    fetchTasks(taskAPI, DEFAULT_FETCH_OPTIONS.tasks)
    // fetchContacts(contactsAPI, DEFAULT_FETCH_OPTIONS.contacts)
  ])
}

/**
 * Set up watchers for all data sources
 * @param {jQuery} iframe - Iframe element
 * @param {string} userEmail - User email (kept for compatibility)
 * @param {Object} allData - Current data object
 */
const setupWatchers = (iframe, userEmail, allData) => {
  const watcherConfigs = [
    {
      api: calendarApi,
      fetchFunction: fetchCalendarAppointments,
      fetchOptions: {},
      dataType: 'calendar'
    },
    {
      api: mailApi,
      fetchFunction: fetchMailMessages,
      fetchOptions: DEFAULT_FETCH_OPTIONS.mail,
      dataType: 'mail'
    },
    {
      api: taskAPI,
      fetchFunction: fetchTasks,
      fetchOptions: DEFAULT_FETCH_OPTIONS.tasks,
      dataType: 'tasks'
    }
  ]

  const cleanupWatchers = watcherConfigs.map((config) => {
    return watchForDataChanges(config.api, {
      fetchFunction: config.fetchFunction,
      iframe,
      userEmail,
      fetchOptions: config.fetchOptions,
      dataType: config.dataType,
      allData
    })
  })

  return () => {
    cleanupWatchers.forEach((cleanupWatcher) => {
      if (typeof cleanupWatcher === 'function') cleanupWatcher()
    })
  }
}

/**
 * Handle iframe load event - fetch and send data via postMessage
 * @param {jQuery} iframe - Iframe element
 */
const handleIframeLoad = async (iframe) => {
  console.log('📅 Iframe loaded')
  const userEmail = ox.rampup.user?.email1

  try {
    const results = await fetchAllData()
    const allData = extractDataResults(results)
    logFetchErrors(results)

    // Send data to iframe via postMessage (calendar, mail, tasks only)
    sendOxDataToIframe(iframe, allData)

    // Backend sync commented out - using postMessage instead
    // if (userEmail) {
    //   await sendDataToBackend(allData, userEmail)
    // }

    if (cleanupDataWatchers) {
      cleanupDataWatchers()
      cleanupDataWatchers = null
    }

    if (userEmail) {
      cleanupDataWatchers = setupWatchers(iframe, userEmail, allData)
    } else {
      console.warn('⚠️ No user email found, skipping watchers setup')
    }
  } catch (error) {
    console.error('❌ Error in iframe load handler:', error)
  }
}

/**
 * Update iframe source URL
 * @param {jQuery} iframe - Iframe element
 * @param {string} baseUrl - New base URL
 */
const updateIframeUrl = (iframe, baseUrl) => {
  const newUrl = buildIframeUrl(baseUrl)
  iframe.attr('src', newUrl)
  console.log('🌐 Base URL changed, updating iframe src to:', newUrl)
}

/**
 * Mark language sync as pending until OX applies the new language after reload.
 */
const setupLanguageListener = () => {
  coreSettings.on('change', (attr) => {
    if (attr !== 'language') return
    sessionStorage.setItem(PENDING_LANGUAGE_SYNC_KEY, 'true')
  })
}

/**
 * Sync applied OX language to ivCampus after OX reloads with the new language.
 * @param {jQuery} iframe - Iframe element
 */
const syncLanguageAfterReload = async (iframe) => {
  if (sessionStorage.getItem(PENDING_LANGUAGE_SYNC_KEY) !== 'true') return

  const userEmail = ox.rampup.user?.email1
  if (!userEmail) return

  const updated = await handleProfileUpdate(userEmail, iframe)
  if (updated) sessionStorage.removeItem(PENDING_LANGUAGE_SYNC_KEY)
}

/**
 * Setup settings change listeners
 * @param {jQuery} iframe - Iframe element
 */
const setupSettingsListeners = (iframe) => {
  const settingsHandlers = {
    'change:baseUrl': (newBaseUrl) => updateIframeUrl(iframe, newBaseUrl),
    'change:department': (newDepartment) => console.log('🏢 Department changed to:', newDepartment),
    'change:notifications': (notificationsEnabled) => console.log('🔔 Notifications setting changed to:', notificationsEnabled),
    'change:autoRefresh': (refreshInterval) => console.log('⏰ Auto refresh interval changed to:', refreshInterval, 'seconds'),
    'change:profileUpdateTrigger': () => {
      console.log('📝 Profile update triggered from settings pane')
      const userEmail = ox.rampup.user?.email1
      if (userEmail) handleProfileUpdate(userEmail, iframe)
    }
  }

  Object.entries(settingsHandlers).forEach(([event, handler]) => {
    settings.on(event, handler)
  })
}

/**
 * Setup message listener for navigation requests from iframe
 * @param {jQuery} iframe - Iframe element
 */
const setupMessageListener = (iframe) => {
  const handleMessage = (event) => {
    // Verify origin matches iframe origin for security
    const iframeSrc = iframe.attr('src')
    if (!iframeSrc) return

    try {
      const iframeOrigin = new URL(iframeSrc).origin
      if (event.origin !== iframeOrigin) {
        console.warn('⚠️ Message from unexpected origin:', event.origin)
        return
      }
    } catch (error) {
      console.warn('⚠️ Could not verify message origin:', error)
      return
    }

    // Handle navigation requests
    if (event.data && (event.data.type === 'ox-open-item' || event.data.type === 'ox-add-item')) {
      console.log('🔗 Navigation request received:', event.data.request)
      handleNavigation(event.data)
    }
  }

  window.addEventListener('message', handleMessage)
  console.log('👂 Message listener set up for navigation requests')
}

app.setLauncher(() => {
  const appWindow = ox.ui.createWindow(APP_CONFIG)
  app.setWindow(appWindow)

  const baseUrl = settings.get('baseUrl')
  const iframe = createIframe(buildIframeUrl(baseUrl))

  iframe.on('load', () => handleIframeLoad(iframe))
  setupSettingsListeners(iframe)
  setupLanguageListener()
  setupMessageListener(iframe)
  syncLanguageAfterReload(iframe)

  userApi.on('update', () => {
    console.log('User update event detected')
    const userEmail = ox.rampup.user?.email1
    if (userEmail) handleProfileUpdate(userEmail, iframe)
  })

  appWindow.nodes.main.append(iframe)
  appWindow.show()
})

export default {
  getApp: app.getInstance
}
