/* eslint-disable license-header/header */

import { API_CONFIG } from './constants'

/**
 * Handle profile update by calling backend API
 * @param {string} email - User email
 * @param {jQuery} iframe - Iframe element
 */
export const handleProfileUpdate = async (email, iframe) => {
  try {
    const response = await fetch(`${API_CONFIG.profileUpdate}?email=${email}`)
    const data = await response.json()
    if (data.success) {
      const currentSrc = iframe.attr('src')
      iframe.attr('src', currentSrc)
    } else {
      console.error('Error updating user data:', data.error)
    }
  } catch (error) {
    console.error('Error updating user data:', error)
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
//     const response = await fetch(API_CONFIG.backendSync, {
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
