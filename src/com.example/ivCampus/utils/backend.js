/* eslint-disable license-header/header */

import { settings } from '../settings'
import { API_PATHS } from './constants'

/**
 * Build an absolute API URL from the apiBaseUrl setting.
 *
 * Read at call time, never at module scope: the jslob is fetched asynchronously during rampup,
 * so a top-level read can run before the server's value arrives and would silently bake in the
 * compiled default.
 *
 * @param {string} path - Path from API_PATHS
 * @returns {string}
 */
const apiUrl = (path) => `${(settings.get('apiBaseUrl') || '').replace(/\/$/, '')}${path}`

/**
 * Handle profile update by calling backend API
 * @param {string} email - User email
 * @param {jQuery} iframe - Iframe element
 * @returns {Promise<boolean>}
 */
export const handleProfileUpdate = async (email, iframe) => {
  try {
    const response = await fetch(`${apiUrl(API_PATHS.profileUpdate)}?email=${encodeURIComponent(email)}`)
    if (!response.ok) {
      throw new Error(`Profile update failed: HTTP ${response.status}`)
    }
    const data = await response.json()
    if (data.success) {
      const currentSrc = iframe.attr('src')
      iframe.attr('src', currentSrc)
      return true
    } else {
      console.error('Error updating user data:', data.error)
      return false
    }
  } catch (error) {
    console.error('Error updating user data:', error)
    return false
  }
}

/**
 * Send data to backend
 * @param {Object} data - Data to send
 * @param {string} email - User email
 * @returns {Promise<Object>}
 *
 * NOTE: This function is currently commented out - using postMessage instead
 */
// export const sendDataToBackend = async (data, email) => {
//   try {
//     const response = await fetch(apiUrl(API_PATHS.backendSync), {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         email,
//         data
//       })
//     })
//     const result = await response.json()
//     if (result.success) {
//       console.log('✅ Data successfully sent to backend')
//     } else {
//       console.error('❌ Error sending data to backend:', result.error)
//     }
//     return result
//   } catch (error) {
//     console.error('❌ Failed to send data to backend:', error)
//     throw error
//   }
// }
