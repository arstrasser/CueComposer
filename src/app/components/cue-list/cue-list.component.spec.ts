import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CueListComponent } from './cue-list.component';

describe('CueListComponent', () => {
  let component: CueListComponent;
  let fixture: ComponentFixture<CueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CueListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
