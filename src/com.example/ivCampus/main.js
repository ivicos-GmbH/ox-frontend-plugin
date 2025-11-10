/* eslint-disable license-header/header */

/**
 * ivCAMPUS Plugin Main Module
 *
 * This plugin integrates the ivCAMPUS learning platform into OX App Suite by embedding
 * it as an iframe. It handles user data synchronization, settings management, and
 * real-time communication between the OX environment and the embedded application.
 */

import $ from '$/jquery'
import ox from '$/ox'
import { settings } from './settings'
import { handleProfileUpdate, sendUserData } from './utils'
// import { Events } from '$/io.ox/core/events'
import userApi from '$/io.ox/core/api/user'
import contactApi from '$/io.ox/contacts/api'

/**
 * Fetches a user's contact image from the OX server and converts it to a blob URL
 * This allows the image to be used in the iframe without authentication issues
 *
 * @param {string} userId - The OX user ID
 * @param {number} size - Desired image size in pixels (default: 150)
 * @returns {Promise<{url: string, blob: Blob, contentType: string}>} Image data with blob URL
 */
const getContactImage = async (userId, size = 150) => {
  try {
    // Get user data to access contact information
    const userData = await userApi.get({ id: userId })

    // Generate the authenticated image URL using OX's contact API
    const imageUrl = contactApi.getContactPhotoUrl(userData, size)

    // Fetch the image with credentials to include authentication cookies
    const response = await fetch(imageUrl, {
      credentials: 'include' // This includes cookies in the request
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    // Convert the response to a blob for local storage
    const imageBlob = await response.blob()

    // Create a blob URL that can be used without authentication in the iframe
    const blobUrl = URL.createObjectURL(imageBlob)
    return {
      url: blobUrl, // Using blob URL instead of the original authenticated URL
      blob: imageBlob,
      contentType: response.headers.get('content-type')
    }
  } catch (error) {
    console.error('Error fetching contact image:', error)
    throw error
  }
}

// Create the main OX application instance for ivCAMPUS
const app = ox.ui.createApp({
  name: 'app.ivicos-campus/ivCampus',
  id: 'app.ivicos-campus/ivCampus',
  title: 'ivCAMPUS'
})

/**
 * Application launcher function - called when user opens the ivCAMPUS app
 * Sets up the main window, iframe, and all event listeners
 */
app.setLauncher(options => {
  // Create the main application window
  const appWindow = ox.ui.createWindow({
    name: 'app.ivicos-campus/ivCampus',
    id: 'app.ivicos-campus/ivCampus',
    title: 'ivCAMPUS'
  })

  // Associate the window with the app
  app.setWindow(appWindow)

  // Log current user information for debugging
  console.log('ox.user', ox, ox.rampup.user)

  // Get the base URL from settings and prepare it with user email parameter
  const baseUrl = settings.get('baseUrl')
  const url = new URL(baseUrl)
  // Add user email as URL parameter for authentication in the iframe
  if (ox.rampup.user?.email1) {
    url.searchParams.set('email', ox.rampup.user.email1)
  }

  // Create the iframe that will host the ivCAMPUS application
  const iframe = $('<iframe>')
    .attr('src', url.toString()) // Set the iframe source URL with email parameter
    .attr('allow', 'camera; microphone; autoplay') // Grant necessary permissions for video/audio features
    .css({
      width: '100%',
      height: '100%',
      border: 'none' // Remove default iframe border
    })

  // When iframe finishes loading, send user data to initialize the embedded app
  iframe.on('load', () => {
    console.log('Iframe loaded, ready to send messages')
    sendUserData(ox.rampup.user, ox.session, iframe, baseUrl)
  })

  // ===== SETTINGS CHANGE LISTENERS =====
  // These listeners react to changes in the settings pane and update the application accordingly

  // Update iframe URL when base URL changes in settings
  settings.on('change:baseUrl', (newBaseUrl) => {
    console.log('🌐 Base URL changed, updating iframe src to:', newBaseUrl)
    const url = new URL(newBaseUrl)
    if (ox.rampup.user?.email1) {
      url.searchParams.set('email', ox.rampup.user.email1)
    }
    iframe.attr('src', url.toString())
  })

  // Commented out: User name change handler (future feature)
  // settings.on('change:userName', (newUserName) => {
  //   console.log('👤 User name changed to:', newUserName)
  //   // You could update UI elements, send to iframe, etc.
  // })

  // Commented out: Email change handler (future feature)
  // settings.on('change:email', (newEmail) => {
  //   console.log('📧 Email changed to:', newEmail)
  //   // You could validate email, update user profile, etc.
  // })

  // Department change - could affect permissions or UI theme
  settings.on('change:department', (newDepartment) => {
    console.log('🏢 Department changed to:', newDepartment)
    // You could update permissions, UI theme, etc.
  })

  // Notifications setting - enable/disable notification features
  settings.on('change:notifications', (notificationsEnabled) => {
    console.log('🔔 Notifications setting changed to:', notificationsEnabled)
    // You could enable/disable notification features
  })

  // Auto refresh interval - control automatic data refresh timing
  settings.on('change:autoRefresh', (refreshInterval) => {
    console.log('⏰ Auto refresh interval changed to:', refreshInterval, 'seconds')
    // You could start/stop auto-refresh timers
  })

  // Profile update trigger - activated when user clicks update button in settings
  settings.on('change:profileUpdateTrigger', (triggerValue) => {
    console.log('📝 Profile update triggered from settings pane:', triggerValue)
    // Handle profile update logic here
    handleProfileUpdate(ox.rampup.user.email1, iframe)
  })

  // ===== USER API EVENT LISTENERS =====
  // Listen for user profile updates from the OX system

  // Handle user profile updates - triggered when user data changes in OX
  userApi.on('update', function (data) {
    console.log('User update event:', data)

    // Update the user data in the iframe to sync with OX changes
    handleProfileUpdate(ox.rampup.user.email1, iframe)

    // Get complete user data after update to access additional information
    userApi.get({ id: data.id || ox.rampup.user.id }).then(fullData => {
      console.log('Complete user data:', fullData)

      // Fetch and prepare user contact image for potential use in iframe
      getContactImage(fullData.id).then(image => {
        console.log('User image:', image)
        // Image blob URL is available for sending to iframe if needed
      }).catch(error => {
        console.error('Error fetching contact image:', error)
      })
    })
  })

  // ===== WINDOW SETUP =====
  // Add the iframe to the main window and display it
  appWindow.nodes.main.append(iframe)
  appWindow.show()
})

// Export the application instance getter for external access
export default {
  getApp: app.getInstance
}
