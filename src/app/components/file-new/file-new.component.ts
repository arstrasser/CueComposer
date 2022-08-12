import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-new',
  templateUrl: './file-new.component.html',
  styleUrls: ['./file-new.component.scss']
})
export class FileNewComponent implements OnInit {

  public name: string = ""
  public songName: string = "None"
  public song: Blob | null = null

  constructor(public dialogRef: MatDialogRef<FileNewComponent>) { }

  ngOnInit(): void {
  }

  fileSelected(ev: Event) {
    let target = ev.target as HTMLInputElement

    if (target.files && target.files.length > 0) {
      this.song = target.files[0]
      this.songName = target.files[0].name
    }
  }

  cancel() {
    this.dialogRef.close()
  }

  create() {
    if (this.song !== null) {
      this.dialogRef.close({
        name: this.name,
        song: this.song
      })
    }
  }

}
