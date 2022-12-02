import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Preferences, preferences } from 'src/app/services/preferences';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  public preferences: Preferences
  constructor(public dialogRef: MatDialogRef<SettingsComponent>) {
    this.preferences = preferences
  }

  volumeChange(ev:MatSliderChange) {
    let value = ev.value as number
    this.preferences.volume = value
    this.preferences.volumeEmitter.emit()
  }

  close() {
    this.preferences.save()
    this.dialogRef.close()
  }

}
