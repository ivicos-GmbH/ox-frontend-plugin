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

import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import vitePluginOxCss from '@open-xchange/vite-plugin-ox-css'
import vitePluginOxExternals from '@open-xchange/vite-plugin-ox-externals'
import vitePluginOxManifests from '@open-xchange/vite-plugin-ox-manifests'
import gettextPlugin from '@open-xchange/rollup-plugin-po2json'
import vitePluginProxy from '@open-xchange/vite-plugin-proxy'
import rollupPluginCopy from 'rollup-plugin-copy'
import { fileURLToPath, URL } from 'node:url'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.defaults' })

let PROXY_URL
try {
  PROXY_URL = new URL(process.env.SERVER)
} catch (e) {
  PROXY_URL = new URL('https://0.0.0.0')
}
const PORT = process.env.PORT
const ENABLE_HMR = process.env.ENABLE_HMR === 'true'
const ENABLE_HTTP_PROXY = process.env.ENABLE_HTTP_PROXY === 'true'
const FRONTEND_URIS = process.env.FRONTEND_URIS || ''
const ENABLE_SECURE_PROXY = process.env.ENABLE_SECURE_PROXY === 'true'
const ENABLE_SECURE_FRONTENDS = process.env.ENABLE_SECURE_FRONTENDS === 'true'

export default defineConfig(({ mode }) => {
  if (mode === 'development') process.env.VITE_DEBUG = 'true'
  return {
    root: './src',
    publicDir: '../public',
    base: mode === 'development' ? PROXY_URL.pathname : './',
    build: {
      minify: 'esbuild',
      target: 'esnext',
      outDir: '../dist',
      assetsDir: './',
      emptyOutDir: true,
      rollupOptions: {
        // empty input, otherwise vite tries to include a non-existing index.html
        input: {},
        output: {
          // set this, if you have dynamic imports to make sure, those chunks are in the correct folder
          chunkFileNames: 'com.example/[name]-[hash].js'
        },
        // rollup-plugin-po2json uses rollup cache during the build process
        cache: true
      }
    },
    server: {
      port: PORT,
      hmr: ENABLE_HMR,
      https: {
        key: process.env.HOST_KEY,
        cert: process.env.HOST_CRT
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: [
      // proxy settings for Vite dev server
      vitePluginProxy({
        proxy: {
          [`${PROXY_URL.pathname}/api`.replace(/\/+/g, '/')]: {
            target: PROXY_URL.href,
            changeOrigin: true,
            secure: ENABLE_SECURE_PROXY
          },
          '/ajax': {
            target: PROXY_URL.href,
            changeOrigin: true,
            secure: ENABLE_SECURE_PROXY
          },
          '/help': {
            target: PROXY_URL.href,
            changeOrigin: true,
            secure: ENABLE_SECURE_PROXY
          },
          '/meta': {
            target: PROXY_URL.href,
            changeOrigin: true,
            secure: ENABLE_SECURE_PROXY
          },
          '/socket.io/appsuite': {
            target: `wss://${PROXY_URL.host}/socket.io/appsuite`,
            ws: true,
            changeOrigin: true,
            secure: ENABLE_SECURE_PROXY
          }
        },
        httpProxy: ENABLE_HTTP_PROXY && {
          target: PROXY_URL.href,
          port: PROXY_URL.port || 8080
        },
        frontends: FRONTEND_URIS && FRONTEND_URIS.split(',').map(uri => ({ target: uri, secure: ENABLE_SECURE_FRONTENDS }))
      }),
      // serve JSON manifest files and build-time metadata
      vitePluginOxManifests({
        watch: true,
        manifestsAsEntryPoints: true,
        // is just used in dev mode
        includeServerManifests: true,
        // add some metadata here to identify the ui plugin later on
        meta: {
          id: 'plugin-example',
          name: 'Plugin Example',
          buildDate: new Date().toISOString(),
          commitSha: process.env.CI_COMMIT_SHA,
          version: String(process.env.APP_VERSION || '')
        }
      }),
      // serve external modules starting with "$" (core-ui)
      vitePluginOxExternals({
        prefix: '$'
      }),
      // inject loading of stylesheets in javascript files
      vitePluginOxCss(),
      // localizations (PO files via gettext)
      gettextPlugin({
        poFiles: 'src/i18n/*.po',
        outFile: 'example.pot',
        defaultDictionary: 'com.example',
        defaultLanguage: 'en_US'
      }),
      // copy existing assets from source directory that are not imported in source code
      rollupPluginCopy({
        targets: [
          { src: './src/themes/icons/*', dest: 'public/themes/icons' }
        ],
        hook: 'buildStart'
      })
    ]
  }
})
