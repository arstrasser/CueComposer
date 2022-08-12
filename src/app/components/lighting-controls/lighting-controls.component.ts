import { Component, OnInit } from '@angular/core';
import { LightValue, LightGroup, LightOptional, LightValueKey } from '../../services/types/LightValue';

import { ColorEvent } from 'ngx-color';
import { ActionsService, CueLoadAction, CueSelectAction, LightSelectAction, LightValueSetAction } from 'src/app/services/actions/actions.service';
import { cues } from 'src/app/services/cues';
import { patch } from 'src/app/services/patch';

@Component({
  selector: 'app-lighting-controls',
  templateUrl: './lighting-controls.component.html',
  styleUrls: ['./lighting-controls.component.scss']
})
export class LightingControlsComponent implements OnInit {

  public groups: LightGroup[] = patch.getGroups()

  public brightness: number | LightOptional = LightOptional.UNSET
  public color: number | LightOptional = LightOptional.UNSET
  public pan: number | LightOptional = LightOptional.UNSET
  public tilt: number | LightOptional = LightOptional.UNSET

  constructor(public actions: ActionsService) {
    this.actions.eventEmitter.subscribe(action => {
      if (action instanceof CueSelectAction || action instanceof LightValueSetAction || action instanceof LightSelectAction || action instanceof CueLoadAction) {
        let currentValue = patch.getSelectedValue()
        this.brightness = currentValue.brightness
        this.color = currentValue.color
        this.pan = currentValue.pan
        this.tilt = currentValue.tilt
      }
    })
  }

  valueIsSet(value: number | LightOptional) {
    return value !== LightOptional.UNSET
  }

  groupIsSelected(group: LightGroup) {
    return patch.groupIsSelected(group)
  }

  toggleGroupSelect(group: LightGroup) {
    if (patch.groupIsSelected(group)) {
      this.actions.performAction(new LightSelectAction(group.channels, true))
    } else {
      this.actions.performAction(new LightSelectAction(group.channels))
    }
  }

  ngOnInit(): void {
  }

  update(name: LightValueKey, value: number | null) {
    if (value === null) return
    this[name] = value
    this.actions.performAction(new LightValueSetAction(name, value))
  }

  colorChange(event: ColorEvent) {
    this.update("color", (event.color.rgb.r << 16) | (event.color.rgb.g << 8) | event.color.rgb.b)
  }

  removeAttribute(name: LightValueKey) {
    this.update(name, LightOptional.UNSET)
  }

}
