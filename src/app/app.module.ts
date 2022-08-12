import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';

import { ResizableModule } from 'angular-resizable-element';
import { ColorTwitterModule } from 'ngx-color/twitter';

import { SceneRenderComponent } from './components/scene-render/scene-render.component';
import { DanceDesignerComponent } from './components/dance-designer/dance-designer.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { CueViewerComponent } from './components/cue-viewer/cue-viewer.component';
import { CueListComponent } from './components/cue-list/cue-list.component';
import { LightingControlsComponent } from './components/lighting-controls/lighting-controls.component';
import { FileNewComponent } from './components/file-new/file-new.component';
import { FileOpenComponent } from './components/file-open/file-open.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneRenderComponent,
    DanceDesignerComponent,
    TimelineComponent,
    CueViewerComponent,
    CueListComponent,
    LightingControlsComponent,
    FileNewComponent,
    FileOpenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTooltipModule,
    MatListModule,
    MatTabsModule,
    MatInputModule,
    MatTableModule,
    MatDialogModule,
    ResizableModule,
    ColorTwitterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
