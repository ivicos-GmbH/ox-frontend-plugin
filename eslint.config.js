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

import config from '@open-xchange/lint'
import e2eConfig from './e2e/eslint.config.mjs'

export default [
  ...config,
  {
    name: 'Exclude jquery and polyfills',
    ignores: [
      'src/lib/jquery*',
      'src/lib/polyfills/*',
      '**/*.d.ts'
    ]
  },
  {
    name: 'Exclude license header in pe',
    files: [
      'src/pe/**/*'
    ],
    rules: {
      'license-header/header': ['off']
    }
  },
  ...e2eConfig
]
