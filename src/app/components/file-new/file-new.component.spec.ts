import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileNewComponent } from './file-new.component';

describe('FileNewComponent', () => {
  let component: FileNewComponent;
  let fixture: ComponentFixture<FileNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
