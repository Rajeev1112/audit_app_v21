export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080',
    okta: {
        issuer: 'https://login-qa.ny.gov/oauth2/default',
        clientId: '0oa11ghk4jqQzJUZv298',
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