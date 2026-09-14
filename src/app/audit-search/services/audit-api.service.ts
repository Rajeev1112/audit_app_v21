import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuditRecord, AuditSearchCriteria, ClaimInformation, EventStatus, EventType } from '../models/audit-record.model';
import { environment } from 'src/environments/environment';

/**
 * Represents a raw audit event response from the backend API.
 * Maps to AuditEventResponse.java
 */
interface RawAuditResponse {
  id?: string;
  requestTimestamp: string;
  userId: string;
  firstName: string;
  lastName: string;
  ipAddress: string;
  eventType: string;
  actionType?: string;
  applicationName: string;
  businessFunction: string;
  status: string;
  componentName?: string;
  correlationId: string;
  eventData: string;
  errorMessage?: string;
  createdAt?: string;
  eventChannelName?: string;
}

/**
 * Represents the parsed event data within a RawAuditResponse.
 * Can be either response data (with claimant info) or request data.
 */
interface RawEventData {
  // Response event data fields
  ssn?: string;
  firstName?: string;
  lastName?: string;
  claimantAddress?: string;
  claimantIdentifier?: string;
  claimantName?: string;
  claimantNameAndAddress?: string;
  state?: string;
  todaysDate?: string;
  returnCode?: string;
  returnCodeDescription?: string;
  claimList?: Array<Record<string, unknown>>;
  // Request event data fields
  startDate?: string;
  endDate?: string;
  requestorID?: string;
  [key: string]: unknown;
}

/**
 * Wrapper for paginated API responses
 */
interface PagedResponse {
  content: RawAuditResponse[];
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.buildApiUrl();

  /**
   * Searches for audit records based on the provided criteria
   */
  search(criteria: AuditSearchCriteria): Observable<AuditRecord[]> {
    return this.http.post<unknown>(this.apiUrl, criteria).pipe(
      map(response => this.processSearchResponse(response, criteria)),
      catchError(error => {
        console.error('Audit search failed');
        return throwError(() => new Error('Failed to fetch audit records'));
      })
    );
  }

  /**
   * Processes the API response and returns mapped audit records
   */
  private processSearchResponse(response: unknown, criteria: AuditSearchCriteria): AuditRecord[] {
    try {
      const responses = this.extractResponseArray(response);
      return responses
        .map((item: unknown) => this.mapResponse(item as RawAuditResponse, criteria))
        .filter((record: AuditRecord | null): record is AuditRecord => record !== null)
        .filter((record: AuditRecord) => this.matchesCriteria(record, criteria));
    } catch (error) {
      console.error('Error processing audit search response');
      return [];
    }
  }

  /**
   * Extracts the array of records from the API response
   * Handles both direct arrays and paginated responses with a 'content' property
   */
  private extractResponseArray(response: unknown): RawAuditResponse[] {
    if (Array.isArray(response)) {
      return response as RawAuditResponse[];
    }

    const pagedResponse = response as Record<string, unknown>;
    if (pagedResponse && pagedResponse['content'] && Array.isArray(pagedResponse['content'])) {
      return pagedResponse['content'] as RawAuditResponse[];
    }

    return response ? [response as RawAuditResponse] : [];
  }

  /**
   * Checks if a record matches the search criteria (date range, filters)
   */
  private matchesCriteria(record: AuditRecord, criteria: AuditSearchCriteria): boolean {
    const eventDate = new Date(`${record.eventDate}T${record.eventTime}`);
    const dateRange = this.isDateInRange(
      eventDate,
      criteria.startDate,
      criteria.endDate
    );

    return dateRange &&
      this.matchesApplicationName(record.applicationName, criteria.applicationName) &&
      this.matchesUserName(record.userName, criteria.firstName, criteria.lastName) &&
      this.matchesEventType(record.eventType, criteria.eventType) &&
      this.matchesEventStatus(record.eventStatus, criteria.eventStatus);
  }

  /**
   * Transforms a raw API response into an AuditRecord
   */
  private mapResponse(response: RawAuditResponse, criteria: AuditSearchCriteria): AuditRecord | null {
    try {
      if (!response?.eventData) {
        return null;
      }

      const eventData = this.parseEventData(response.eventData, response.correlationId);
      if (!eventData) {
        return null;
      }

      if (!this.hasClaimantInformation(eventData)) {
        return null;
      }

      return this.buildAuditRecord(response, eventData, criteria);
    } catch (error) {
      console.error('Error mapping audit response for correlationId:', response?.correlationId);
      return null;
    }
  }

