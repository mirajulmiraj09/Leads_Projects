import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNPSBBank } from './manage-npsbbank';

describe('ManageNPSBBank', () => {
  let component: ManageNPSBBank;
  let fixture: ComponentFixture<ManageNPSBBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageNPSBBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNPSBBank);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
