/* eslint-disable license-header/header */

/**
 * ivCAMPUS Settings Pane
 *
 * This module creates the user interface for configuring ivCAMPUS plugin settings.
 * It provides form controls for department selection, notifications, auto-refresh settings,
 * and a manual profile update button that triggers synchronization with the ivCAMPUS system.
 */

import $ from '$/jquery'
import ext from '$/io.ox/core/extensions'
import * as util from '$/io.ox/core/settings/util'
import ExtensibleView from '$/io.ox/backbone/views/extensible'
import { settings } from '../settings'
import './style.css'

// ===== MAIN SETTINGS VIEW CONTAINER =====
// This extension point creates the main container for the ivCAMPUS settings page
ext.point('app.ivicos-campus/ivCampus/settings/detail').extend({
  id: 'view',
  index: 100, // Position in the settings menu
  title: 'ivCAMPUS',
  draw () {
    // Create the settings page header and main content area
    this.append(
      // Add the page title header
      util.header(
        'ivCAMPUS', // Main title
        'ivCAMPUS'  // Subtitle
      ),
      // Create an extensible view container for the form controls
      new ExtensibleView({ point: 'app.ivicos-campus/ivCampus/settings/detail/view' })
        .build(function () {
          // Apply CSS classes for styling the settings body
          this.$el.addClass('settings-body settings-container')
        })
        .render().$el
    )
  }
})

// ===== SETTINGS FORM CONTROLS =====
// This extension point creates the actual form controls and layout
ext.point('app.ivicos-campus/ivCampus/settings/detail/view').extend({
  id: 'layout',
  index: 100,
  title: 'ivCAMPUS layout',
  render () {
    console.log('ivCampus extended view render called')

    // ===== FORM CONTROL CREATION =====
    // Create interactive form elements initialized with current settings values

    // Department selection dropdown - allows users to specify their department
    const departmentSelect = $('<select>')
      .addClass('form-control') // Bootstrap styling
      .append(
        // Add department options
        $('<option>').val('IT').text('IT'),
        $('<option>').val('HR').text('HR'),
        $('<option>').val('Finance').text('Finance'),
        $('<option>').val('Marketing').text('Marketing')
      )
      .val(settings.get('department')) // Set current value from settings
      .on('change', (e) => {
        // Update settings when user changes selection
        settings.set('department', e.target.value)
        console.log('🏢 Department changed to:', e.target.value)
      })

    // Notifications toggle checkbox - enables/disables notification features
    const notificationsCheckbox = $('<input>')
      .attr('type', 'checkbox')
      .prop('checked', settings.get('notifications')) // Set initial state from settings
      .on('change', (e) => {
        // Update settings when checkbox state changes
        settings.set('notifications', e.target.checked)
        console.log('🔔 Notifications changed to:', e.target.checked)
      })

    // Auto-refresh interval input - controls how often data refreshes automatically
    const autoRefreshInput = $('<input>')
      .attr('type', 'number')
      .addClass('form-control') // Bootstrap styling
      .val(settings.get('autoRefresh')) // Set current value from settings
      .on('change', (e) => {
        // Update settings with parsed integer value
        settings.set('autoRefresh', parseInt(e.target.value))
        console.log('⏰ Auto refresh changed to:', e.target.value, 'seconds')
      })

    // ===== PROFILE UPDATE BUTTON =====
    // Manual trigger button for syncing user profile with ivCAMPUS system
    const updateProfileButton = $('<button>')
      .addClass('btn btn-primary') // Bootstrap primary button styling
      .text('Update ivCAMPUS Profile')
      .on('click', function () {
        const $btn = $(this)
        const originalText = 'Update ivCAMPUS Profile' // Button's default text
        const updatedText = 'Updated!' // Success confirmation text

        // ===== BUTTON STATE MANAGEMENT =====
        // Disable button and show loading state to prevent multiple clicks
        $btn.prop('disabled', true)
        $btn.text('Updating...') // Show loading text
        $btn.addClass('updating') // Apply CSS class for loading state

        // Trigger settings change event to notify main.js of profile update request
        // Increment counter to ensure event fires even with same value
        const currentValue = settings.get('profileUpdateTrigger') || 0
        settings.set('profileUpdateTrigger', currentValue + 1)
        console.log('📝 Update ivCAMPUS Profile button clicked')

        // ===== VISUAL FEEDBACK TIMING =====
        // After short delay (500ms), show success confirmation
        setTimeout(() => {
          $btn.text(updatedText) // Show "Updated!" text
          $btn.removeClass('updating').addClass('updated') // Update CSS classes

          // Revert button to original state after 5 minutes (300,000ms)
          // This prevents users from clicking again too soon and gives visual confirmation
          setTimeout(() => {
            $btn.text(originalText) // Restore original text
            $btn.removeClass('updated') // Remove success styling
            $btn.prop('disabled', false) // Re-enable button
          }, 300000) // 5 minutes
        }, 500) // 0.5 seconds
      })

    // ===== UI ASSEMBLY =====
    // Apply custom CSS class for plugin-specific styling
    this.$el.addClass('ivcampus-settings')

    // Build and append the complete settings interface
    this.$el.append(
      // Create a fieldset containing all form controls
      util.fieldset(
        'ivCAMPUS Configuration', // Fieldset legend/title
        $('<div>').append(
          // Introductory text explaining the settings
          $('<p>').addClass('intro-text').text('Configure your ivCampus settings. Changes are saved automatically and can be monitored in the console.'),

          // Department selection form group
          $('<div>').addClass('form-group').append(
            $('<label>').text('Department'), // Field label
            departmentSelect, // The select dropdown
            $('<small>').addClass('form-text text-muted').text('Select your department') // Helper text
          ),

          // Notifications checkbox form group
          $('<div>').addClass('form-group').append(
            $('<div>').addClass('form-check').append(
              notificationsCheckbox, // The checkbox input
              $('<label>').addClass('form-check-label').text('Enable Notifications') // Checkbox label
            ),
            $('<small>').addClass('form-text text-muted').text('Receive notifications in the app') // Helper text
          ),

          // Auto-refresh input form group
          $('<div>').addClass('form-group').append(
            $('<label>').text('Auto Refresh (seconds)'), // Field label
            autoRefreshInput, // The number input
            $('<small>').addClass('form-text text-muted').text('Interval for automatic data refresh') // Helper text
          )
        )
      ),

      // Separate container for the profile update button
      $('<div>').addClass('button-container').append(updateProfileButton)
    )
  }
})
