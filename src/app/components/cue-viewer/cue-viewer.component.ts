import { Component } from '@angular/core';
import { ActionsService, CueAddAction, CueDeleteAction, CueLoadAction, CueSelectAction } from 'src/app/services/actions/actions.service';
import { cues } from '../../services/cues';

@Component({
  selector: 'app-cue-viewer',
  templateUrl: './cue-viewer.component.html',
  styleUrls: ['./cue-viewer.component.scss']
})
export class CueViewerComponent {

  public selectedCueId: number | null = cues.getSelectedCueId()

  constructor(actions: ActionsService) {
    actions.eventEmitter.subscribe(action => {
      if (action instanceof CueSelectAction || action instanceof CueAddAction || action instanceof CueLoadAction || action instanceof CueDeleteAction || action instanceof CueLoadAction) {
        this.selectedCueId = cues.getSelectedCueId()
      }
    })
  }
}
