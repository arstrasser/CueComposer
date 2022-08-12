import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DanceDesignerComponent } from './dance-designer.component';

describe('DanceDesignerComponent', () => {
  let component: DanceDesignerComponent;
  let fixture: ComponentFixture<DanceDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DanceDesignerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DanceDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
