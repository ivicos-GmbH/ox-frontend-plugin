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

const { config } = require('@open-xchange/appsuite-codeceptjs')

/**
 * You can use the config object to customize the CodeceptJS configuration
 * The default configuration is defined in the @open-xchange/appsuite-codeceptjs package
 * You can override any of the default configuration options here
 *
 * For example, to change the tests directory, you can use the following:
 * config.tests = './tests/*_test.js'
 *
 * For more information see @open-xchange/appsuite-codeceptjs configuration
 */

// Example: Add a custom page object
config.include.example = './pageobjects/example.js'

// Example: Add a custom helper
config.helpers.MyHelper = {
  require: './helper'
}

module.exports.config = config
