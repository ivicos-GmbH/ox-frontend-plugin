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

import ui from '$/io.ox/core/desktop'
import manifests from '$/io.ox/core/manifests'
import { createIcon } from '$/io.ox/core/components'

ui.createApp({
  id: 'com.example/my-app',
  name: 'com.example/my-app',
  title: 'My app',
  searchable: false,
  settings: () => import('@/com.example/my-app/settings/pane.js'),
  requires: 'webmail',
  refreshable: true,
  icon: createIcon('bi/globe.svg'),
  load: () => Promise.all([
    import('@/com.example/my-app/main'),
    manifests.manager.loadPluginsFor('com.example/my-app')
  ]).then(([main]) => main)
})
