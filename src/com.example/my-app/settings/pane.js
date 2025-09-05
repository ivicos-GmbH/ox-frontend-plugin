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

import ext from '$/io.ox/core/extensions'
import util from '$/io.ox/core/settings/util'
import ExtensibleView from '$/io.ox/backbone/views/extensible'
import settingsLoader from '$/io.ox/core/settings'
import gt from '$/gettext'
import '@/com.example/my-app/settings/defaults'

const settings = settingsLoader.load('com.example/my-app')

ext.point('com.example/my-app/settings/detail').extend({
  index: 100,
  id: 'view',
  draw () {
    const view = new ExtensibleView({ point: 'com.example/my-app/settings/detail/view', model: settings })
      .build(function () {
        this.listenTo(settings, 'change', () => settings.saveAndYell())
      })

    this.append(view.render().$el)

    // fallback for local development
    settings.on('load', () => {
      view.$el.empty()
      view.render()
    })
  }
})

ext.point('com.example/my-app/settings/detail/view').extend(
  {
    id: 'header',
    index: 100,
    render () {
      this.$el.append(util.header('My app'))
    }
  },
  {
    id: 'view-options',
    index: 200,
    render () {
      this.$el.append(
        util.fieldset(
          gt('A option'),
          util.checkbox('background', gt('Use background color'), settings)
        )
      )
    }
  }
)
