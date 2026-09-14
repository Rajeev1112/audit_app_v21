import {
    Component,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { IClaimantInfo } from './models/claimant-info.model';
import { ElementRef } from '@angular/core';
import { commonHelper } from './util/commonHelper';
import { UserServiceService } from './service/user-service.service';
import { User } from './models/user.model';
import { Globals } from './globals';
import { AuthUserService } from './auth/auth-user.service';
import { oktaAuth } from './auth/okta.config';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    @ViewChildren('divDynamic') divs!: QueryList<ElementRef>;
    @ViewChildren('divClaimPlus') divClaimPlus!: QueryList<ElementRef>;
    @ViewChildren('divHisDynamic') divHisDynamic!: QueryList<ElementRef>;
    @ViewChildren('divEntPlus') divEntPlus!: QueryList<ElementRef>;
    @ViewChild('content') contentRef!: ElementRef;
    @ViewChild('BCIQ_CONTENT') bciqCONTENT!: ElementRef;

    expandedIndex = 0;
    ReadMore: boolean = true;
    //hiding info box
    visibleNoError: boolean = false;
    visibleError: boolean = false;
    visibleHasRole: boolean = false;
    visibleOnLoad: boolean = false;
    errorMessage: string = '';
    divExpanded: boolean = true;
    divEntitlement: boolean = true;
    divClaim: boolean = true;
    user!: User;
    name: any;
    globals!: Globals;
    claimantDetails!: IClaimantInfo;
    authInProgress: boolean = true;
    showAuditSearch: boolean = false;

    constructor(
        private authUserService: AuthUserService,
        globals: Globals,
    ) {
        this.globals = globals;
    }

    currentDate = Date.now();
    divList!: any[];
    isAuthenticated: boolean = false;
    title = 'bciqweb';

    async ngOnInit(): Promise<void> {
        this.visibleOnLoad = true;
        this.visibleHasRole = false;
        this.authInProgress = true;
        try {
            const search = window.location.search || '';
            const isLoginCallback =
                search.includes('code=') && search.includes('state=');
            if (isLoginCallback) {
                await oktaAuth.handleRedirect();
                // remove code/state from the URL in case Okta leaves them there
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname,
                );
            }
            const isAuthenticated = await oktaAuth.isAuthenticated();
            if (!isAuthenticated) {
                await oktaAuth.signInWithRedirect();
                return;
            }
            this.user = await this.authUserService.getCurrentUser();
            this.name = this.user.name;
            this.globals.uName = this.user.preferred_username;
            this.globals.idTokenName = this.user.idTokenName;
            this.globals.postLogOutURI = this.user.postLogOutURI;
            this.globals.havingBCIQInquiryRole = this.user.havingBCIQInquiryRole;
            this.visibleHasRole = this.user.havingBCIQInquiryRole === true;
            this.authInProgress = false;
            this.visibleOnLoad = false;
        } catch (err) {
            this.visibleHasRole = false;
            this.authInProgress = false;
            this.visibleOnLoad = false;
        }
    }

    onClaimantInfoChanged(claimantInfo: IClaimantInfo) {
        this.errorMessage = '';
        this.visibleError = false;
        this.visibleNoError = true;

        this.claimantDetails = claimantInfo;
        if (this.claimantDetails == null) {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage = 'Service down due to a technical issue. For further assistance, please contact your system administartor or supervisor.';
        } else if (this.claimantDetails.claimList === undefined) {
            this.visibleNoError = false;
        } else if (this.claimantDetails.returnCode == '000') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage = 'System unreponsive due to a technical issue. For further assistance, please contact your system administartor or supervisor.';
        } else if (this.claimantDetails.returnCode === '0001') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage = 'Please enter SSN in numeric format only.';
        } else if (this.claimantDetails.returnCode === '0002') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage = 'Please correct the SSN length to 9 digits.';
        } else if (this.claimantDetails.returnCode === '0004') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage =
                'Service is down due to a technical issue. For further assistance, please contact your local/LAN administartor or supervisor.';
        } else if (this.claimantDetails.returnCode === '0005') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage =
                'SSN not found, please refine the search criteria and try again.';
        } else if (this.claimantDetails.returnCode === '0006') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage =
                'Service is down due to a Technical Issue. For further assistance, please contact your Supervisor or Local Administrator.';
        } else if (this.claimantDetails.returnCode === '0007') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage =
                'No data was found in the given date range for the SSN. Please refine the search criteria and try again.';
        } else if (this.claimantDetails.returnCode === '0008') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage =
                'The date range is more than one year, please refine the search criteria and try again.';
        } else if (this.claimantDetails.returnCode === '0009') {
            this.visibleNoError = false;
            this.visibleError = true;
            this.errorMessage =
                'Please complete SSN, Start Date, and End Date fields.';
        } else {
            this.visibleError = false;
            this.visibleNoError = true;
        }

    }

    zipCodeFormat(param1: any) {
        if (param1 == null) return '-';
        else if (param1 === '') return '-';
        else {
            let formatted = commonHelper.zipCodeFormat(param1);
            return formatted;
        }
    }

    //onclick toggling both
    onclick() {
        this.ReadMore = !this.ReadMore; //not equal to condition
        this.visibleNoError = !this.visibleNoError;
    }

    checkData(param1: any): string {
        if (param1 == null) return '-';
        else if (param1 === '') return '-';
        else return param1;
    }

    checkForYesNo(param1: any): string {
        if (param1 == null) return '-';
        else if (param1 === 'Y') return 'Yes';
        else if (param1 === 'N') return 'No';
        else if (param1.trim() === '') return 'No';
        else return param1;
    }

    getActiveStatus(param1: any, param2: number): boolean {
        let isActiveStatus: boolean = false;

        if (param1 == null) isActiveStatus = false;
        else {
            isActiveStatus = false;
            if (param1 === 'ACTV') isActiveStatus = true;
            else {
                if (param2 == 1) {
                    if (param1 === 'BANK') isActiveStatus = false;
                    else isActiveStatus = true;
                }
            }
        }
        return isActiveStatus;
    }

    getStatus(param1: any): string {
        let isActiveStatus: boolean = true;

        if (param1 == null) return '-';
        else {
            if (param1 === 'ACTV') {
                param1 = 'Active';
                isActiveStatus = true;
            } else {
                isActiveStatus = false;
                if (param1 === 'CACL') param1 = 'Cancelled';
                else if (param1 === 'LIQD') param1 = 'Liquidated';
                else if (param1 === 'BANK') param1 = 'Discharged in Bankruptcy';
                else if (param1 === 'INAC') param1 = 'Inactive';
            }
        }
        return param1;
    }

    getBenefitProgram(param1: any): string {
        param1 = this.checkData(param1);

        switch (param1) {
            case '2': {
                param1 = 'UCX';
                break;
            }
            case '3': {
                param1 = 'SEAP';
                break;
            }
            case '4': {
                param1 = 'JOINT';
                break;
            }
            case '5': {
                param1 = 'CWC';
                break;
            }
            case '6': {
                param1 = 'UI';
                break;
            }
            case '7': {
                param1 = 'UCPW';
                break;
            }
            case '8': {
                param1 = 'T599';
                break;
            }
            case '9': {
                param1 = 'SW';
                break;
            }
            case 'C': {
                param1 = 'CWC';
                break;
            }
            case 'D': {
                param1 = 'JOINT UCX-CWC';
                break;
            }
            case 'E': {
                param1 = 'JOINT UCFE-CWC';
                break;
            }
            case 'F': {
                param1 = 'UCFE';
                break;
            }
            case 'J': {
                param1 = 'JOINT UI-UCFE';
                break;
            }
            case 'K': {
                param1 = 'JOINT UCX-UI';
                break;
            }
            case 'L': {
                param1 = 'JOINT UCX-UCFE';
                break;
            }
            case 'M': {
                param1 = 'JOINT UCX-UI-UCFE';
                break;
            }
            case 'U': {
                param1 = 'REGULAR UI';
                break;
            }
            case 'W': {
                param1 = 'SHARED WORK';
                break;
            }
            case 'X': {
                param1 = 'UCX';
                break;
            }
            default: {
                break;
            }
        }

        return param1;
    }

    // getDateinFormat(prmDate : string, prmFormat : any): string
    // {
    //   this.datePipe.transform(prmDate,"MM/dd/yyyy");
    //   return prmDate;
    // }

    checkDisqualificationCount(param1: any): boolean {
        param1 = +0;
        if (param1 > 0) return true;
        else return false;
    }

    checkObjectExist(param1: any, checkLength: boolean = false): boolean {
        if (param1 === undefined) {
            return false;
        } else {
            if (param1 != null) {
                if (checkLength) {
                    if (param1.length > 0) return true;
                    else return false;
                } else return true;
            } else return false;
        }
    }

    showHide() {
        this.divExpanded = !this.divExpanded;
        // const nId = _modRef.toString();
        // this.status = !this.status;
        // if(this.status) {
        // document.getElementById(nId).style.display = 'none';

        // ...
    }

    checkBackgroundCollapse(rownNo: string): boolean {
        let divCollapse: boolean = false;
        for (let div of this.divHisDynamic.toArray()) {
            if (div.nativeElement.id == rownNo) {
                var valHidden = div.nativeElement.hidden;
                if (valHidden) divCollapse = true;
                else divCollapse = false;
            }
        }

        return divCollapse;
    }

    showHideEntitlement(_event: any, rownNo: string) {
        for (let div of this.divHisDynamic.toArray()) {
            if (div.nativeElement.id == rownNo) {
                var valHidden = div.nativeElement.hidden;
                div.nativeElement.hidden = !valHidden;
                if (div.nativeElement.hidden) {
                    div.nativeElement.style.display = 'none';
                } else {
                    div.nativeElement.style.display = 'block';
                }
                //alert(div.nativeElement.hidden);
            } else {
                div.nativeElement.hidden = true;
                div.nativeElement.style.display = 'none';
            }
        }

        for (let div of this.divEntPlus.toArray()) {
            var re = /his_/gi;
            rownNo = rownNo.replace(re, 'entPlus_');
            if (div.nativeElement.id == rownNo) {
                var val1 = div.nativeElement.innerHTML;
                if (val1 == '+') div.nativeElement.innerHTML = '-';
                else div.nativeElement.innerHTML = '+';
                //alert(div.nativeElement.hidden);
            } else {
                var val1 = div.nativeElement.innerHTML;
                if (val1 == '-') div.nativeElement.innerHTML = '+';
            }
        }
    }

    showHideClaim(_event: any, rownNo: string) {
        //alert(rownNo);
        //this.divs.forEach((div: ElementRef) => console.log(div.nativeElement));

        for (let div of this.divs.toArray()) {
            //console.log(div.nativeElement)
            if (div.nativeElement.id == rownNo) {
                var valHidden = div.nativeElement.hidden;
                div.nativeElement.hidden = !valHidden;
                if (div.nativeElement.hidden) div.nativeElement.style.display = 'none';
                else div.nativeElement.style.display = 'block';
                //alert(div.nativeElement.hidden);
            } else {
                div.nativeElement.hidden = true;
                div.nativeElement.style.display = 'none';
            }
        }

        for (let div of this.divClaimPlus.toArray()) {
            var re = /a_/gi;
            rownNo = rownNo.replace(re, 'claimPlus_');
            if (div.nativeElement.id == rownNo) {
                var val1 = div.nativeElement.innerHTML;
                if (val1 == '+') div.nativeElement.innerHTML = '-';
                else div.nativeElement.innerHTML = '+';
                //alert(div.nativeElement.hidden);
            } else {
                var val1 = div.nativeElement.innerHTML;
                if (val1 == '-') div.nativeElement.innerHTML = '+';
            }
            // else{
            //   div.nativeElement.style.display='none';
            //   div.nativeElement.innerHTML='+';
            // }
        }
    }

    parentprintBCIQ() {
        // Expand all claim details and history sections for printing
        this.expandAllForPrint();

        // Force a reflow to ensure the DOM updates are rendered
        const forceReflow = document.body.offsetHeight;

        // Add print-specific class to body to trigger print CSS
        document.body.classList.add('print-mode');

        // Use setTimeout to ensure DOM updates and CSS are fully applied before print dialog
        setTimeout(() => {
            // Force another reflow to ensure all CSS changes are applied
            const forceReflow2 = document.body.offsetHeight;

            // Trigger browser print dialog
            window.print();

            // Remove print class after print dialog closes
            window.addEventListener('afterprint', () => {
                document.body.classList.remove('print-mode');
                // Collapse all sections back to original state
                this.collapseAllAfterPrint();
            }, { once: true });
        }, 500);
    }

    expandAllForPrint() {
        // Expand all claim details divs using DOM selectors
        const claimDetails = document.querySelectorAll('[id^="a_"]');
        claimDetails.forEach((element: Element) => {
            const htmlElement = element as HTMLElement;
            htmlElement.removeAttribute('hidden');
            // Remove the inline style completely and set display explicitly
            htmlElement.style.removeProperty('display');
            htmlElement.style.display = 'block';
            htmlElement.style.visibility = 'visible';
            htmlElement.style.height = 'auto';
            htmlElement.style.minHeight = 'auto';
            htmlElement.style.maxHeight = 'none';
            htmlElement.style.overflow = 'visible';
        });

        // Update claim expand/collapse buttons to show '-'
        const claimButtons = document.querySelectorAll('[id^="claimPlus_"]');
        claimButtons.forEach((element: Element) => {
            element.innerHTML = '-';
        });

        // Expand all claim history sections using DOM selectors
        const historyDetails = document.querySelectorAll('[id^="his_"]');
        historyDetails.forEach((element: Element) => {
            const htmlElement = element as HTMLElement;
            htmlElement.removeAttribute('hidden');
            // Remove the inline style completely and set display explicitly
            htmlElement.style.removeProperty('display');
            htmlElement.style.display = 'block';
            htmlElement.style.visibility = 'visible';
            htmlElement.style.height = 'auto';
            htmlElement.style.minHeight = 'auto';
            htmlElement.style.maxHeight = 'none';
            htmlElement.style.overflow = 'visible';
        });

        // Update history expand/collapse buttons to show '-'
        const entitlementButtons = document.querySelectorAll('[id^="entPlus_"]');
        entitlementButtons.forEach((element: Element) => {
            element.innerHTML = '-';
        });
    }

    collapseAllAfterPrint() {
        // Collapse all claim details back to hidden using DOM selectors
        const claimDetails = document.querySelectorAll('[id^="a_"]');
        claimDetails.forEach((element: Element) => {
            const htmlElement = element as HTMLElement;
            htmlElement.setAttribute('hidden', '');
            htmlElement.style.display = 'none';
        });

        // Reset claim buttons back to '+'
        const claimButtons = document.querySelectorAll('[id^="claimPlus_"]');
        claimButtons.forEach((element: Element) => {
            element.innerHTML = '+';
        });

        // Collapse all history sections back to hidden using DOM selectors
        const historyDetails = document.querySelectorAll('[id^="his_"]');
        historyDetails.forEach((element: Element) => {
            const htmlElement = element as HTMLElement;
            htmlElement.setAttribute('hidden', '');
            htmlElement.style.display = 'none';
        });

        // Reset history buttons back to '+'
        const entitlementButtons = document.querySelectorAll('[id^="entPlus_"]');
        entitlementButtons.forEach((element: Element) => {
            element.innerHTML = '+';
        });
    }

    // logout() {

    onAuditClick(): void {
        this.showAuditSearch = true;
    }

    onBackClick(): void {
        this.showAuditSearch = false;
    }
}
