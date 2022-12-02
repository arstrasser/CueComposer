import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { preferences, RenderQuality } from 'src/app/services/preferences';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  quality: RenderQuality
  autosave: boolean
  constructor(public dialogRef: MatDialogRef<SettingsComponent>) {
    this.quality = preferences.renderQuality
    this.autosave = preferences.autoSave
  }

  close() {
    preferences.renderQuality = this.quality
    preferences.autoSave = this.autosave
    preferences.save()
    this.dialogRef.close()
  }

}
