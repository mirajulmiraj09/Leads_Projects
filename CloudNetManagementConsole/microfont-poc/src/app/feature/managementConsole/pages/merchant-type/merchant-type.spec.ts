import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantType } from './merchant-type';

describe('MerchantType', () => {
  let component: MerchantType;
  let fixture: ComponentFixture<MerchantType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
