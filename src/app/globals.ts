import { Injectable } from '@angular/core';
//import { userAccess } from './domain/userAccess';
//import { searchParams } from './domain/searchParams';
@Injectable()
export class Globals {
    uri: string = 'home';
    idTokenName!: string;
    uName!: string;
    havingBCIQInquiryRole: boolean = false;
    postLogOutURI!: string;
}