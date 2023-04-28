import { Component, OnInit } from '@angular/core';
import { LightGroup, LightOptional, LightValueKey } from '../../services/types/LightValue';

import { ColorEvent } from 'ngx-color';
import { ActionsService, CueLoadAction, CueSelectAction, LightSelectAction, LightValueSetAction } from 'src/app/services/actions/actions.service';
import { patch } from 'src/app/services/patch';

@Component({
  selector: 'app-lighting-controls',
  templateUrl: './lighting-controls.component.html',
  styleUrls: ['./lighting-controls.component.scss']
})
export class LightingControlsComponent implements OnInit {

  public selectingGroups = false
  public groups: LightGroup[] = patch.getGroups()

  public brightness: number | LightOptional = LightOptional.UNSET
  public color: number | LightOptional = LightOptional.UNSET
  public pan: number | LightOptional = LightOptional.UNSET
  public tilt: number | LightOptional = LightOptional.UNSET

  public availableColors = ['#FF0000', '#FF6900', '#ebc034', '#fafa41', '#27ba20', '#23faf3', '#2dace3', '#071de6', '#7e15e8', '#be15e8', '#e615df', '#ffffff']

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
    if (!this.selectingGroups) {
      this.actions.performAction(new LightSelectAction(group.channels, false, true))
      this.selectingGroups = true
      return
    }

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
    this.selectingGroups = false
  }

  colorChange(event: ColorEvent) {
    this.update("color", (event.color.rgb.r << 16) | (event.color.rgb.g << 8) | event.color.rgb.b)
  }

  removeAttribute(name: LightValueKey) {
    this.update(name, LightOptional.UNSET)
  }

}
