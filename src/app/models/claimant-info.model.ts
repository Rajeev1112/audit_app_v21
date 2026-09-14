import { IClaim } from "./claim.model";

export interface IClaimantInfo {
    ssn: string,
    claimantAddress: string,
    claimantIdentifier: string,
    firstName: string,
    lastName: string,
    claimantName: string,
    claimantNameAndAddress: string,
    state: string,
    todaysDate: Date,
    returnCode: string,
    returnCodeDescription: string,
    startDate_UI: string,
    endDate_UI: string,
    userName: string,
    claimList: IClaim[]
}

