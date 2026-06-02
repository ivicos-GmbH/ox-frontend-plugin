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

// OX mail column IDs for getAll — explicitly declared to avoid relying on http.defaultColumns
// 600 = id, 601 = folder_id, 602 = attachment, 603 = from, 607 = to, 610 = cc,
// 611 = subject, 614 = flags, 652 = received_date, 656 = sent_date, 661 = date
export const MAIL_LIST_COLUMNS = '600,601,602,603,607,610,611,614,652,656,661'

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
