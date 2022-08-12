import { LightValue } from "./LightValue";

export class LightValueStore {
  private internal: Map<number, LightValue>;

  constructor(values: {channels: number[], values: LightValue[]} | null = null) {
    this.internal = new Map<number, LightValue>()
    if (values !== null) {
      values.channels.forEach((channel, index) => {
        this.internal.set(channel, values.values[index])
      })
    }
  }

  get(channel: number): LightValue | undefined {
    return this.internal.get(channel)
  }

  set(channel: number, value: LightValue) {
    this.internal.set(channel, value)
  }

  delete(channel: number) {
    return this.internal.delete(channel)
  }

  usedChannels(): number[] {
    return Array.from(this.internal.keys())
  }

  serialize() {
    let channels = Array.from(this.internal.keys())
    let values = channels.map(channel => this.internal.get(channel))
    return {channels, values}
  }

  static combine(oldStore: LightValueStore, newStore: LightValueStore) {
    let result = new LightValueStore()
    oldStore.internal.forEach((value, channel) => {
      let newValue = newStore.internal.get(channel)
      if (newValue) {
        result.internal.set(channel, LightValue.combine(value, newValue))
      } else {
        result.internal.set(channel, value)
      }
    })
    newStore.internal.forEach((value, channel) => {
      if (!oldStore.internal.has(channel)) {
        result.internal.set(channel, value)
      }
    })
    return result
  }
}
