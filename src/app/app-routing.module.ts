import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AppAuditSearchComponent } from './audit-search/app-audit-search.component';

const routes: Routes =
    [
        { path: '', component: AppComponent },
        { path: 'audit-search', component: AppAuditSearchComponent }
    ];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
