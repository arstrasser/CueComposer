import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { ActionsService, CueAddAction, CueDeleteAction, CueLoadAction, CueSelectAction, CueUpdateAction } from 'src/app/services/actions/actions.service';
import { cues } from '../../services/cues';
import { Cue } from '../../services/types/show';

@Component({
  selector: 'app-cue-list',
  templateUrl: './cue-list.component.html',
  styleUrls: ['./cue-list.component.scss']
})
export class CueListComponent implements OnInit {
  @ViewChild(MatTable) cueTable!: MatTable<Cue>;

  public displayedColumns: string[] = ['title', 'time', 'fade'];

  constructor(public actions: ActionsService) { }

  getCues() {
    return cues.cues
  }

  ngOnInit(): void {
    this.actions.eventEmitter.subscribe(action => {
      if (action instanceof CueAddAction || action instanceof CueDeleteAction || action instanceof CueLoadAction) {
        this.cueTable.renderRows()
      }
    })
  }

  formatTime(time: number) {
    let minutes = Math.floor(time / 60)
    let seconds = time - minutes * 60
    seconds = Math.round(seconds * 100) / 100
    if (seconds % 1 === 0) {
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds + ".00"
    } else {
      return minutes + ":" + ((seconds < 10 ? "0" : "") + seconds).padEnd(5, "0")
    }
  }

  rowClick(row:Cue) {
    if (!this.cueIsSelected(row)) {
      this.actions.performAction(new CueSelectAction(row.id))
    }
  }

  cueIsSelected(cue:Cue) {
    return cue.id === cues.getSelectedCueId()
  }

  parseTime(value: string): number | undefined {
    let minutes = 0
    let seconds = 0
    if (value.includes(":")) {
      let split = value.split(":")
      minutes = parseInt(split[0])
      seconds = parseFloat(split[1])
    } else {
      seconds = parseFloat(value)
    }

    if (isNaN(minutes) || isNaN(seconds)) {
      return undefined
    }
    return minutes * 60 + seconds
  }

  updateStart(cue: Cue, e:Event) {
    let target = e.target as HTMLInputElement
    let value = target.value

    let newValue = this.parseTime(value)
    if (newValue !== undefined && cue.time !== newValue) {
      cue.time = newValue
      this.actions.performAction(new CueUpdateAction(cue.id, newValue, cue.title, cue.fade))
    } else {
      target.value = this.formatTime(cue.time)
    }
  }

  updateTitle(cue: Cue, e:Event) {
    let target = e.target as HTMLInputElement
    let value = target.value

    if (cue.title !== value) {
      cue.title = value
      this.actions.performAction(new CueUpdateAction(cue.id, cue.time, value, cue.fade))
    }
  }

  updateFade(cue: Cue, e:Event) {
    let target = e.target as HTMLInputElement
    let value = target.value

    let newValue = this.parseTime(value)
    if (newValue !== undefined && cue.fade !== newValue) {
      cue.fade = newValue
      this.actions.performAction(new CueUpdateAction(cue.id, cue.time, cue.title, newValue))
    } else {
      target.value = this.formatTime(cue.fade)
    }
  }

}
