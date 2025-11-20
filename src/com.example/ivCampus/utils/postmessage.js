/* eslint-disable license-header/header */

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

    const message = {
      type,
      data,
      timestamp: Date.now()
    }

    // Get the origin from iframe src for security
    const iframeSrc = iframe.attr('src')
    if (!iframeSrc) {
      console.warn('⚠️ Iframe src not available for postMessage origin')
      return
    }

    try {
      const origin = new URL(iframeSrc).origin
      iframeWindow.postMessage(message, origin)
      console.log(`✅ Data sent to iframe via postMessage (type: ${type})`)
    } catch (error) {
      console.error('❌ Error getting iframe origin:', error)
      // Fallback: use '*' for same-origin iframes (less secure but functional)
      iframeWindow.postMessage(message, '*')
      console.warn('⚠️ Used wildcard origin for postMessage')
    }
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
