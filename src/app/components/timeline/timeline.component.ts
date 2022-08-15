import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { ActionsService, AudioLoadAction, CueAddAction, CueDeleteAction, CueLoadAction, CueSelectAction, CueUpdateAction } from 'src/app/services/actions/actions.service';
import { formatTime } from 'src/app/services/helper';
import { Cue } from 'src/app/services/types/show';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';
import { cues } from '../../services/cues';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {
  @ViewChild('container') waveform!: ElementRef<HTMLDivElement>;
  @ViewChild('popup') popup!: ElementRef<HTMLDivElement>;
  public wavesurfer: WaveSurfer|null = null;

  private baseZoom: number = 1
  private zoomFactor:number = 1

  public currentTime: string = "0:00.00"
  public currentDuration: string = "0:00.00"

  constructor(private actions: ActionsService, private ngZone: NgZone) { }

  ngAfterViewInit() {
    this.wavesurfer = WaveSurfer.create({
      container: this.waveform.nativeElement,
      scrollParent: true,
      waveColor: "#B71C1C",
      autoCenterImmediately: true,
      height: 140,
      plugins: [
        RegionsPlugin.create({
          dragSelection: false
        })
      ]
    })

    this.addListeners()
  }

  addListeners() {
    window.addEventListener('resize', () => {
      this.resize()
    })

    document.addEventListener("keydown", this.keyDownEvent.bind(this))

    this.wavesurfer?.on("ready", () => {
      this.resize()
      this.currentDuration = this.formatTime(this.wavesurfer?.getDuration() || 0)
    })

    this.wavesurfer?.on("play", () => {
      this.selectPreviousCue()
    })

    this.wavesurfer?.on("audioprocess", () => {
      if (this.currentTime !== this.formatTime(this.wavesurfer?.getCurrentTime() || 0)) {
        this.ngZone.run(() => {
          this.currentTime = this.formatTime(this.wavesurfer?.getCurrentTime() || 0)
        })
      }
    })

    this.wavesurfer?.on("seek", () => {
      this.ngZone.run(() => {
        let currentTime = this.wavesurfer?.getCurrentTime() || 0
        this.currentTime = this.formatTime(currentTime)

        this.selectPreviousCue()
      })
    })

    this.actions.eventEmitter.subscribe(action => {
      if (action instanceof CueSelectAction || action instanceof CueUpdateAction || action instanceof CueAddAction || action instanceof CueDeleteAction || action instanceof CueLoadAction) {
        this.renderRegions()
      } else if (action instanceof AudioLoadAction) {
        this.wavesurfer?.loadBlob(action.song)
        this.zoomFactor = 1
      }
    })
  }

  private selectPreviousCue() {
    let i = 0;
    let currentTime = this.wavesurfer!.getCurrentTime()
    let oldSelection = cues.getSelectedCue()
    for (;i < cues.cues.length; i++) {
      if (cues.cues[i].time > currentTime) {
        break
      }
    }
    if (i === 0) {
      if (oldSelection !== null) this.actions.performAction(new CueSelectAction(null))
    } else {
      if (oldSelection?.id !== cues.cues[i-1].id) this.actions.performAction(new CueSelectAction(cues.cues[i-1].id))
    }
  }

  private getRegionDuration() {
    return Math.max(3 / (this.zoomFactor * this.baseZoom), 0.1)
  }

  ngOnDestroy() {
    this.wavesurfer?.destroy()
    document.removeEventListener("keydown", this.keyDownEvent.bind(this))
  }

  keyDownEvent(ev: KeyboardEvent) {
    if (!ev.repeat) {
      if (ev.key === " " && (document.activeElement?.tagName === "BODY" || document.activeElement?.tagName === "BUTTON")) {
        ev.preventDefault()
        this.wavesurfer?.playPause()
      }

      if (ev.ctrlKey && (ev.key === "k" || ev.key === "m")) {
        ev.preventDefault()
        this.actions.performAction(new CueAddAction(this.wavesurfer?.getCurrentTime() || 0, "New Cue", 0))
      }
    }
  }

  createCue() {
    this.actions.performAction(new CueAddAction(this.wavesurfer?.getCurrentTime() || 0, "New Cue", 0))
    this.wavesurfer?.pause()
  }

  deleteCue() {
    const selectedCueId = cues.getSelectedCueId()
    if (selectedCueId !== null) {
      this.actions.performAction(new CueDeleteAction(selectedCueId))
    }
    this.wavesurfer?.pause()
  }

  formatTime = formatTime

  isPlaying() {
    return this.wavesurfer?.isPlaying() || false
  }

  updateZoom() {
    this.wavesurfer?.zoom(this.zoomFactor * this.baseZoom)
    this.renderRegions()
  }

  renderRegions() {
    console.log("renderregions")
    this.wavesurfer?.regions.clear()
    let regionDuration = this.getRegionDuration()

    cues.cues.forEach(cue => {
      let region = this.wavesurfer?.regions.add({
        id: String(cue.id),
        start: cue.time,
        end: cue.time+regionDuration,
        color: cue.id === cues.getSelectedCueId() ? '#64b5f6' : '#455a64',
        loop: false,
        drag: true,
        resize: false
      })
      if (region !== undefined) {

        region.on('update-end', () => {
          if (region !== undefined) {
            this.actions.performAction(new CueUpdateAction(parseInt(region.id), region.start))
            this.actions.performAction(new CueSelectAction(parseInt(region.id)))
          }
        })

        region.on('in', () => {
          if (region !== undefined) {
            if (parseInt(region.id) === cues.getSelectedCueId()) return
            let cue = cues.getCue(parseInt(region.id)) as Cue
            let nextCue = cues.getNextCue(cue)
            if (nextCue !== null && Math.round(nextCue.time*10) <= Math.round(this.wavesurfer!.getCurrentTime()*10)) return
            if (cue === null) {
              this.actions.performAction(new CueSelectAction(null))
            } else {
              let shouldFade = cue.fade > 0
              let action = new CueSelectAction(cue.id, shouldFade, () => {
                let time = this.wavesurfer?.getCurrentTime()
                if (!time) return 1
                let t = (time - cue!.time) / cue!.fade
                if (t < 0) t = 0
                if (t > 1) t = 1
                return t
              })

              this.actions.performAction(action)
            }
          }
        })
      }
    })
  }

  resize() {
    setTimeout(() => {
      let width = this.waveform.nativeElement.clientWidth
      this.baseZoom = (width) / (this.wavesurfer?.getDuration() || 1)
      this.updateZoom()
    }, 100)
  }

  zoomIn() {
    this.zoomFactor *= 2
    this.zoomFactor = Math.min(this.zoomFactor, 16)
    this.updateZoom()
  }

  zoomOut() {
    this.zoomFactor *= 0.5
    this.zoomFactor = Math.max(this.zoomFactor, 1)
    this.updateZoom()
  }

}
