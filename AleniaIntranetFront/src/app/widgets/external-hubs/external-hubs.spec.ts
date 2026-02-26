import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalHubs } from './external-hubs';

describe('ExternalHubs', () => {
  let component: ExternalHubs;
  let fixture: ComponentFixture<ExternalHubs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalHubs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalHubs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
