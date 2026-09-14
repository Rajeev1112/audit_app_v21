export class Audit {
    action!: string;
    actionType!: string;
    applicationName!: string;
    correlationId!: string;
    data!: Map<String, String>;
    date!: Date;
    functionName!: string;
    indicationOfEvent!: string;
    ipAddress!: string;
    primaryKey!: string;
    programName!: string;
    typeOfEvent!: string;
    userId!: string;
}
