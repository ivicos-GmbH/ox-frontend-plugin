/* eslint-disable license-header/header */

import $ from '$/jquery'
import ext from '$/io.ox/core/extensions'
import * as util from '$/io.ox/core/settings/util'
import ExtensibleView from '$/io.ox/backbone/views/extensible'
import { settings } from '../settings'
import './style.css'

const PROFILE_BTN_LABEL = 'Update ivCAMPUS Profile'

ext.point('app.ivicos-campus/ivCampus/settings/detail').extend({
  id: 'view',
  index: 100,
  title: 'ivCAMPUS',
  draw () {
    this.append(
      util.header(
        'ivCAMPUS',
        'ivCAMPUS'
      ),
      new ExtensibleView({ point: 'app.ivicos-campus/ivCampus/settings/detail/view' })
        .build(function () {
          this.$el.addClass('settings-body settings-container')
        })
        .render().$el
    )
  }
})

ext.point('app.ivicos-campus/ivCampus/settings/detail/view').extend({
  id: 'layout',
  index: 100,
  title: 'ivCAMPUS layout',
  render () {
    console.log('ivCampus extended view render called')

    // Create form elements with current settings values

    const departmentSelect = $('<select>')
      .addClass('form-control')
      .append(
        $('<option>').val('IT').text('IT'),
        $('<option>').val('HR').text('HR'),
        $('<option>').val('Finance').text('Finance'),
        $('<option>').val('Marketing').text('Marketing')
      )
      .val(settings.get('department'))
      .on('change', (e) => {
        settings.set('department', e.target.value)
        console.log('🏢 Department changed to:', e.target.value)
      })

    const notificationsCheckbox = $('<input>')
      .attr('type', 'checkbox')
      .prop('checked', settings.get('notifications'))
      .on('change', (e) => {
        settings.set('notifications', e.target.checked)
        console.log('🔔 Notifications changed to:', e.target.checked)
      })

    const autoRefreshInput = $('<input>')
      .attr('type', 'number')
      .addClass('form-control')
      .val(settings.get('autoRefresh'))
      .on('change', (e) => {
        const value = parseInt(e.target.value, 10)
        if (!isNaN(value) && value >= 0) {
          settings.set('autoRefresh', value)
          console.log('⏰ Auto refresh changed to:', value, 'seconds')
        }
      })

    const updateProfileButton = $('<button>')
      .addClass('btn btn-primary')
      .text(PROFILE_BTN_LABEL)
      .on('click', function () {
        const $btn = $(this)

        // Disable button and show updating state
        $btn.prop('disabled', true)
        $btn.text('Updating...')
        $btn.addClass('updating')

        // Trigger settings change to notify main.js
        const currentValue = settings.get('profileUpdateTrigger') || 0
        settings.set('profileUpdateTrigger', currentValue + 1)
        console.log('📝 Update ivCAMPUS Profile button clicked')

        // Restore button after 5 seconds regardless of outcome
        setTimeout(() => {
          $btn.text(PROFILE_BTN_LABEL)
          $btn.removeClass('updating')
          $btn.prop('disabled', false)
        }, 5000)
      })

    this.$el.addClass('ivcampus-settings')

    this.$el.append(
      util.fieldset(
        'ivCAMPUS Configuration',
        $('<div>').append(
          $('<p>').addClass('intro-text').text('Configure your ivCampus settings. Changes are saved automatically and can be monitored in the console.'),
          $('<div>').addClass('form-group').append(
            $('<label>').text('Department'),
            departmentSelect,
            $('<small>').addClass('form-text text-muted').text('Select your department')
          ),
          $('<div>').addClass('form-group').append(
            $('<div>').addClass('form-check').append(
              notificationsCheckbox,
              $('<label>').addClass('form-check-label').text('Enable Notifications')
            ),
            $('<small>').addClass('form-text text-muted').text('Receive notifications in the app')
          ),
          $('<div>').addClass('form-group').append(
            $('<label>').text('Auto Refresh (seconds)'),
            autoRefreshInput,
            $('<small>').addClass('form-text text-muted').text('Interval for automatic data refresh')
          )
        )
      ),
      $('<div>').addClass('button-container').append(updateProfileButton)
    )
  }
})
