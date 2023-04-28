import { EventEmitter, Injectable } from '@angular/core';
import { patch } from '../patch';
import { cues } from '../cues'
import { Channel, LightValue, LightValueKey } from '../types/LightValue';
import { Cue } from '../types/show';
import { preferences, RenderQuality } from '../preferences';

export abstract class Action {
  public rerender: boolean = false
  public purgeHistory: boolean = false

  abstract do(): void;
  abstract undo(): void;
}

//Light actions
export class LightValueSetAction extends Action {
  public oldValue: LightValue | undefined = undefined
  public newValue: LightValue | undefined = undefined

  constructor(public attribute: LightValueKey, public value: number, public override rerender: boolean = true) {
    super()
 }

  do() {
    if (this.oldValue === undefined || this.newValue === undefined) {
      this.oldValue = patch.getSelectedValue()
      this.newValue = new LightValue(this.oldValue)
      this.newValue[this.attribute] = this.value
    }

    patch.setValue(this.newValue)
  }

  undo() {
    if (this.oldValue === undefined) throw "Undo called before action was performed!"
    patch.setValue(this.oldValue)
  }
}

export class LightSelectAction extends Action {
  public oldGroup: Channel[] | undefined = undefined
  public newGroup: Channel[] | undefined = undefined

  constructor(public channels: Channel[], public deselect: boolean = false, public deselctOthers: boolean = false) {
    super()
  }

  do() {
    if (this.oldGroup === undefined) {
      this.oldGroup = [...patch.getSelectedLights()]
    }

    if (this.newGroup === undefined) {
      if (this.deselctOthers) {
        patch.clearSelection()
      }
      
      if (this.deselect) {
        patch.deselectLights(this.channels)
      } else {
        patch.selectLights(this.channels)
      }

      this.newGroup = [...patch.getSelectedLights()]
    } else {
      patch.clearSelection()
      patch.setSelectedLights(this.newGroup)
    }
  }

  undo() {
    if (this.oldGroup === undefined) throw "Undo called before action was performed!"
    patch.clearSelection()
    patch.setSelectedLights(this.oldGroup)
  }
}

// Cue actions
export class CueSelectAction extends Action {
  public oldSelectedCueId: number | null | undefined = undefined
  public fadeEmitter: EventEmitter<number> | undefined = undefined

  private timer: NodeJS.Timer | undefined = undefined
  private fadeTriggerPeriodMilliseconds
  private lastT = -1

  constructor(public cueId: number | null, public fade = false, public getT: (() => number) | undefined = undefined) {
    super()
    this.rerender = !this.fade

    switch(preferences.renderQuality) {
      case RenderQuality.low:
        this.fadeTriggerPeriodMilliseconds = 200
        break
      case RenderQuality.medium:
        this.fadeTriggerPeriodMilliseconds = 100
        break
      case RenderQuality.high:
        this.fadeTriggerPeriodMilliseconds = 50
        break
    }
  }

  do() {
    if (this.oldSelectedCueId === undefined) {
      this.oldSelectedCueId = cues.getSelectedCueId()
    }
    cues.selectCue(this.cueId)
    if (this.fade) {
      this.fadeEmitter = new EventEmitter<number>()
      this.timer = setInterval(() => {
        if (this.getT === undefined) throw "Fade action requires a getT function"
        let t = this.getT()
        if (t != this.lastT) this.fadeEmitter?.emit(t)
        this.lastT = t
        if (t >= 1 || t < 0) {
          this.finishFade()
        }
      }, this.fadeTriggerPeriodMilliseconds)
    }
  }

  undo() {
    if (this.oldSelectedCueId === undefined) throw "Undo called before action was performed!"
    this.finishFade()
    cues.selectCue(this.oldSelectedCueId)
  }

  private finishFade() {
    clearInterval(this.timer)
    this.fadeEmitter?.complete()
    this.fadeEmitter = undefined
    this.timer = undefined
    this.fade = false
    this.getT = undefined
  }
}

export class CueAddAction extends Action {
  public newCueId: number | undefined = undefined

  constructor(public time: number, public title: string, public fade: number = 0) {
    super()
  }

  do() {
    this.newCueId = cues.addCue(this.time, this.title, this.fade).id
  }

  undo() {
    if (this.newCueId === undefined) throw "Undo called before action was performed!"
    cues.deleteCue(this.newCueId)
  }

}

export class CueDeleteAction extends Action {
  public oldCue: Cue | null | undefined = undefined

  constructor(public cueId: number) {
    super()
  }

  do() {
    this.oldCue = cues.deleteCue(this.cueId)
  }

  undo() {
    if (this.oldCue === undefined) throw "Undo called before action was performed!"
    else if (this.oldCue !== null) {
      this.cueId = cues.addCue(this.oldCue.time, this.oldCue.title, this.oldCue.fade).id
    }
  }
}

export class CueUpdateAction extends Action {
  public oldTime: number | undefined = undefined
  public oldTitle: string | undefined = undefined
  public oldFade: number | undefined = undefined

  constructor(public cueId: number,
              public time: number | undefined = undefined,
              public title: string | undefined = undefined,
              public fade: number | undefined = undefined) {
    super()
  }

  do() {
    if (this.oldTime === undefined || this.oldTitle === undefined) {
      let oldCue = cues.getCue(this.cueId)
      if (oldCue === null) {
        throw "Cue not found!"
      }
      this.oldTime = oldCue.time
      this.oldTitle = oldCue.title
      this.oldFade = oldCue.fade
    }
    if (this.time === undefined) this.time = this.oldTime
    if (this.title === undefined) this.title = this.oldTitle
    if (this.fade === undefined) this.fade = this.oldFade

    cues.updateCue(this.cueId, this.time, this.title, this.fade)
  }

  undo() {
    if (this.oldTime === undefined || this.oldTitle === undefined)
      throw "Undo called before action was performed!"
    cues.updateCue(this.cueId, this.oldTime, this.oldTitle, this.oldFade)
  }
}

export class CueLoadAction extends Action {
  public override purgeHistory: boolean = true
  public override rerender: boolean = true

  constructor(public cues: Cue[]){
    super()
  }

  do() {
    cues.cues = this.cues
    cues.selectCue(null)
  }

  undo() {
    throw "Can't undo load cues action!"
  }
}

export class AudioLoadAction extends Action {
  public override purgeHistory: boolean = true
  public override rerender: boolean = false

  constructor(public song: Blob) {
    super()
  }

  //no-op
  do() {}

  undo() {
    throw "Can't undo load audio action!"
  }
}

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  private undoHistory: Action[] = []
  private redoHistory: Action[] = []

  public eventEmitter = new EventEmitter<Action>()
  public renderEmitter: EventEmitter<void> = new EventEmitter()

  constructor() { }

  public canUndo(): boolean {
    return this.undoHistory.length > 0
  }

  public canRedo(): boolean {
    return this.redoHistory.length > 0
  }

  public performAction(action: Action) {
    action.do()
    if (action.purgeHistory) {
      this.undoHistory = []
      this.redoHistory = []
    } else {
      this.undoHistory.push(action)
    }
    this.eventEmitter.emit(action)

    if (action.rerender) {
      this.renderEmitter.emit()
    }
  }

  public undo() {
    let action = this.undoHistory.pop()
    if (action === undefined) return
    action.undo()
    this.redoHistory.push(action)
    this.eventEmitter.emit(action)

    if (action.rerender) {
      this.renderEmitter.emit()
    }
  }

  public redo() {
    let action = this.redoHistory.pop()
    if (action === undefined) return
    this.performAction(action)
  }
}
