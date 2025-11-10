/* eslint-disable license-header/header */
export const handleProfileUpdate = async (email, iframe) => {
  try {
    const response = await fetch(`https://api-de-eu.ivicos-campus.app/beta/idp/ox-iframe-login/v1/me/ox_oidc/get_updated_ox_user?email=${email}`)
    const data = await response.json()
    if (data.success) {
      const currentSrc = iframe.attr('src')
      iframe.attr('src', currentSrc)
    } else {
      console.error('Error updating user data:', data.error)
    }
  } catch (error) {
    console.error('Error updating user data:', error)
  }
}
