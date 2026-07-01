import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundTransferLimit } from './fund-transfer-limit';

describe('FundTransferLimit', () => {
  let component: FundTransferLimit;
  let fixture: ComponentFixture<FundTransferLimit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundTransferLimit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundTransferLimit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
