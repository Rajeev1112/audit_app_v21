import { Injectable } from '@angular/core';
import { oktaAuth } from '../auth/okta.config';
@Injectable({
    providedIn: 'root',
})
export class UserServiceService {
    public async logout(): Promise<void> {
        try {
            await oktaAuth.signOut({
                clearTokensBeforeRedirect: true,
                postLogoutRedirectUri: window.location.origin + '/',
            });
        } catch (e) {
            oktaAuth.tokenManager.clear();
            localStorage.removeItem('okta-token-storage');
            sessionStorage.clear();
            window.location.assign('/');
        }
    }
}
