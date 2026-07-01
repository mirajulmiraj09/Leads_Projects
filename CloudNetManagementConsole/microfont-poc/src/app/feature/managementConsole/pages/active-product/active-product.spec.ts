import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveProduct } from './active-product';

describe('ActiveProduct', () => {
  let component: ActiveProduct;
  let fixture: ComponentFixture<ActiveProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
