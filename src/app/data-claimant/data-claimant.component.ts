import { Component, OnInit, Input, OnChanges, SimpleChanges, } from '@angular/core';
import { IClaimantInfo } from '../models/claimant-info.model';
// import {CdkAccordionModule} from '@angular/cdk/accordion';

@Component({
    selector: 'app-data-claimant',
    templateUrl: './data-claimant.component.html',
    styleUrls: ['./data-claimant.component.scss']
})
export class DataClaimantComponent implements OnInit, OnChanges {
    @Input() claimantInfo!: IClaimantInfo;
    claimantInfoloc!: IClaimantInfo;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        const currValue = changes['claimantInfo'].currentValue;
        this.claimantInfoloc = currValue;
    }

    ngOnInit(): void {
        this.claimantInfoloc = this.claimantInfo;
    }
}
