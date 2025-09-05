/* eslint-disable license-header/header */
/**
 * @copyright Copyright (c) Open-Xchange GmbH, Germany <info@open-xchange.com>
 * @license AGPL-3.0
 */

import $ from '$/jquery'
import ox from '$/ox'

// application object. 'name' is mandatory!
const app = ox.ui.createApp({ name: 'com.example/my-test-app' })

// launcher
app.setLauncher(options => {
  const win = ox.ui.createWindow({
    name: 'com.example/my-test-app',
    title: 'ivCAMPUS'
  })

  app.setWindow(win)
  // win.addClass('com-example-my-test-app')

  const baseUrl = 'https://canary.ivicos-campus.app/login'

  // Create iframe pointing to your MERN app
  const iframe = $('<iframe>')
    .attr('src', baseUrl) // Your MERN app URL
    .css({
      width: '100%',
      height: '100%',
      border: 'none'
    })

  win.nodes.main.append(iframe)
  win.show()
  // $('html').addClass('complete')
})

export default {
  getApp: app.getInstance
}
