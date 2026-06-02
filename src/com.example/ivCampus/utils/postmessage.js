/* eslint-disable license-header/header */

import { getBaseUrlOrigin } from '../settings'

/**
 * Send data to iframe via postMessage
 * @param {jQuery} iframe - Iframe element
 * @param {Object} data - Data to send
 * @param {string} type - Message type (e.g., 'ox-data', 'ox-data-update')
 */
export const sendDataToIframe = (iframe, data, type = 'ox-data') => {
  try {
    const iframeWindow = iframe[0]?.contentWindow
    if (!iframeWindow) {
      console.warn('⚠️ Iframe window not available for postMessage')
      return
    }

    const targetOrigin = getBaseUrlOrigin()
    if (!targetOrigin) {
      console.error('postMessage aborted — baseUrl not configured or invalid')
      return
    }

    const message = {
      type,
      data,
      timestamp: Date.now()
    }

    iframeWindow.postMessage(message, targetOrigin)
    console.log(`✅ Data sent to iframe via postMessage (type: ${type})`)
  } catch (error) {
    console.error('❌ Failed to send data to iframe:', error)
  }
}

/**
 * Send calendar, mail, and task data to iframe (excluding contacts)
 * @param {jQuery} iframe - Iframe element
 * @param {Object} allData - All data object
 */
export const sendOxDataToIframe = (iframe, allData) => {
  // Extract only calendar, mail, and tasks (exclude contacts)
  const dataToSend = {
    appointments: allData.appointments,
    mails: allData.mails,
    tasks: allData.tasks
  }

  sendDataToIframe(iframe, dataToSend, 'ox-apps-data')
}
