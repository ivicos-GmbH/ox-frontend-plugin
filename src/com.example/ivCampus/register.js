/* eslint-disable license-header/header */
/**
 * @copyright Copyright (c) Open-Xchange GmbH, Germany <info@open-xchange.com>
 * @license AGPL-3.0
 */

import { createIcon } from '$/io.ox/core/components'
import ui from '$/io.ox/core/desktop'
import apps from '$/io.ox/core/api/apps'

ui.createApp({
  id: 'com.example/ivCampus',
  name: 'com.example/ivCampus',
  title: 'ivCAMPUS',
  settings: false,
  icon: createIcon('bi/geo-alt.svg'),
  load: () => import('@/com.example/ivCampus/main')
})

// Register with the launcher
apps.launcher.add('com.example/ivCampus', { at: 0 })
