import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Globals } from '../globals';
import { UserServiceService } from '../service/user-service.service';
import { oktaAuth } from '../auth/okta.config';

@Component({
    selector: 'app-bciqheader',
    templateUrl: './bciqheader.component.html',
    styleUrls: ['./bciqheader.component.scss'],
})
export class BciqheaderComponent {
    globals!: Globals;
    visibleHasRole: boolean = false;
    @Output('parentprintBCIQ') parentprintBCIQ: EventEmitter<any> =
        new EventEmitter();
    @Output('auditClicked') auditClicked: EventEmitter<void> =
        new EventEmitter();

    constructor(
        globals: Globals,
        private userService: UserServiceService,
    ) {
        this.globals = globals;
    }

    ngOnInit(): void { }

    async logout() {
        await this.userService.logout();
    }

    printBCIQ() {
        this.parentprintBCIQ.emit();
    }

    onAuditClick(): void {
        this.auditClicked.emit();
    }

    getUserName(): string {
        return this.globals.uName;
    }
}
