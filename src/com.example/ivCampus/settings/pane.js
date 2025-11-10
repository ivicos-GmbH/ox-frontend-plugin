/* eslint-disable license-header/header */

import $ from '$/jquery'
import ext from '$/io.ox/core/extensions'
import * as util from '$/io.ox/core/settings/util'
import ExtensibleView from '$/io.ox/backbone/views/extensible'
import { settings } from '../settings'
import './style.css'

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
        settings.set('autoRefresh', parseInt(e.target.value))
        console.log('⏰ Auto refresh changed to:', e.target.value, 'seconds')
      })

    const updateProfileButton = $('<button>')
      .addClass('btn btn-primary')
      .text('Update ivCAMPUS Profile')
      .on('click', function () {
        const $btn = $(this)
        const originalText = 'Update ivCAMPUS Profile'
        const updatedText = 'Updated!'

        // Disable button and show updating state
        $btn.prop('disabled', true)
        $btn.text('Updating...')
        $btn.addClass('updating')

        // Trigger settings change to notify main.js
        const currentValue = settings.get('profileUpdateTrigger') || 0
        settings.set('profileUpdateTrigger', currentValue + 1)
        console.log('📝 Update ivCAMPUS Profile button clicked')

        // After a short delay, show "Updated!" then revert
        setTimeout(() => {
          $btn.text(updatedText)
          $btn.removeClass('updating').addClass('updated')

          // Revert to original state after 5 minutes (300000 ms)
          setTimeout(() => {
            $btn.text(originalText)
            $btn.removeClass('updated')
            $btn.prop('disabled', false)
          }, 300000)
        }, 500)
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
