/**
 * @copyright Copyright (c) Open-Xchange GmbH, Germany <info@open-xchange.com>
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with OX App Suite. If not, see <https://www.gnu.org/licenses/agpl-3.0.txt>.
 *
 * Any use of the work other than as authorized under this license or copyright law is prohibited.
 */

import $ from '$/jquery'
import ox from '$/ox'
import settingsLoader from '$/io.ox/core/settings'
import '@/com.example/my-app/style.css'

const settings = settingsLoader.load('com.example/my-app')

// application object
const app = ox.ui.createApp({
  name: 'com.example/my-app',
  id: 'io.ox/my-app',
  title: 'My app'
})

app.mediator({

  'main-content' (app) {
    app.getWindow().nodes.main
      .append(
        $('<h1>').text('My app'),
        $('<p>').text('Hello World!')
      )
  },

  'background-color' (app) {
    function refresh () {
      app.getWindow().nodes.main.toggleClass('colored-background', settings.get('background', false))
    }
    // toggle background color based on setting
    settings.on('change:background', refresh)
    refresh()
  },

  'link-settings' (app) {
    app.getWindow().nodes.main
      .append(
        $('<button class="btn btn-primary">').text('Settings').on('click', () => {
          ox.launch(() => import('$/io.ox/settings/main'), { folder: 'virtual/settings/com.example/my-app' })
            .then(app => { app.setSettingsPane({ folder: 'virtual/settings/com.example/my-app' }) })
        })
      )
  }
})

// launcher
app.setLauncher(function (options) {
  // application window (some applications don't have a window)
  const win = ox.ui.createWindow({
    name: 'com.example/my-app',
    title: 'My App'
  })

  app.setWindow(win)

  // Add css class with your namespace
  win.addClass('com-example-my-app')
  app.settings = settings

  // add something on 'main' node
  app.mediate()
  win.show()
})

export default {
  getApp: app.getInstance
}
