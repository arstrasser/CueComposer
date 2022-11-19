import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { ActionsService, CueAddAction, CueDeleteAction, CueLoadAction, CueSelectAction, CueUpdateAction } from 'src/app/services/actions/actions.service';
import { formatTime } from 'src/app/services/helper';
import { cues } from '../../services/cues';
import { Cue } from '../../services/types/show';

@Component({
  selector: 'app-cue-list',
  templateUrl: './cue-list.component.html',
  styleUrls: ['./cue-list.component.scss']
})
export class CueListComponent implements OnInit {
  @ViewChild(MatTable) cueTable!: MatTable<Cue>;

  public displayedColumns: string[] = ['num', 'title', 'time', 'follow', 'fade'];

  constructor(public actions: ActionsService) { }

  getCues() {
    return cues.cues
  }

  ngOnInit(): void {
    this.actions.eventEmitter.subscribe(action => {
      if (action instanceof CueAddAction || action instanceof CueDeleteAction || action instanceof CueLoadAction || action instanceof CueUpdateAction) {
        this.cueTable.renderRows()
      }
    })
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
      target.value = formatTime(cue.time)
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

  formatTime = formatTime

  updateFade(cue: Cue, e:Event) {
    let target = e.target as HTMLInputElement
    let value = target.value

    let newValue = this.parseTime(value)
    if (newValue !== undefined && cue.fade !== newValue) {
      cue.fade = newValue
      this.actions.performAction(new CueUpdateAction(cue.id, cue.time, cue.title, newValue))
    } else {
      target.value = formatTime(cue.fade)
    }
  }

}
