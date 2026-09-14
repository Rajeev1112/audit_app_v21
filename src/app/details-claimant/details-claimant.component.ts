import {
    Component,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { IClaimantInfo } from '../models/claimant-info.model';
import { commonHelper } from '../util/commonHelper';
@Component({
    selector: 'app-details-claimant',
    templateUrl: './details-claimant.component.html',
    styleUrls: ['./details-claimant.component.scss'],
})
export class DetailsClaimantComponent implements OnInit, OnChanges {
    @Input() claimantInfo!: IClaimantInfo;
    claimantInfoloc!: IClaimantInfo;
    constructor() {}
    ngOnChanges(changes: SimpleChanges): void {
        const currValue = changes['claimantInfo']?.currentValue;
        this.claimantInfoloc = currValue;
    }
    ngOnInit(): void {
        this.claimantInfoloc = this.claimantInfo;
    }
    ssnNoFormat(ssnNoInput: string): string {
        return commonHelper.ssnNoFormat(ssnNoInput);
    }
}
