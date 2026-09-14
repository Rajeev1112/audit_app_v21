import { Role } from './role.model';
export interface User {
    name: string;
    preferred_username: string;
    havingBCIQInquiryRole: boolean;
    idleTime: string;
    idTokenName: string;
    postLogOutURI: string;
    userInfo: any;
}
