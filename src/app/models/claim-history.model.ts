import { iProcessedWeeklyDetails } from "./processed-weekly-details.model";

export interface iClaimHistory {
    certificationIdentifier: string,
    entitlementType: string,
    netPaymentAmount: Number,
    claimWeekEndDate: Date,
    transactionTime: string,
    holiday: string,
    refusalOfemployment: Boolean,
    schoolBreak: Boolean,
    statutoryWeek: Date,
    transactionDate: Date,
    vacation: string,
    certificateWeekDate: Date,
    daysWorkedDuringCertificationPeriod: String,
    priorEmployment: Boolean,
    processedWeeklyDetails: iProcessedWeeklyDetails[]
}
