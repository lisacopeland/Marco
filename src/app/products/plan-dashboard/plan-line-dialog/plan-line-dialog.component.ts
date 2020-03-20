import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { NodeService } from '@shared/services/node.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

export interface PlanLineEditDialogData {
  node: PlanNodeInterface;
  direction: string;  // If from, add a line from this node, if to, add a line to this node
}

@Component({
  selector: 'app-line-dialog',
  templateUrl: './plan-line-dialog.component.html',
  styleUrls: ['./plan-line-dialog.component.scss']
})
export class PlanLineDialogComponent implements OnInit {

  // If direction is 'from' then you are making a line from the original node to the
  // one you are selecting, if the direction is 'to' then you are making a line to the
  // one you are selecting
  node: PlanNodeInterface;
  direction = '';
  dialogTitle = '';
  nodeSelectList: PlanNodeInterface[];
  nodeForm: FormGroup;

  constructor(private nodeService: NodeService,
              public dialogRef: MatDialogRef<PlanLineDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PlanLineEditDialogData) { }

  ngOnInit(): void {
    this.node = this.data.node;
    this.direction = this.data.direction;
    if (this.direction === 'from') {
      this.dialogTitle = 'Create a line from ' + this.node.name;
    } else {
      this.dialogTitle = 'Create a line to ' + this.node.name;
    }
    this.nodeService.nodeLookup
      .subscribe(data => {
        if (data.length) {
          this.nodeSelectList = data;
          this.nodeSelectList.forEach(x => {
            console.log('node name ' + x.name);
          });
          const idx = this.nodeSelectList.findIndex(x => x.name === this.node.name);
          if (idx !== -1) {
            this.nodeSelectList.splice(idx, 1);
          }
          this.nodeSelectList.forEach(x => {
            console.log('node name ' + x.name);
          });
        }
        this.initForm();
      });
  }

  initForm() {
    this.nodeForm = new FormGroup({
      newNode: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (this.direction === 'from') {
      // Add the original node to the predecessor array of the node
      // you chose
      const node: PlanNodeInterface = this.nodeForm.value.newNode;
      node.predecessors.push(this.node.id);
      this.dialogRef.close(node);
    } else {
      this.node.predecessors.push(this.nodeForm.value.node.id);
      this.dialogRef.close(this.node);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
