/* eslint-disable license-header/header */

// API Configuration
export const API_CONFIG = {
  profileUpdate: 'https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/get_updated_ox_user',
  backendSync: 'https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/fetch_ox_data'
}

// Status and Priority Mappings
export const STATUS_MAP = {
  1: 'Not started',
  2: 'In progress',
  3: 'Done',
  4: 'Waiting',
  5: 'Deferred'
}

export const PRIORITY_MAP = {
  1: 'Low',
  2: 'Normal',
  3: 'High'
}

// Default Fetch Options
export const DEFAULT_FETCH_OPTIONS = {
  mail: {
    folder: 'default0/INBOX',
    limit: 50,
    fetchFullDetails: false
  },
  tasks: {
    excludeDelegatedToOthers: false
  },
  contacts: {
    limit: 100
  }
}
