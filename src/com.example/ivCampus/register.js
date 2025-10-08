/* eslint-disable license-header/header */

import { createIcon } from '$/io.ox/core/components'
import ui from '$/io.ox/core/desktop'
import apps from '$/io.ox/core/api/apps'

ui.createApp({
  id: 'com.example/ivCampus',
  name: 'com.example/ivCampus',
  title: 'ivCAMPUS',
  settings: () => import('@/com.example/ivCampus/settings/pane.js'),
  icon: createIcon('bi/geo-alt.svg'),
  load: () => import('@/com.example/ivCampus/main')
})

// Register with the launcher
apps.launcher.add('com.example/ivCampus', { at: 0 })
