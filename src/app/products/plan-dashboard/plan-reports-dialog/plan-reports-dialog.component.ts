import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleasePlanInterface } from '@shared/interfaces/releaseplan.interface';

@Component({
  selector: 'app-plan-reports-dialog',
  templateUrl: './plan-reports-dialog.component.html',
  styleUrls: ['./plan-reports-dialog.component.scss']
})
export class PlanReportsDialogComponent implements OnInit {
  releasePlan: ReleasePlanInterface;

  constructor(public dialogRef: MatDialogRef<PlanReportsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ReleasePlanInterface) { }

  ngOnInit(): void {
    this.releasePlan = this.data;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
