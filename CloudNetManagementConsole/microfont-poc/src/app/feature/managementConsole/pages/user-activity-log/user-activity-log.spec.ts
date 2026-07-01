import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivityLog } from './user-activity-log';

describe('UserActivityLog', () => {
  let component: UserActivityLog;
  let fixture: ComponentFixture<UserActivityLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActivityLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActivityLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
