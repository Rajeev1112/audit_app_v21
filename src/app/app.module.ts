import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { BciqheaderComponent } from './bciqheader/bciqheader.component';
import { SearchComponent } from './search/search.component';
import { DataClaimantComponent } from './data-claimant/data-claimant.component';
import { DetailsClaimantComponent } from './details-claimant/details-claimant.component';
import { BlankNoDataComponent } from './blank-no-data/blank-no-data.component';
import { Globals } from './globals';
import { BciqheaderNoAuthComponent } from './bciqheader-no-auth/bciqheader-no-auth.component';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { oktaAuth } from './auth/okta.config';
import { AppAuditSearchComponent } from './audit-search/app-audit-search.component';

@NgModule({
    declarations: [
        AppComponent,
        BciqheaderComponent,
        SearchComponent,
        DataClaimantComponent,
        DetailsClaimantComponent,
        BlankNoDataComponent,
        BciqheaderNoAuthComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        BrowserModule,
        NgbModule,
        AppRoutingModule,
        OktaAuthModule,
        AppAuditSearchComponent
    ],
    providers: [
        Globals,
        { provide: OKTA_CONFIG, useValue: { oktaAuth } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
