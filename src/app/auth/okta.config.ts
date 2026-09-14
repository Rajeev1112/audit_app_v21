import { OktaAuth } from '@okta/okta-auth-js';
import { environment } from '../../environments/environment';
export const oktaAuth = new OktaAuth({
    issuer: environment.okta.issuer,
    clientId: environment.okta.clientId,
    redirectUri: environment.okta.redirectUri,
    postLogoutRedirectUri: environment.okta.postLogoutRedirectUri,
    scopes: environment.okta.scopes,
    pkce: true,
});
