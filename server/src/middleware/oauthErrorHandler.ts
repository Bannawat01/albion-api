export const handleOAuthError = (error: string): Response => {
    const redirectUrl = error === 'access_denied'
        ? 'http://localhost:3000/' //todo: change to https or production url
        : 'http://localhost:3000/login?error=oauth_error'

    return Response.redirect(redirectUrl, 302)
}