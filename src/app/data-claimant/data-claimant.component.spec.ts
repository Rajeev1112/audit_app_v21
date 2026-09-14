import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataClaimantComponent } from './data-claimant.component';

describe('DataClaimantComponent', () => {
    let component: DataClaimantComponent;
    let fixture: ComponentFixture<DataClaimantComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DataClaimantComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DataClaimantComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
