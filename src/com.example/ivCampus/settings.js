/* eslint-disable license-header/header */

import { Settings } from '$/io.ox/core/settings'

// Defaults only, and deliberately pointing at staging. The middleware's jslob overrides anything
// set in a properties file, so a production deployment supplies its own values:
//   /opt/open-xchange/etc/settings/ivcampus.properties
//   app.ivicos-campus/ivCampus//baseUrl=https://<campus-origin>/ox/auth?tenant=<id>
//   app.ivicos-campus/ivCampus//apiBaseUrl=https://<api-origin>/v1/idp
//
// The beta gateway requires a branch segment; 'default' targets the canonical beta
// identity-provider rather than a per-branch deployment, which is removed when its PR closes.
export const settings = new Settings('app.ivicos-campus/ivCampus', () => ({
  baseUrl: 'https://campus-alpha-client-git-ox-iframe-login-ivicos.vercel.app/ox/auth',
  apiBaseUrl: 'https://api-de-eu.ivicos-campus.app/beta/idp/default',
  department: 'IT',
  notifications: true,
  autoRefresh: 30,
  profileUpdateTrigger: 0
}))

// // Make settings globally accessible for console testing
// if (typeof window !== 'undefined') {
//   window.ivCampusSettings = settings
// }

// Helper function to get base URL origin
export const getBaseUrlOrigin = () => {
  const baseUrl = settings.get('baseUrl')
  if (!baseUrl) return null
  try {
    return new URL(baseUrl).origin
  } catch (error) {
    console.error('getBaseUrlOrigin - error creating URL:', error)
    return null
  }
}
