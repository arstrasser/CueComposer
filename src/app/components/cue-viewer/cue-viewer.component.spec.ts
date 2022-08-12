import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CueViewerComponent } from './cue-viewer.component';

describe('CueViewerComponent', () => {
  let component: CueViewerComponent;
  let fixture: ComponentFixture<CueViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CueViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CueViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
