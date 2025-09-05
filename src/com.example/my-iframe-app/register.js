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

import createIframeApp from '$/io.ox/core/tk/iframe'
import { createIcon } from '$/io.ox/core/components'

/**
 * In order for the app to show up in the launcher, it needs to be configured on the middleware.
 * The id provided to create the iframe app (see example code, below) is used to register the app
 * to the launcher.
 * io.ox/core//apps/list = "io.ox/mail,com.example/my-iframe-app,io.ox/contacts"
 */

const iframeApp = createIframeApp({
  id: 'com.example/my-iframe-app',
  name: 'com.example/my-iframe-app',
  // we wrap this string into a gt-call to support i18n
  title: 'My iframe app',
  pageTitle: 'Hello, World!',
  settings: false,
  url: 'https://www.example.com/',
  // you can use any icon identifier supported by bootstrap icons
  icon: createIcon('bi/box-arrow-up-right.svg'),
  acquireToken: false,
  // load function is used to load any other required files to start the app
  load: () => Promise.all([]).then(() => {
    // in this simple case we just return a reference to the getApp function of the app
    return {
      default: {
        getApp: iframeApp.getApp
      }
    }
  })
})

export default {
  getApp: iframeApp.getApp
}
