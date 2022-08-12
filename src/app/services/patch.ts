import { BetterLightData, parser } from './ma-tsv-parser';
import { Channel, LightGroup, LightOptional, LightValue } from './types/LightValue';
import { LightValueStore } from './types/LightValueStore';

export enum LightValueStoreMode {
  both,
  programmer,
  executor
}

class PatchService {

  private programmer:LightValueStore = new LightValueStore()
  private executor:LightValueStore = new LightValueStore()
  private lightProperties = new Map<number, BetterLightData>()
  private groups: LightGroup[] = []

  private selectedLights: Channel[] = []

  constructor() {
    this.addGroup("S4", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    this.addGroup("Left Booms", [81, 82, 83, 84, 85, 86])
    this.addGroup("Right Booms", [91, 92, 93, 94, 95, 96])
    this.addGroup("D40 Top", [33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
    this.addGroup("Esprite", [21, 22, 23, 24, 25, 26])
    this.addGroup("CF", [101, 102, 103, 104, 105, 106])
  }

  //--------------------------Exec/Prog---------------------------------

  updateExecutor(stores: LightValueStore[]) {
    if (stores.length === 0) {
      this.executor = new LightValueStore()
    } else {
      this.executor = stores.reduce((exec, next) => {
        return LightValueStore.combine(exec, next)
      })
    }
  }

  updateProgrammer(store: LightValueStore) {
    this.programmer = store
  }

  getProgrammerValues() {
    return this.programmer
  }

  getProgrammedChannels() {
    return this.programmer.usedChannels()
  }

  //--------------------------Light Properties---------------------------------

  async loadLights() {
    let result = await fetch('/assets/rigs/ds/data.txt')
    let tsv = await result.text()
    let lightData = await parser.parse(tsv)

    lightData.forEach(light => {
      this.lightProperties.set(light.channel, light)
    })

    return lightData
  }

  getLightProperties(channel: Channel) {
    return this.lightProperties.get(channel)
  }

  //--------------------------Selection---------------------------------
  clearSelection() {
    this.selectedLights = []
  }

  selectLight(channel: Channel) {
    if (!this.selectedLights.includes(channel)) {
      this.selectedLights.push(channel)
    }
  }

  deselectLight(channel: number) {
    this.selectedLights = this.selectedLights.filter(c => c !== channel)
  }

  selectLights(channels: Channel[]) {
    channels.forEach(channel => this.selectLight(channel))
  }

  deselectLights(channels: Channel[]) {
    channels.forEach(channel => this.deselectLight(channel))
  }

  selectGroup(group: LightGroup) {
    this.selectLights(group.channels)
  }

  deselectGroup(group: LightGroup) {
    group.channels.forEach(channel => this.deselectLight(channel))
  }

  getSelectedLights() {
    return this.selectedLights
  }

  setSelectedLights(channels: Channel[]) {
    this.selectedLights = channels
  }

  getAllLights() {
    return Array.from(this.lightProperties.keys())
  }

  //--------------------------Light values---------------------------------
  private setLightValue(channel: number, data: LightValue) {
    let lightProperties = this.getLightProperties(channel)

    let oldValue = this.programmer.get(channel)
    if (!oldValue) {
      oldValue = {
        brightness: LightOptional.UNSET,
        color: LightOptional.UNSET,
        pan: LightOptional.UNSET,
        tilt: LightOptional.UNSET,
      }
    }

    if (data.brightness !== LightOptional.MULTIPLE_VALUES) oldValue.brightness = data.brightness
    if (data.color !== LightOptional.MULTIPLE_VALUES && lightProperties?.has_color) oldValue.color = data.color
    if (data.pan !== LightOptional.MULTIPLE_VALUES && lightProperties?.has_moving) oldValue.pan = data.pan
    if (data.tilt !== LightOptional.MULTIPLE_VALUES && lightProperties?.has_moving) oldValue.tilt = data.tilt

    if (oldValue.brightness === LightOptional.UNSET && oldValue.color === LightOptional.UNSET && oldValue.pan === LightOptional.UNSET && oldValue.tilt === LightOptional.UNSET) {
      this.programmer.delete(channel)
    }

    this.programmer.set(channel, oldValue)
  }

  getLightValue(channel: number, return_unset: boolean=false, mode: LightValueStoreMode=LightValueStoreMode.both):LightValue {
    let program = this.programmer.get(channel)
    let exec = this.executor.get(channel)

    let ret = new LightValue()
    if (mode === LightValueStoreMode.programmer) {
      if (program) ret = new LightValue(program)
    } else if (mode === LightValueStoreMode.executor) {
      if (exec) ret = new LightValue(exec)
    } else {
      if (program && exec) ret = LightValue.combine(exec, program)
      else if (program) ret = new LightValue(program)
      else if (exec) ret = new LightValue(exec)
    }

    if (return_unset) {
      return ret
    }
    let lightProperties = this.getLightProperties(channel)
    if (ret.brightness === LightOptional.UNSET) {
      ret.brightness = 0
    }
    if (lightProperties?.has_color && ret.color === LightOptional.UNSET) {
      ret.color = 0xffffff
    }
    if (lightProperties?.has_moving && ret.pan === LightOptional.UNSET) {
      ret.pan = 0
    }
    if (lightProperties?.has_moving && ret.tilt === LightOptional.UNSET) {
      ret.tilt = 0
    }
    return ret

  }

  getLightValues(channels: number[], return_unset: boolean = false, mode: LightValueStoreMode=LightValueStoreMode.both):LightValue {
    let groupValue = new LightValue()

    for(let i = 0; i < channels.length; i++) {
      let value = this.getLightValue(channels[i], return_unset, mode)
      if (value) {
        if (groupValue.brightness === LightOptional.UNSET) groupValue.brightness = value.brightness
        else if (groupValue.brightness !== value.brightness) groupValue.brightness = LightOptional.MULTIPLE_VALUES

        if (groupValue.color === LightOptional.UNSET) groupValue.color = value.color
        else if (groupValue.color !== value.color) groupValue.color = LightOptional.MULTIPLE_VALUES

        if (groupValue.pan === LightOptional.UNSET) groupValue.pan = value.pan
        else if (groupValue.pan !== value.pan) groupValue.pan = LightOptional.MULTIPLE_VALUES

        if (groupValue.tilt === LightOptional.UNSET) groupValue.tilt = value.tilt
        else if (groupValue.tilt !== value.tilt) groupValue.tilt = LightOptional.MULTIPLE_VALUES
      }
    }

    return groupValue
  }

  getSelectedValue() {
    return this.getLightValues(this.selectedLights, true, LightValueStoreMode.programmer)
  }

  //--------------------------Groups---------------------------------
  getGroups() {
    return this.groups
  }

  addGroup(name: string, channels: Channel[]) {
    this.groups.push({
      id: String(Math.floor(Math.random()*1000000)),
      name,
      channels
    })
  }

  deleteGroup(group: LightGroup) {
    for(let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id === group.id) {
        this.groups.splice(i, 1)
        break
      }
    }
  }

  groupIsSelected(group: LightGroup) {
    for (let i = 0; i < group.channels.length; i++) {
      if (!this.selectedLights.includes(group.channels[i])) {
        return false
      }
    }
    return true
  }

  private setGroupValue(group: LightGroup, data: LightValue) {
    group.channels.forEach(channel => {
      this.setLightValue(channel, data)
    })
  }

  public setValue(data: LightValue) {
    this.selectedLights.forEach(channel => {
      this.setLightValue(channel, data)
    })
  }

}

export const patch = new PatchService()
