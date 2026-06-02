/* eslint-disable license-header/header */

import { Settings } from '$/io.ox/core/settings'

export const settings = new Settings('app.ivicos-campus/ivCampus', () => ({
  baseUrl: 'https://campus-alpha-client-git-ox-iframe-login-ivicos.vercel.app/ox/auth',
  oidcIssuer: 'https://sso-ivicos.demo.open-xchange.com/realms/oxlab',
  oidcClientId: 'ivCampus',
  oidcRedirectUri: 'https://campus-alpha-client-git-ox-iframe-login-ivicos.vercel.app/ox/auth/callback',
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
