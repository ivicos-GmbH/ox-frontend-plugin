/* eslint-disable license-header/header */

/**
 * ivCAMPUS Plugin Settings Configuration
 *
 * This module defines and manages all configurable settings for the ivCAMPUS plugin.
 * Settings are persisted across sessions and can be modified through the OX settings UI.
 */

import { Settings } from '$/io.ox/core/settings'

/**
 * Main settings object for the ivCAMPUS plugin
 * Contains default values and configuration options
 */
export const settings = new Settings('app.ivicos-campus/ivCampus', () => ({
  // Core configuration URLs
  baseUrl: 'https://campus-alpha-client-git-ox-iframe-login-ivicos.vercel.app/ox/auth', // Main ivCAMPUS application URL
  oidcIssuer: 'https://sso-ivicos.demo.open-xchange.com/realms/oxlab', // OIDC identity provider URL
  oidcClientId: 'ivCampus', // OAuth2 client identifier
  oidcRedirectUri: 'https://campus-alpha-client-git-ox-iframe-login-ivicos.vercel.app/ox/auth/callback', // OAuth2 callback URL

  // User preference settings (commented out for future use)
  // userName: 'John Doe', // User's display name preference
  // email: 'john@example.com', // User's email preference

  // Application behavior settings
  department: 'IT', // User's department (could affect permissions/features)
  notifications: true, // Enable/disable notification features
  autoRefresh: 30, // Auto-refresh interval in seconds
  profileUpdateTrigger: 0 // Counter incremented when profile update button is clicked
}))

// Make settings globally accessible for development and console testing
// This allows developers to inspect and modify settings via browser console
if (typeof window !== 'undefined') {
  window.ivCampusSettings = settings
}

/**
 * Helper function to extract the origin (protocol + domain + port) from the base URL
 * Used for postMessage communication with the iframe
 *
 * @returns {string|null} The origin URL or null if baseUrl is invalid
 */
export const getBaseUrlOrigin = () => {
  const baseUrl = settings.get('baseUrl')
  console.log('getBaseUrlOrigin - baseUrl from settings:', baseUrl)

  if (baseUrl) {
    try {
      // Extract origin (protocol://domain:port) from full URL
      const origin = new URL(baseUrl).origin
      console.log('getBaseUrlOrigin - calculated origin:', origin)
      return origin
    } catch (error) {
      console.error('getBaseUrlOrigin - error creating URL:', error)
      return null
    }
  }
  return null
}
