import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BciqheaderComponent } from './bciqheader.component';

describe('BciqheaderComponent', () => {
    let component: BciqheaderComponent;
    let fixture: ComponentFixture<BciqheaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BciqheaderComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(BciqheaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
