import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResizeEvent } from 'angular-resizable-element';
import { FileNewComponent } from '../file-new/file-new.component';
import { FileOpenComponent } from '../file-open/file-open.component';
import { ActionsService, AudioLoadAction, CueDeleteAction, CueLoadAction, CueSelectAction } from '../../services/actions/actions.service';
import { cues } from '../../services/cues';
import { db } from '../../services/db';
import { preferences } from '../../services/preferences';
import { Show } from '../../services/types/show';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-dance-designer',
  templateUrl: './dance-designer.component.html',
  styleUrls: ['./dance-designer.component.scss']
})
export class DanceDesignerComponent implements OnInit {
  @ViewChild('listResizable') listResizable!: ElementRef<HTMLDivElement>;
  @ViewChild('infoResizable') infoResizable!: ElementRef;
  @ViewChild('sidenav') sidenav!: MatDrawer;

  public show: Show | null = null

  constructor(public actions: ActionsService, public dialog: MatDialog, private ngZone: NgZone) {}

  ngOnInit(): void {
    document.addEventListener("keydown", (ev) => {
      if (!ev.repeat) {
        if ((ev.key === "z" && ev.ctrlKey) || ev.key === "\u001a") {
          if (this.actions.canUndo()) {
            this.actions.undo()
          }
        } else if ((ev.key === "y" && ev.ctrlKey) || ev.key === "\u0019") {
          if (this.actions.canRedo()) {
            this.actions.redo()
          }
        } else if(ev.key === "s" && ev.ctrlKey) {
          this.save()
          ev.preventDefault()
        } else if (ev.key === "o" && ev.ctrlKey) {
          this.openShow()
          ev.preventDefault()
        } else if (ev.key === "Delete" && document.activeElement?.tagName === "BODY") {
          ev.preventDefault()
          const selectedCueId = cues.getSelectedCueId()
          if (selectedCueId !== null) {
            this.actions.performAction(new CueDeleteAction(selectedCueId))
          }
        } else if (ev.key === "Escape") {
          this.actions.performAction(new CueSelectAction(null))
        }
      }
    })

    this.openShow()
  }

  ngAfterViewInit() {
    this.listResizable.nativeElement.style.height = preferences.cueListHeight
    this.infoResizable.nativeElement.style.width = preferences.cueWindowWidth
  }

  loadShow(show: Show) {
    this.show = show
    this.actions.performAction(new CueLoadAction(show.cues))
    this.actions.performAction(new AudioLoadAction(show.song))
  }

  save() {
    if (this.show === null) {
      this.openSidenavIfNecessary()
      return
    }

    this.show.cues = cues.cues
    db.saveShow(this.show)
  }

  newShow() {
    const dialogRef = this.dialog.open(FileNewComponent)

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const newShowId = await db.newShow(result.name, result.song)
        const newShow = await db.loadShow(newShowId)
        if (newShow !== null) this.loadShow(newShow)
      } else {
        this.openSidenavIfNecessary()
      }
    })
  }

  openShow() {
    const dialogRef = this.dialog.open(FileOpenComponent)

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        let show = await db.loadShow(result)
        if (show !== null) {
          this.loadShow(show)
        }
      } else {
        this.openSidenavIfNecessary()
      }
    })
  }

  openSidenavIfNecessary() {
    if (this.show === null) {
      this.sidenav.open()
    }
  }

  async importShow(ev: Event) {
    let target = ev.target as HTMLInputElement
    if (target.files === null) {
      this.openSidenavIfNecessary()
      return
    }
    let file = target.files[0]
    const showData = JSON.parse(await file.text())
    const showId = await db.importShow(showData)
    const show = await db.loadShow(showId)
    if (show !== null) {
      this.loadShow(show)
    } else {
      this.openSidenavIfNecessary()
    }
  }

  async exportShow() {
    if (this.show === null) {
      this.openSidenavIfNecessary()
      return
    }
    const showData = await db.exportShow(this.show.id)
    let blob = new Blob([JSON.stringify(showData)], { type: "text/plain;charset=utf-8" })
    let link = window.URL.createObjectURL(blob)
    let a = document.createElement("a")
    a.download = this.show.name+".cuecomposer"
    a.href = link
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  onListResizeEnd(event: ResizeEvent) {
    if (event.rectangle.height) {
      this.listResizable.nativeElement.style.height = event.rectangle.height + "px"
      preferences.cueListHeight = event.rectangle.height + "px"
      preferences.save()
    }
  }

  onInfoResizeEnd(event: ResizeEvent) {
    if (event.rectangle.width) {
      this.infoResizable.nativeElement.style.width = event.rectangle.width + "px"
      window.dispatchEvent(new Event('resize'));
      preferences.cueWindowWidth = event.rectangle.width + "px"
      preferences.save()
    }
  }

}
