/* eslint-disable license-header/header */

import $ from '$/jquery'
import ox from '$/ox'
import { settings } from './settings'
import { sendUserData } from './utils'

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

  appWindow.nodes.main.append(iframe)
  appWindow.show()
})

export default {
  getApp: app.getInstance
}
