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
