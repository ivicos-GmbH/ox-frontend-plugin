/* eslint-disable license-header/header */
/**
 * @copyright Copyright (c) Open-Xchange GmbH, Germany <info@open-xchange.com>
 * @license AGPL-3.0
 */

import $ from '$/jquery'
import ox from '$/ox'
import { settings, getBaseUrlOrigin } from './settings'

const app = ox.ui.createApp({ name: 'com.example/ivCampus', id: 'com.example/ivCampus', title: 'ivCAMPUS' })

app.setLauncher(options => {
  const appWindow = ox.ui.createWindow({
    name: 'com.example/ivCampus',
    id: 'com.example/ivCampus',
    title: 'ivCAMPUS'
  })

  app.setWindow(appWindow)

  console.log('ox.user', ox, ox.rampup.user)

  const baseUrl = settings.get('baseUrl')
  const baseUrlOrigin = getBaseUrlOrigin()

  const iframe = $('<iframe>')
    .attr('src', baseUrl)
    .attr('allow', 'camera; microphone; autoplay')
    .css({
      width: '100%',
      height: '100%',
      border: 'none'
    })

  // const sendNotification = (message, type = 'info') => {
  //   sendMessageToIframe({
  //     type: 'NOTIFICATION',
  //     message,
  //     notificationType: type,
  //     timestamp: new Date().toISOString()
  //   })
  // }

  // const sendCommand = (command, data = {}) => {
  //   sendMessageToIframe({
  //     type: 'COMMAND',
  //     command,
  //     data,
  //     timestamp: new Date().toISOString()
  //   })
  // }

  // Wait for iframe to load before sending messages
  iframe.on('load', () => {
    console.log('Iframe loaded, ready to send messages')
    // sendUserData(ox.rampup.user, ox.session, iframe, baseUrl)
  })

  // Add a small delay to ensure iframe is fully ready
  setTimeout(() => {
    console.log('Sending delayed user data...')
    // sendUserData(ox.rampup.user, ox.session, iframe, baseUrl)
  }, 1000)

  // Send user data when window regains focus (user comes back to app)
  appWindow.on('focus', () => {
    console.log('Window focused, sending user data...')
    // setTimeout(() => sendUserData(ox.rampup.user, ox.session, iframe, baseUrl), 100)
  })

  // Send user data when window is shown (user navigates back to app)
  appWindow.on('show', () => {
    console.log('Window shown, sending user data...')
    // setTimeout(() => sendUserData(ox.rampup.user, ox.session, iframe, baseUrl), 100)
  })

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (!baseUrlOrigin || event.origin !== baseUrlOrigin) {
      return
    }

    console.log('Message received from iframe:', event.data)
    console.log('Message origin:', event.origin)
    console.log('Message source:', event.source)

    // Handle different message types
    switch (event.data.type) {
      case 'REQUEST_USER_DATA':
        // Send user data when requested
        // sendUserData(ox.rampup.user, ox.session, iframe, baseUrl)
        console.log('Requesting user data')
        break
      case 'IFRAME_READY':
        console.log('Iframe is ready to receive messages')
        break
      case 'USER_ACTION':
        console.log('User performed action:', event.data.action)
        break
      case 'NAVIGATION':
        console.log('Navigation request:', event.data.path)
        break
      default:
        console.log('Unknown message type:', event.data.type)
        break
    }
  })

  appWindow.nodes.main.append(iframe)
  appWindow.show()
  // $('html').addClass('complete')
})

export default {
  getApp: app.getInstance
}
