export const environment = {
    production: true,
    apiUrl: 'https://uimclaimantinformation-service-yqbsexntna-uk.a.run.app',
    okta: {
        issuer: 'https://login-qa.ny.gov/oauth2/default',
        clientId: '0oa125tgj8saaw7tm298',
        redirectUri: window.location.origin + '/',
        postLogoutRedirectUri: window.location.origin + '/',
        scopes: [
            'openid',
            'profile',
            'email',
            'IES',
            'address',
            'phone',
            'offline_access',
        ],
    },
};
