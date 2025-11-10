/* eslint-disable license-header/header */

/**
 * ivCAMPUS Plugin Registration
 *
 * This module registers the ivCAMPUS plugin with the OX App Suite system,
 * making it available in the application launcher and settings menu.
 */

import { createIcon } from '$/io.ox/core/components'
import ui from '$/io.ox/core/desktop'
import apps from '$/io.ox/core/api/apps'

// Register the ivCAMPUS application with OX App Suite
ui.createApp({
  id: 'app.ivicos-campus/ivCampus', // Unique application identifier
  name: 'app.ivicos-campus/ivCampus', // Application name (must match the ID)
  title: 'ivCAMPUS', // Display name shown in UI
  settings: () => import('@/com.example/ivCampus/settings/pane.js'), // Lazy-loaded settings pane
  icon: createIcon('bi/geo-alt.svg'), // Bootstrap icon for the app launcher
  load: () => import('@/com.example/ivCampus/main') // Lazy-loaded main application module
})

// Add the application to the OX launcher at position 0 (first position)
apps.launcher.add('app.ivicos-campus/ivCampus', { at: 0 })
