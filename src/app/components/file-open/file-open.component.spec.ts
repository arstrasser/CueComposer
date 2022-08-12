import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileOpenComponent } from './file-open.component';

describe('FileOpenComponent', () => {
  let component: FileOpenComponent;
  let fixture: ComponentFixture<FileOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileOpenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
