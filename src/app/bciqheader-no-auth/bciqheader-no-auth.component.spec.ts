import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BciqheaderNoAuthComponent } from './bciqheader-no-auth.component';

describe('BciqheaderNoAuthComponent', () => {
    let component: BciqheaderNoAuthComponent;
    let fixture: ComponentFixture<BciqheaderNoAuthComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BciqheaderNoAuthComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(BciqheaderNoAuthComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
