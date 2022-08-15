import { Injectable, EventEmitter } from '@angular/core';
import { LightValueStore } from './types/LightValueStore';
import { Cue, Show } from './types/show';
import { patch } from './patch';

@Injectable({
  providedIn: 'root'
})
export class CuesService {

  private selectedCueIndex: number = -1
  private selectedCueId: number | null = null

  public fadeEmitter = new EventEmitter<number>()

  public cues: Cue[] = []

  public show: Show | null = null

  constructor() {
  }

  private getCueIndex(id: number): number {
    return this.cues.findIndex(cue => cue.id === id)
  }

  updateCurrentCue() {
    if (this.selectedCueId !== null) {
      this.cues[this.selectedCueIndex].lightValues = patch.getProgrammerValues()
    }
  }

  addCue(time: number, title: string, fade: number = 0) {
    let cue = {
      id: Math.floor(Math.random()*100000000),
      time,
      fade,
      title,
      lightValues: new LightValueStore()
    }
    let inserted = false
    let i = 0;
    for(; i < this.cues.length; i++) {
      if (this.cues[i].time > cue.time) {
        this.cues.splice(i, 0, cue)
        inserted = true
        break
      }
    }
    if (!inserted) {
      this.cues.push(cue)
    } else if (i <= this.selectedCueIndex) {
      this.selectedCueIndex++
    }

    this.selectCue(cue.id)
    return cue
  }

  updateCue(cueId: number, time: number, title: string, fade: number = 0): Cue | null {
    let index = this.getCueIndex(cueId)
    if (index === -1) return null
    this.cues[index].time = time
    this.cues[index].title = title
    this.cues[index].fade = fade
    this.cues.sort((a, b) => a.time - b.time)
    return this.cues[index]
  }

  getSelectedCueId(): number | null {
    return this.selectedCueId
  }

  selectCue(id: number | null) {
    this.updateCurrentCue()
    if (id === this.selectedCueId) return

    this.selectedCueId = id
    if (id === null) {
      this.selectedCueIndex = -1
    } else {
      this.selectedCueIndex = this.getCueIndex(id)
    }

    if (this.selectedCueIndex !== -1) {
      patch.updateExecutor(this.cues.slice(0, this.selectedCueIndex).map(cue => cue.lightValues))
      patch.updateProgrammer(this.cues[this.selectedCueIndex].lightValues)
    } else {
      patch.updateExecutor([])
      patch.updateProgrammer(new LightValueStore())
    }
  }

  getSelectedCue(): Cue | null {
    if (this.selectedCueIndex === -1) {
      return null
    }
    return this.cues[this.selectedCueIndex]
  }

  getCue(id: number): Cue | null {
    let index = this.getCueIndex(id)
    if (index === -1) return null
    return this.cues[index]
  }

  getNextCue(cue: Cue): Cue | null {
    let index = this.getCueIndex(cue.id)
    if (index === -1) return null
    if (index === this.cues.length - 1) return null
    return this.cues[index + 1]
  }

  deleteCue(id: number): Cue | null {
    let i = 0;
    for(; i < this.cues.length; i++) {
      if (this.cues[i].id === id) {
        break
      }
    }
    if (i === this.cues.length) return null

    if (i < this.selectedCueIndex) {
      this.selectedCueIndex--
    }
    if (i === this.selectedCueIndex) {
      this.selectedCueId = null
      this.selectedCueIndex = -1
    }

    return this.cues.splice(i, 1)[0]
  }

}


export const cues = new CuesService()
