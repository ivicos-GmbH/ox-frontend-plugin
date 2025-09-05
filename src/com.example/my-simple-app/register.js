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

import { createIcon } from '$/io.ox/core/components'
import ui from '$/io.ox/core/desktop'

/**
 * In order for the app to show up in the launcher, it needs to be configured on the middleware.
 * The id provided to create the iframe app (see example code, below) is used to register the app
 * to the launcher.
 * io.ox/core//apps/list = "io.ox/mail,com.example/my-simple-app,io.ox/contacts"
 */

ui.createApp({
  id: 'com.example/my-simple-app',
  name: 'com.example/my-simple-app',
  title: 'My simple App',
  settings: false,
  icon: createIcon('bi/globe.svg'),
  load: () => import('@/com.example/my-simple-app/main')
})
