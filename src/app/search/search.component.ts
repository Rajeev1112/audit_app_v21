import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { IClaimantInfo } from '../models/claimant-info.model';
import { SearchParams } from '../models/search-params.model';
import { ClaimantInformationService } from '../service/claimant-information.service';
import { UserServiceService } from '../service/user-service.service';
import { User } from '../models/user.model';
import { commonHelper } from '../util/commonHelper';
import { Globals } from '../globals';
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
    @Input() claimantInfo!: IClaimantInfo;
    @Input() userInfo!: User;
    @Output() claimantInfoChanged: EventEmitter<any> = new EventEmitter();
    @ViewChild('ssnNo') ssnNoInput: any;
    @ViewChild('startDate') startDateInput: any;
    @ViewChild('endDate') endDateInput: any;
    user!: User;
    globals!: Globals;
    searchParams!: SearchParams;
    constructor(
        private claimantInformationService: ClaimantInformationService,
        private userService: UserServiceService,
        globals: Globals,
    ) {}
    ngOnInit(): void {}
    onSearch(ssnNo: string, startDate: string, endDate: string) {
        this.searchParams = {
            ssn: ssnNo,
            startDate: startDate,
            endDate: endDate,
            requestorID: this.userInfo?.preferred_username ?? '',
        };
        this.loadAPIData(this.searchParams);
    }
    ssnNoLostfocus(obj1: any) {
        const formattedSSN = commonHelper.ssnNoFormat(
            this.ssnNoInput.nativeElement.value,
        );
        this.ssnNoInput.nativeElement.value = formattedSSN;
    }
    loadAPIData(reqParams: SearchParams) {
        this.claimantInformationService
            .getClaimantInformation(reqParams)
            .subscribe({
                next: (response) => {
                    this.claimantInfo = response;
                    this.claimantInfo.startDate_UI = reqParams.startDate;
                    this.claimantInfo.endDate_UI = reqParams.endDate;
                    this.claimantInfoChanged.emit(this.claimantInfo);
                },
                error: (err) => {
                    console.error('Error while getting claimant information:', err);
                    this.claimantInfoChanged.emit(this.claimantInfo);
                },
            });
    }
    onClear() {
        this.ssnNoInput.nativeElement.value = '';
        this.startDateInput.nativeElement.value = '';
        this.endDateInput.nativeElement.value = '';
        this.ssnNoInput.nativeElement.focus();
        this.claimantInfo = {} as any;
        this.claimantInfoChanged.emit(this.claimantInfo);
    }
}
