import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceAnimationComponent } from './race-animation.component';

describe('RaceAnimationComponent', () => {
  let component: RaceAnimationComponent;
  let fixture: ComponentFixture<RaceAnimationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaceAnimationComponent]
    });
    fixture = TestBed.createComponent(RaceAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
