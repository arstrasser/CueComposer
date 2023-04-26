import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileNewComponent } from '../file-new/file-new.component';
import { db } from '../../services/db';

@Component({
  selector: 'app-file-export',
  templateUrl: './file-export.component.html',
  styleUrls: ['./file-export.component.scss']
})
export class FileExportComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FileNewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {name: string, id: number}
  ) {
    console.log(this.data)
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close()
  }

  exportShow() {
    db.exportShow(this.data.id)
  }

  exportCues() {
    db.exportCues(this.data.id)
  }

}
