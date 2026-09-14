import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, tap } from "rxjs/operators";
import { Observable, throwError as ObservableThrowError } from 'rxjs';
import { IClaimantInfo } from '../models/claimant-info.model';

const httpoptions = { headers: new HttpHeaders({ "content-type": "application/json" }) };

@Injectable({
  providedIn: 'root'
})

export class ReadFileService {
  private _url: string = "/assets/data/333333127.json";

  constructor(private http: HttpClient) { }

  fetchData(): Observable<IClaimantInfo> {
    return this.http.get<IClaimantInfo>(this._url)
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    return ObservableThrowError(error.message || "Server Error")
  }
}
