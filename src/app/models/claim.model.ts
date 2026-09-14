import { iClaimHistory } from "./claim-history.model";
import { iDisqualificationData } from "./disqualification-data.model";
import { iEmployerChargeDetails } from "./employer-charge-details.model";
import { iForfeitData } from "./forfeit-data.model";
import { iOverPaymentDetails } from "./over-payment-details.model";

export interface IClaim {
    // batchNumber: string ,
    billing: Date,
    claimDaysUsed: string,
    claimEffectiveDate: Date,
    claimBYEDate: Date,
    wba: number,
    benefitYearEnding: Date,
    dateOfclaim: Date,
    currentRepayment: string,
    lastEmployer: string,
    dateOfDetermination: Date,
    disqualificationCount: string,
    daysLeft: string,
    effectiveDaysPaid: string,
    employerName: string,
    employerStreet: string,
    employerZipCode: Number,
    ersInSchedlue: string,
    expirationDate: Date,
    additionalClaimReopenClaim: Boolean,
    expirationYear2: Date,
    expirationYear1: Date,
    latestBenefitYearEnding: Date,
    maximumBenefitAmount: Date,
    postings: string,
    benefitProgram: string,
    remainingBalance: Number,
    pensionRate: Number,
    status: string,
    unavailable: string,
    validOriginalClaimsCount: string,
    workShare: string,
    entitlementType: string,
    amountRemaining: number,
    amountLeft: number,
    amountPaid: number,

    claimHistory: iClaimHistory[]
    disqualificationData: iDisqualificationData[],
    employerChargeDetails: iEmployerChargeDetails[],
    overPaymentDetails: iOverPaymentDetails[]
    forfeitData: iForfeitData[]
}
