import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionSequenceTemplateInterface } from '@shared/interfaces/actionsequencetemplate.interface';

@Component({
  selector: 'app-plan-reports-dialog',
  templateUrl: './plan-reports-dialog.component.html',
  styleUrls: ['./plan-reports-dialog.component.scss']
})
export class PlanReportsDialogComponent implements OnInit {
  actionSequenceTemplate: ActionSequenceTemplateInterface;

  constructor(public dialogRef: MatDialogRef<PlanReportsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ActionSequenceTemplateInterface) { }

  ngOnInit(): void {
    this.actionSequenceTemplate = this.data;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
