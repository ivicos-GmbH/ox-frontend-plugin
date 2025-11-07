/* eslint-disable license-header/header */

export const sendMessageToIframe = (iframe, message, baseUrl) => {
  const iframeElement = iframe[0]
  if (iframeElement && iframeElement.contentWindow) {
    try {
      iframeElement.contentWindow.postMessage(message, baseUrl)
      console.log('Message sent to iframe:', message)
    } catch (error) {
      console.error('Error sending message to iframe:', error)
    }
  } else {
    console.warn('Iframe not ready for messaging')
  }
}

export const sendUserData = (userInfo, session, iframe, baseUrl) => {
  const userData = {
    type: 'USER_DATA',
    user: {
      id: userInfo.uid,
      name: userInfo.display_name,
      mail: userInfo.email1,
      loginInfo: userInfo.login_info,
      language: userInfo.locale,
    },
    session,
    timestamp: new Date().toISOString()
  }

  sendMessageToIframe(iframe, userData, baseUrl)
}

// Function to handle profile update
export const handleProfileUpdate = async (email, iframe) => {
  console.log('🔄 Updating ivCAMPUS profile...')

  // update the user data in the iframe
  try {
    const response = await fetch(`https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/get_updated_ox_user?email=${email}`)
    const data = await response.json()
    if (data.success) {
      console.log('User data:', data)
      // Instead of reloading the full window, just reload the iframe
      const currentSrc = iframe.attr('src')
      iframe.attr('src', currentSrc)
    } else {
      console.error('Error updating user data:', data.error)
    }
  } catch (error) {
    console.error('Error updating user data:', error)
  }
}