  /**
   * Parses the eventData JSON string with validation
   */
  private parseEventData(eventDataStr: string, correlationId: string): RawEventData | null {
    try {
      const parsed = JSON.parse(eventDataStr);

      // Validate that parsed data is an object
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn(`Invalid eventData structure for correlationId: ${correlationId}`);
        return null;
      }

      return parsed as RawEventData;
    } catch (parseError) {
      console.warn(`Failed to parse eventData as JSON for correlationId: ${correlationId}`);
      return null;
    }
  }

  /**
   * Checks if the event data contains claimant information (response event, not request-only)
   */
  private hasClaimantInformation(eventData: RawEventData): boolean {
    return !!(eventData.claimantName && eventData.claimantAddress);
  }

  /**
   * Builds an AuditRecord from raw response and event data
   */
  private buildAuditRecord(
    response: RawAuditResponse,
    eventData: RawEventData,
    criteria: AuditSearchCriteria
  ): AuditRecord {
    const eventDate = new Date(response.requestTimestamp);
    const claimantInformation = this.buildClaimantInformation(eventData);

    return {
      id: response.correlationId,
      eventDate: eventDate.toISOString().slice(0, 10),
      eventTime: eventDate.toISOString().slice(11, 19),
      userId: response.userId,
      userName: `${response.firstName} ${response.lastName}`,
      eventType: this.toEventType(response.eventType),
      eventStatus: this.toEventStatus(response.status),
      applicationName: response.applicationName,
      businessFunction: response.businessFunction,
      ipAddress: response.ipAddress,
      requestData: {
        ssn: eventData.ssn || '',
        startDate: criteria.startDate,
        endDate: criteria.endDate
      },
      responseData: { claimantInformation }
    };
  }

  /**
   * Builds claimant information from event data
   */
  private buildClaimantInformation(eventData: RawEventData): ClaimInformation {
    const claimList = Array.isArray(eventData.claimList) ? eventData.claimList : [];

    return {
      ssn: eventData.ssn || '',
      firstName: eventData.firstName || '',
      lastName: eventData.lastName || '',
      claimantName: eventData.claimantName || '',
      claimantAddress: eventData.claimantAddress || '',
      claimantIdentifier: eventData.claimantIdentifier || '',
      claimantNameAndAddress: eventData.claimantNameAndAddress || '',
      state: eventData.state || '',
      todaysDate: eventData.todaysDate || '',
      returnCode: eventData.returnCode || '',
      returnCodeDescription: eventData.returnCodeDescription || '',
      claims: claimList,
      employerChargeDetails: this.extractEmployerChargeDetails(claimList)
    };
  }

  /**
   * Extracts employer charge details from claim list with type safety
   */
  private extractEmployerChargeDetails(
    claimList: Array<Record<string, unknown>>
  ): Array<Record<string, unknown>> {
    return claimList.flatMap((claim: Record<string, unknown>) => {
      const charges = claim['employerChargeDetails'];

      if (!Array.isArray(charges)) {
        return [];
      }

      // Ensure each charge is a proper object
      return charges.filter((charge): charge is Record<string, unknown> =>
        typeof charge === 'object' && charge !== null
      );
    });
  }

  /**
   * Checks if event date is within the specified date range
   */
  private isDateInRange(date: Date, startDateStr: string, endDateStr: string): boolean {
    const start = new Date(`${startDateStr}T00:00:00`);
    const end = new Date(`${endDateStr}T23:59:59`);
    return date >= start && date <= end;
  }

  /**
   * Checks if application name matches the criteria (or no filter applied)
   */
  private matchesApplicationName(appName: string, criteria?: string): boolean {
    if (!criteria) return true;
    return appName.toLowerCase().includes(criteria.toLowerCase());
  }

  /**
   * Checks if user name matches the criteria (or no filter applied)
   */
  private matchesUserName(userName: string, firstName?: string, lastName?: string): boolean {
    const [first = '', last = ''] = userName.toLowerCase().split(' ');

    const firstMatch = !firstName || first.includes(firstName.toLowerCase());
    const lastMatch = !lastName || last.includes(lastName.toLowerCase());

    return firstMatch && lastMatch;
  }

  /**
   * Checks if event type matches the criteria (or no filter applied)
   */
  private matchesEventType(eventType: EventType, criteria?: EventType | ''): boolean {
    return !criteria || criteria === eventType;
  }

  /**
   * Checks if event status matches the criteria (or no filter applied)
   */
  private matchesEventStatus(eventStatus: EventStatus, criteria?: EventStatus | ''): boolean {
    return !criteria || criteria === eventStatus;
  }

  /**
   * Converts event type string to EventType enum
   */
  private toEventType(eventType: string): EventType {
    return eventType.toLowerCase().replace(/^./, char => char.toUpperCase()) as EventType;
  }

  /**
   * Converts status string to EventStatus enum
   */
  private toEventStatus(status: string): EventStatus {
    return status.toLowerCase().replace(/^./, char => char.toUpperCase()) as EventStatus;
  }

  /**
   * Builds the API URL from environment configuration
   */
  private buildApiUrl(): string {
    const basePath = environment.apiUrl.replace(/\/$/, '');
    return `${basePath}/auditSearch`;
  }
}
