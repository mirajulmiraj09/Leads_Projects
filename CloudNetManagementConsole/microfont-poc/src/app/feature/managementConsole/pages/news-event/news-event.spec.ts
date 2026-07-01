import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsEvent } from './news-event';

describe('NewsEvent', () => {
  let component: NewsEvent;
  let fixture: ComponentFixture<NewsEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsEvent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsEvent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
