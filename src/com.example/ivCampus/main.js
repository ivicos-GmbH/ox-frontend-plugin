/* eslint-disable license-header/header */

import $ from '$/jquery'
import ox from '$/ox'
import { settings } from './settings'
import { sendUserData } from './utils'
// import { Events } from '$/io.ox/core/events'
import userApi from '$/io.ox/core/api/user'
import contactApi from '$/io.ox/contacts/api'

// Function to fetch contact image
const getContactImage = async (userId, size = 150) => {
  try {
    const userData = await userApi.get({ id: userId })
    const imageUrl = contactApi.getContactPhotoUrl(userData, size)

    const response = await fetch(imageUrl, {
      credentials: 'include' // This includes cookies in the request
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBlob = await response.blob()
    // Create a blob URL that can be used without authentication
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

const app = ox.ui.createApp({ name: 'app.ivicos-campus/ivCampus', id: 'app.ivicos-campus/ivCampus', title: 'ivCAMPUS' })

app.setLauncher(options => {
  const appWindow = ox.ui.createWindow({
    name: 'app.ivicos-campus/ivCampus',
    id: 'app.ivicos-campus/ivCampus',
    title: 'ivCAMPUS'
  })

  app.setWindow(appWindow)

  console.log('ox.user', ox, ox.rampup.user)

  const baseUrl = settings.get('baseUrl')

  const iframe = $('<iframe>')
    .attr('src', baseUrl)
    .attr('allow', 'camera; microphone; autoplay')
    .css({
      width: '100%',
      height: '100%',
      border: 'none'
    })

  iframe.on('load', () => {
    console.log('Iframe loaded, ready to send messages')
    sendUserData(ox.rampup.user, ox.session, iframe, baseUrl)
  })

  // Listen for settings changes and react accordingly
  settings.on('change:baseUrl', (newBaseUrl) => {
    console.log('🌐 Base URL changed, updating iframe src to:', newBaseUrl)
    iframe.attr('src', newBaseUrl)
  })

  settings.on('change:userName', (newUserName) => {
    console.log('👤 User name changed to:', newUserName)
    // You could update UI elements, send to iframe, etc.
  })

  settings.on('change:email', (newEmail) => {
    console.log('📧 Email changed to:', newEmail)
    // You could validate email, update user profile, etc.
  })

  settings.on('change:department', (newDepartment) => {
    console.log('🏢 Department changed to:', newDepartment)
    // You could update permissions, UI theme, etc.
  })

  settings.on('change:notifications', (notificationsEnabled) => {
    console.log('🔔 Notifications setting changed to:', notificationsEnabled)
    // You could enable/disable notification features
  })

  settings.on('change:autoRefresh', (refreshInterval) => {
    console.log('⏰ Auto refresh interval changed to:', refreshInterval, 'seconds')
    // You could start/stop auto-refresh timers
  })

  userApi.on('update', function (data) {
    console.log('User update event:', data)

    // update the user data in the iframe
    fetch(`https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/get_updated_ox_user?email=${ox.rampup.user.email1}`).then(response => response.json()).then(data => {
      if (data.success) {
        console.log('User data:', data)
        // Instead of reloading the full window, just reload the iframe
        const currentSrc = iframe.attr('src')
        iframe.attr('src', currentSrc)
      } else {
        console.error('Error updating user data:', data.error)
      }
    }).catch(error => {
      console.error('Error updating user data:', error)
    })

    // Get full user data after update
    userApi.get({ id: data.id || ox.rampup.user.id }).then(fullData => {
      console.log('Complete user data:', fullData)

      getContactImage(fullData.id).then(image => {
        console.log('User image:', image)
      }).catch(error => {
        console.error('Error fetching contact image:', error)
      })
    })
  })

  appWindow.nodes.main.append(iframe)
  appWindow.show()
})

export default {
  getApp: app.getInstance
}
