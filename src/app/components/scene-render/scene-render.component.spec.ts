import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneRenderComponent } from './scene-render.component';

describe('SceneRenderComponent', () => {
  let component: SceneRenderComponent;
  let fixture: ComponentFixture<SceneRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SceneRenderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SceneRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
