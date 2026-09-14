import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsClaimantComponent } from './details-claimant.component';

describe('DetailsClaimantComponent', () => {
    let component: DetailsClaimantComponent;
    let fixture: ComponentFixture<DetailsClaimantComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailsClaimantComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DetailsClaimantComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
