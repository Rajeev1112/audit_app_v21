import { Injectable } from '@angular/core';
import { oktaAuth } from './okta.config';
import { User } from '../models/user.model';
@Injectable({
    providedIn: 'root',
})
export class AuthUserService {
    async getCurrentUser(): Promise<User> {
        const tokens = await oktaAuth.tokenManager.getTokens();
        const idToken: any = tokens.idToken;
        const claims: any = idToken?.claims || {};
        const preferredUsername =
            claims.preferred_username ||
            claims.uid_claim ||
            claims.USERID ||
            claims.sub ||
            '';
        const firstName = claims.firstName || claims.given_name || '';
        const lastName = claims.lastName || claims.family_name || '';
        let displayName = preferredUsername;
        if (lastName && firstName) {
            displayName = `${lastName}, ${firstName} (${preferredUsername})`;
        } else if (claims.name) {
            displayName = `${claims.name} (${preferredUsername})`;
        }
        return {
            name: displayName,
            preferred_username: preferredUsername,
            idleTime: '1800',
            postLogOutURI: '/logout',
            userInfo: claims,
            idTokenName: idToken?.idToken || '',
            havingBCIQInquiryRole:
                String(claims['IES-core_BCIQ_Inquiry']).toLowerCase() === 'true',
        };
    }
}
