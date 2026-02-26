import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewJoiners } from './new-joiners';

describe('NewJoiners', () => {
  let component: NewJoiners;
  let fixture: ComponentFixture<NewJoiners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewJoiners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewJoiners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
