/* eslint-disable license-header/header */

import $ from '$/jquery'
import ox from '$/ox'
import { settings } from './settings'
import { sendUserData } from './utils'

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

  appWindow.nodes.main.append(iframe)
  appWindow.show()
})

export default {
  getApp: app.getInstance
}
