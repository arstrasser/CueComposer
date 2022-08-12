import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingControlsComponent } from './lighting-controls.component';

describe('LightingControlsComponent', () => {
  let component: LightingControlsComponent;
  let fixture: ComponentFixture<LightingControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LightingControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightingControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
