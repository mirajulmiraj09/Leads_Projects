import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetTPin } from './reset-tpin';

describe('ResetTPin', () => {
  let component: ResetTPin;
  let fixture: ComponentFixture<ResetTPin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetTPin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetTPin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
