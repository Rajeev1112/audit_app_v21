import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IClaimantInfo } from '../models/claimant-info.model';
import { SearchParams } from '../models/search-params.model';
@Injectable({
    providedIn: 'root',
})
export class ClaimantInformationService {
    private readonly basePath = environment.apiUrl.replace(/\/$/, '');
    constructor(private http: HttpClient) {}
    public getClaimantInformation(
        searchParams: SearchParams,
    ): Observable<IClaimantInfo> {
        const reqSearchParams = { ...searchParams };
        return this.http.post<IClaimantInfo>(
            `${this.basePath}/claimantInfo`,
            reqSearchParams,
        );
    }
}
