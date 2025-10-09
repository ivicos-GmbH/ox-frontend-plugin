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
          // this.$el.css({
          //   padding: '10px',
          //   backgroundColor: '#fff',
          //   borderRadius: '10px',
          //   boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          //   width: '90%',
          //   margin: '0 auto',
          //   color: '#333'
          // })
          this.$el.addClass('settings-body settings-container')
        })
        // .build(function () {
        //   this.$el.addClass('settings-body io-ox-ivcampus-settings')
        // })
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
    const userNameInput = $('<input>')
      .attr('type', 'text')
      .addClass('form-control')
      .val(settings.get('userName'))
      .on('change', (e) => {
        settings.set('userName', e.target.value)
        console.log('🔔 User name changed to:', e.target.value)
      })

    const emailInput = $('<input>')
      .attr('type', 'email')
      .addClass('form-control')
      .val(settings.get('email'))
      .on('change', (e) => {
        settings.set('email', e.target.value)
        console.log('📧 Email changed to:', e.target.value)
      })

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

    this.$el.append(
      util.fieldset(
        'ivCAMPUS Configuration',
        $('<div>').append(
          $('<p>').text('Configure your ivCampus settings - changes are detected in console:'),
          $('<div class="form-group">').append(
            $('<label>').text('User Name:'),
            userNameInput,
            $('<small class="form-text text-muted">').text('Display name for the user')
          ),
          $('<div class="form-group">').append(
            $('<label>').text('Email:'),
            emailInput,
            $('<small class="form-text text-muted">').text('User email address')
          ),
          $('<div class="form-group">').append(
            $('<label>').text('Department:'),
            departmentSelect,
            $('<small class="form-text text-muted">').text('User department')
          ),
          $('<div class="form-group">').append(
            $('<div class="form-check">').append(
              notificationsCheckbox,
              $('<label class="form-check-label">').text('Enable Notifications')
            ),
            $('<small class="form-text text-muted">').text('Receive system notifications')
          ),
          $('<div class="form-group">').append(
            $('<label>').text('Auto Refresh (seconds):'),
            autoRefreshInput,
            $('<small class="form-text text-muted">').text('How often to refresh data automatically')
          )
        )
      )
    )
  }
})
