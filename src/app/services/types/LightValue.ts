export type Channel = number

export enum LightOptional {
  UNSET = -99999,
  MULTIPLE_VALUES
}

export interface LightGroup {
  id: string,
  name: string,
  channels: Channel[]
}

export type LightValueKey = "brightness" | "color" | "pan" | "tilt";

export class LightValue {
  brightness: number | LightOptional;
  color: number | LightOptional;
  pan: number | LightOptional;
  tilt: number | LightOptional;

  constructor(values:{brightness: number | LightOptional,
              color: number | LightOptional,
              pan: number | LightOptional,
              tilt: number | LightOptional} | null = null) {
    if (values === null) {
      this.brightness = LightOptional.UNSET
      this.color = LightOptional.UNSET
      this.pan = LightOptional.UNSET
      this.tilt = LightOptional.UNSET
    } else {
      this.brightness = values.brightness
      this.color = values.color
      this.pan = values.pan
      this.tilt = values.tilt
    }
  }

  static combine(bottom: LightValue, top: LightValue): LightValue {
    let result = new LightValue()
    result.brightness = top.brightness === LightOptional.UNSET ? bottom.brightness : top.brightness
    result.color = top.color === LightOptional.UNSET ? bottom.color : top.color
    result.pan = top.pan === LightOptional.UNSET ? bottom.pan : top.pan
    result.tilt = top.tilt === LightOptional.UNSET ? bottom.tilt : top.tilt
    return result
  }

  static interpolate(start: LightValue, finish: LightValue, t:number): LightValue {
    if (t >= 1) {
      return finish
    } else if (t <= 0) {
      return start
    }
    let result = new LightValue()
    if (start.brightness !== LightOptional.UNSET && finish.brightness !== LightOptional.UNSET) {
      result.brightness = start.brightness + (finish.brightness - start.brightness) * t
    } else {
      result.brightness = start.brightness === LightOptional.UNSET ? finish.brightness : start.brightness
    }

    if (start.color !== LightOptional.UNSET && finish.color !== LightOptional.UNSET) {
      let red = (start.color >> 16) + ((finish.color >> 16) - (start.color >> 16)) * t
      let green = (start.color >> 8 & 0xFF) + ((finish.color >> 8 & 0xFF) - (start.color >> 8 & 0xFF)) * t
      let blue = (start.color & 0xFF) + ((finish.color & 0xFF) - (start.color & 0xFF)) * t
      result.color = (red << 16) | (green << 8) | blue
    } else {
      result.color = start.color === LightOptional.UNSET ? finish.color : start.color
    }

    if (start.pan !== LightOptional.UNSET && finish.pan !== LightOptional.UNSET) {
      result.pan = start.pan + (finish.pan - start.pan) * t
    } else {
      result.pan = start.pan === LightOptional.UNSET ? finish.pan : start.pan
    }

    if (start.tilt !== LightOptional.UNSET && finish.tilt !== LightOptional.UNSET) {
      result.tilt = start.tilt + (finish.tilt - start.tilt) * t
    } else {
      result.tilt = start.tilt === LightOptional.UNSET ? finish.tilt : start.tilt
    }

    return result
  }
}
