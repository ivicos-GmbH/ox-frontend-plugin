/* eslint-disable license-header/header */

import { createIcon } from '$/io.ox/core/components'
import ui from '$/io.ox/core/desktop'
import apps from '$/io.ox/core/api/apps'

ui.createApp({
  id: 'app.ivicos-campus/ivCampus',
  name: 'app.ivicos-campus/ivCampus',
  title: 'ivCAMPUS',
  settings: false,
  icon: createIcon('bi/geo-alt.svg'),
  load: () => import('@/com.example/ivCampus/main')
})

// Register with the launcher
apps.launcher.add('app.ivicos-campus/ivCampus', { at: 0 })
