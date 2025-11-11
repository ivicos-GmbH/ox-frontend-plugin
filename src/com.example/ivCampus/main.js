/* eslint-disable license-header/header */

import $ from '$/jquery'
import ox from '$/ox'
import { settings } from './settings'
import { handleProfileUpdate, fetchCalendarAppointments, fetchTasks, fetchContacts, fetchMailMessages } from './utils'
import userApi from '$/io.ox/core/api/user'
import calendarApi from '$/io.ox/calendar/api'
import taskAPI from '$/io.ox/tasks/api'
import contactsAPI from '$/io.ox/contacts/api'
import mailApi from '$/io.ox/mail/api'

const app = ox.ui.createApp({ name: 'app.ivicos-campus/ivCampus', id: 'app.ivicos-campus/ivCampus', title: 'ivCAMPUS' })

app.setLauncher(options => {
  const appWindow = ox.ui.createWindow({
    name: 'app.ivicos-campus/ivCampus',
    id: 'app.ivicos-campus/ivCampus',
    title: 'ivCAMPUS'
  })

  app.setWindow(appWindow)

  const baseUrl = settings.get('baseUrl')
  const url = new URL(baseUrl)
  if (ox.rampup.user?.email1) {
    url.searchParams.set('email', ox.rampup.user.email1)
  }

  const iframe = $('<iframe>')
    .attr('src', url.toString())
    .attr('allow', 'camera; microphone; autoplay')
    .css({
      width: '100%',
      height: '100%',
      border: 'none'
    })

  iframe.on('load', function () {
    console.log('📅 Iframe loaded')
    // Fetch calendar appointments using utility function
    fetchCalendarAppointments(calendarApi)
    fetchMailMessages(mailApi, {
      folder: 'default0/INBOX',
      limit: 50,
      fetchFullDetails: false // set to true for full email content
    })
    // 1. Get all my tasks (including delegated ones)
    fetchTasks(taskAPI, {
      excludeDelegatedToOthers: false // Include delegated tasks
    })

    // 2. Get only my non-delegated tasks
    fetchTasks(taskAPI, {
      excludeDelegatedToOthers: true // Exclude delegated tasks
    })

    // 3. Search tasks by pattern
    fetchTasks(taskAPI, {
      searchQuery: 'meeting',
      searchStartDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      searchEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000    // 30 days from now
    })

    // 4. Search tasks in specific folder
    fetchTasks(taskAPI, {
      searchQuery: 'urgent',
      folder: 'some-folder-id'
    })

    // 5. Get tasks from specific folder
    fetchTasks(taskAPI, {
      useMyTasks: false, // Don't use getAllMyTasks
      folder: 'some-folder-id'
    })
    fetchContacts(contactsAPI)
    // fetchContacts(contactsAPI, {
    //   searchQuery: 'OX Admin',
    //   limit: 50
    // })
  })

  // Listen for settings changes and react accordingly
  settings.on('change:baseUrl', (newBaseUrl) => {
    console.log('🌐 Base URL changed, updating iframe src to:', newBaseUrl)
    const url = new URL(newBaseUrl)
    if (ox.rampup.user?.email1) {
      url.searchParams.set('email', ox.rampup.user.email1)
    }
    iframe.attr('src', url.toString())
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

  // Listen for profile update button click
  settings.on('change:profileUpdateTrigger', (triggerValue) => {
    console.log('📝 Profile update triggered from settings pane:', triggerValue)
    // Handle profile update logic here
    handleProfileUpdate(ox.rampup.user.email1, iframe)
  })

  userApi.on('update', function (data) {
    console.log('User update event:', data)

    // update the user data in the iframe
    handleProfileUpdate(ox.rampup.user.email1, iframe)
  })

  appWindow.nodes.main.append(iframe)
  appWindow.show()
})

export default {
  getApp: app.getInstance
}
