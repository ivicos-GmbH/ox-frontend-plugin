/* eslint-disable license-header/header */

import ext from '$/io.ox/core/extensions'
import * as util from '$/io.ox/core/settings/util'

ext.point('app.ivicos-campus/ivCampus/settings/detail').extend({
  id: 'view',
  index: 1,
  title: 'ivCAMPUS',
  draw () {
    this.append(
      util.header(
        'ivCAMPUS',
        'ivCAMPUS'
      )
    )
  }
})
