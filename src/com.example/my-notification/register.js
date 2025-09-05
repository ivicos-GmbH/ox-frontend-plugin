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
import _ from '$/underscore'
import ext from '$/io.ox/core/extensions'
import Subview from '$/io.ox/core/notifications/subview'
import Events from '$/io.ox/core/event'

let counter = 0

const api = {
  get (data) {
    const result = {
      id: data.id,
      text: 'I am ' + data.id
    }
    return $.Deferred().resolve(result)
  },
  reset () {
    counter = 0
    api.trigger('reset', { id: 'myNotification #' + counter })
    counter++
  }
}

Events.extend(api)

ext.point('io.ox/core/notifications/register').extend({
  id: 'tutorialplugin',
  index: 1000,
  register () {
    const options = {
      id: 'com.example/my-notification',
      title: 'My notifications',
      extensionPoints: {
        item: 'com.example/my-notification/item',
        footer: 'com.example/my-notification/footer'
      },
      autoOpen: true,
      api,
      apiEvents: {
        reset: 'reset'
      },
      detailview: {
        draw (obj) {
          const node = $('<div>').append($('<div>').text('i am the tutorial detailview'),
            $('<div>').text(obj.data.text))
          return node
        }
      },
      specificDesktopNotification (model) {
        return {
          title: 'New tutorial notification',
          body: model.get('text'),
          icon: ''
        }
      }
    }

    /* eslint-disable-next-line no-new */
    new Subview(options)

    api.reset()
  }
})

ext.point('com.example/my-notification/footer').extend({
  draw (baton) {
    this.append(
      $('<button class="btn btn-default" style="8px 0 8px 14px;">').text('reset notifications')
        .on('click', () => api.reset()),
      $('<button class="btn btn-default" style="8px 0 8px 14px;">').text('add notification')
        .on('click', () => {
          baton.view.addNotifications({ id: 'myNotification #' + counter })
          counter++
        })
    )
  }
})

ext.point('com.example/my-notification/item').extend({
  draw (baton) {
    const cid = _.cid(baton.model.attributes)

    this.attr('data-cid', cid).append($('<div>').text(baton.model.get('text')),
      $('<button class="btn">').text('remove notification').on('click', () => {
        baton.view.removeNotifications(baton.model)
      }))
  }
})
