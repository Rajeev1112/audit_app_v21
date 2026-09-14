import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Globals } from '../globals';
import { ClaimantDetailsService } from '../service/claimant-details.service';
import { ClaimantInfo } from '../models/claimant.model';

@Component({
    selector: 'app-print-page',
    templateUrl: './print-page.component.html',
    styleUrls: ['./print-page.component.scss']
})
export class PrintPageComponent implements OnInit {
    claimantDetails: ClaimantInfo = new ClaimantInfo();
    loading = true;
    error = '';
    isBrowser: boolean;
    currentDate: Date = new Date();

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private globals: Globals,
        private claimantService: ClaimantDetailsService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit(): void {
        if (this.isBrowser) {
            this.loadClaimantDetails();
        }
    }

    loadClaimantDetails(): void {
        this.loading = true;

        // Try to get data from localStorage (passed from main page)
        const storedData = localStorage.getItem('printClaimantDetails');

        if (storedData) {
            try {
                this.claimantDetails = JSON.parse(storedData);
                this.loading = false;

                // Clear the stored data after retrieving
                localStorage.removeItem('printClaimantDetails');

                setTimeout(() => {
                    this.printPage();
                }, 500); // Wait for DOM to render
                return;
            } catch (error) {
                console.error('Error parsing stored claimant details:', error);
            }
        }

        // Try to get data from globals as fallback
        if (this.globals.claimantDetails && this.globals.claimantDetails.claimList) {
            this.claimantDetails = this.globals.claimantDetails;
            this.loading = false;
            setTimeout(() => {
                this.printPage();
            }, 500);
        } else {
            // If no data available, show error
            this.error = 'No claim data available for printing. Please return to the main page and try again.';
            this.loading = false;
        }
    }

    printPage(): void {
        if (this.isBrowser) {
            // Auto-print after content loads
            setTimeout(() => {
                window.print();

                // Close window after printing (optional)
                window.addEventListener('afterprint', () => {
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }, { once: true });
            }, 1000);
        }
    }

    // Helper methods from app.component.ts
    checkData(value: any): string {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return value.toString();
    }

    checkForYesNo(value: any): string {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return value === true || value === 'true' || value === 'Y' || value === 'Yes' ? 'Yes' : 'No';
    }

    checkObjectExist(obj: any, checkArray: boolean = false): boolean {
        if (checkArray) {
            return Array.isArray(obj) && obj.length > 0;
        }
        return obj !== null && obj !== undefined && Object.keys(obj).length > 0;
    }

    getActiveStatus(status: string, type: number): boolean {
        if (!status) return false;
        const statusUpper = status.toUpperCase();
        if (type === 0) {
            // Background color type
            return statusUpper.includes('ACTIVE') || statusUpper.includes('OPEN');
        } else {
            // Text color type  
            return statusUpper.includes('ACTIVE') || statusUpper.includes('OPEN');
        }
    }

    getStatus(status: string): string {
        if (!status) return 'N/A';
        return status;
    }

    zipCodeFormat(zipCode: string): string {
        if (!zipCode || zipCode.length !== 9) return zipCode || 'N/A';
        return `${zipCode.substring(0, 5)}-${zipCode.substring(5)}`;
    }

    // Navigate back to main page
    goBack(): void {
        if (this.isBrowser) {
            window.close();
        }
    }
}