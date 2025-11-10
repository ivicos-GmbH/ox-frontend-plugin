/* eslint-disable license-header/header */

/**
 * Utility functions for ivCAMPUS plugin
 *
 * This module contains helper functions for:
 * - Communicating with the embedded iframe via postMessage API
 * - Sending user data to the iframe for initialization
 * - Handling profile updates between OX and ivCAMPUS
 */

/**
 * Sends a message to the embedded iframe using the postMessage API
 * This enables cross-origin communication between OX and the ivCAMPUS application
 *
 * @param {jQuery} iframe - jQuery-wrapped iframe element
 * @param {Object} message - Message object to send to the iframe
 * @param {string} baseUrl - Base URL of the iframe for origin validation
 */
export const sendMessageToIframe = (iframe, message, baseUrl) => {
  const iframeElement = iframe[0]
  if (iframeElement && iframeElement.contentWindow) {
    try {
      iframeElement.contentWindow.postMessage(message, baseUrl)
      console.log('Message sent to iframe:', message)
    } catch (error) {
      console.error('Error sending message to iframe:', error)
    }
  } else {
    console.warn('Iframe not ready for messaging')
  }
}

/**
 * Prepares and sends user data to the iframe for initialization
 * This data includes user profile information and session details needed by ivCAMPUS
 *
 * @param {Object} userInfo - OX user information object
 * @param {Object} session - OX session object containing authentication details
 * @param {jQuery} iframe - jQuery-wrapped iframe element
 * @param {string} baseUrl - Base URL of the iframe
 */
export const sendUserData = (userInfo, session, iframe, baseUrl) => {
  // Prepare user data payload for the iframe
  const userData = {
    type: 'USER_DATA', // Message type identifier
    user: {
      id: userInfo.uid, // User ID from OX
      name: userInfo.display_name, // Display name
      mail: userInfo.email1, // Primary email address
      loginInfo: userInfo.login_info, // Login information
      language: userInfo.locale, // User language preference
    },
    session, // Full session object for authentication
    timestamp: new Date().toISOString() // Timestamp for message freshness
  }

  // Send the prepared user data to the iframe
  sendMessageToIframe(iframe, userData, baseUrl)
}

/**
 * Handles profile updates by fetching updated user data from ivCAMPUS API
 * and refreshing the iframe to sync the latest user information
 *
 * @param {string} email - User's email address to identify the profile
 * @param {jQuery} iframe - jQuery-wrapped iframe element to refresh
 */
export const handleProfileUpdate = async (email, iframe) => {
  console.log('🔄 Updating ivCAMPUS profile...')

  // Fetch updated user data from ivCAMPUS API
  try {
    // Call ivCAMPUS API to get updated user information based on email
    const response = await fetch(`https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/get_updated_ox_user?email=${email}`)
    const data = await response.json()

    if (data.success) {
      console.log('User data:', data)
      // Instead of reloading the full window, just reload the iframe to sync changes
      // This triggers the iframe to reinitialize with updated user data
      const currentSrc = iframe.attr('src')
      iframe.attr('src', currentSrc)
    } else {
      console.error('Error updating user data:', data.error)
    }
  } catch (error) {
    console.error('Error updating user data:', error)
  }
}
