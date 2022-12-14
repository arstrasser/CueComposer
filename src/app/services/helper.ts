import { LightValue } from "./types/LightValue"
import { LightValueStore } from "./types/LightValueStore"

export const serializeJson = (object: any) => {
  return JSON.stringify(object, (_, value) => {
    if (value instanceof LightValueStore) {
      return {
        dataType: "LightValueStore",
        value: value.serialize()
      }
    }

    else if (value instanceof LightValue) {
      return {
        dataType: "LightValue",
        brightness: value.brightness,
        color: value.color,
        pan: value.pan,
        tilt: value.tilt
      }
    }

    else if (value instanceof Map) {
      let keys = Array.from(value.keys())
      let values = keys.map(key => value.get(key))
      return {
        dataType: 'map',
        keys,
        values
      }
    }
    return value
  })
}

export const unserializeJson = (json: string):any => {
  return JSON.parse(json, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'LightValueStore') {
        return new LightValueStore(value.value)
      }
      else if (value.dataType === 'LightValue') {
        return new LightValue(value)
      }
      else if (value.dataType === 'map') {
        let map = new Map()
        value.keys.forEach((key:any, index:number) => {
          map.set(key, value.values[index])
        })
        return map
      }
    }
    return value
  })
}

export const formatTime = (time: number) => {
  let minutes = Math.floor(time / 60)
  let seconds = time - minutes * 60
  seconds = Math.round(seconds * 100) / 100
  if (seconds % 1 === 0) {
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds + ".00"
  } else {
    return minutes + ":" + ((seconds < 10 ? "0" : "") + seconds).padEnd(5, "0")
  }
}
