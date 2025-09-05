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

import mocha from 'eslint-plugin-mocha'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'
import url from 'node:url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const codeceptjs = new FlatCompat({
  baseDirectory: __dirname
}).extends('plugin:codeceptjs/recommended')

export default [
  {
    files: ['**/*_test.js', '**/*_test.mjs', 'e2e/packages/appsuite-codeceptjs/**/*.js', 'e2e/**/*.js'],
    plugins: {
      ...codeceptjs[1].plugins
    },
    rules: {
      ...codeceptjs[1].rules,
      'no-unused-expressions': 0,
      'import/no-absolute-path': 0,
      'codeceptjs/no-skipped-tests': 'off',
      'codeceptjs/no-pause-in-scenario': 'off'
    },
    languageOptions: {
      globals: {
        ...codeceptjs[0].languageOptions.globals,
        ...mocha.configs.flat.recommended.languageOptions.globals,
        Feature: true,
        Scenario: true,
        Before: true,
        After: true,
        within: true,
        assert: true,
        locate: true,
        session: true,
        inject: true,
        codecept_dir: true,
        output_dir: true,
        DataTable: true,
        Data: true,
        BeforeSuite: true,
        AfterSuite: true,
        actor: true,
        expect: true,
        require: true
      }
    }
  }
]
