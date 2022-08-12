import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { db } from '../../services/db';

@Component({
  selector: 'app-file-open',
  templateUrl: './file-open.component.html',
  styleUrls: ['./file-open.component.scss']
})
export class FileOpenComponent implements OnInit {

  selectedShowId: number | null = null
  shows: {id: number, name: string, modifyDate: number;}[] = []

  displayedColumns: string[] = ['name', 'modifyDate']

  constructor(public dialogRef: MatDialogRef<FileOpenComponent>) {}

  async ngOnInit() {
    this.shows = await db.listShows() as {id: number, name: string, modifyDate: number;}[]
    this.shows.sort((a, b) => b.modifyDate - a.modifyDate)
  }

  updateShow(show: {id: number, name: string, modifyDate: number}) {
    show.modifyDate = Date.now()
    db.updateShow(show.id, show.name)
    this.shows = this.shows.map(s => s.id === show.id ? show : s)
    this.shows.sort((a, b) => b.modifyDate - a.modifyDate)
  }

  selectShow(showId: number) {
    this.selectedShowId = showId
  }

  formatDate(date: number) {
    return new Date(date).toLocaleString()
  }

  cancel() {
    this.dialogRef.close()
  }

  remove() {
    if (this.selectedShowId !== null) {
      db.deleteShow(this.selectedShowId)
      this.shows = this.shows.filter(show => show.id !== this.selectedShowId)
      this.selectedShowId = null
    }
  }

  open() {
    this.dialogRef.close(this.selectedShowId)
  }

}
