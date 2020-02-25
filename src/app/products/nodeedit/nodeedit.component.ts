import { Component, OnInit, Inject } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NodeEditData {
  PlanId: string;
  node: PlanNodeInterface;
}

@Component({
  selector: 'app-nodeedit',
  templateUrl: './nodeedit.component.html',
  styleUrls: ['./nodeedit.component.scss']
})
export class NodeEditDialogComponent implements OnInit {

  editTitle = 'Add New Release Plan';
  nodeForm: FormGroup;
  node: PlanNodeInterface;
  planId: string;
  editMode = false;

  constructor(
    private nodeService: NodeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NodeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NodeEditData) { }

  ngOnInit(): void {
    this.planId = this.data.PlanId;
    this.editMode = this.data.node !== null;
    if (this.editMode) {
      this.node = this.data.node;
      this.editTitle = 'Editing ' + this.node.description;
    } else {
      this.node = {
        planNodeId: '',
        nodeType: 'Task',
        planId: '',
        description: '',
        predecessors: [],
        delayedStartTimerDurationMins: 0,
        delayedStartTimerTrigger: ''
      };
    }
    this.initForm();
  }

  initForm() {
    this.nodeForm = new FormGroup({
      description: new FormControl(this.node.description, [Validators.required, Validators.minLength(2)])
    });
  }

  onSubmit() {
    if (this.nodeForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.node.description = this.nodeForm.value.description;
      this.node.delayedStartTimerDurationMins = this.nodeForm.value.delayedStartTimerDurationMins;
      this.node.delayedStartTimerTrigger = this.nodeForm.value.delayedStartTimerTrigger;
      this.nodeService.editNode(this.node);
      this.snackBar.open('Release plan successfully updated', '', {
        duration: 2000,
      });
    } else {
      const node = {
        planNodeId: '',
        nodeType: this.nodeForm.value.nodeType,
        planId: this.planId,
        description: this.nodeForm.value.description,
        predecessors: [],
        delayedStartTimerDurationMins: this.nodeForm.value.delayedStartTimerDurationMins,
        delayedStartTimerTrigger: this.nodeForm.value.delayedStartTimerTrigger
      };
      this.nodeService.addNode(node);
      this.snackBar.open('Release plan successfully added', '', {
        duration: 2000,
      });
    }
    this.dialogRef.close(this.node);
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
