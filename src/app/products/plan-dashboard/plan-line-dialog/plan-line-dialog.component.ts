import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeInterface } from '@shared/interfaces/node.interface';
import { NodeService } from '@shared/services/node.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface PlanLineEditDialogData {
  node: NodeInterface;
  direction: string;  // If from, add a line from this node, if to, add a line to this node
}

@Component({
  selector: 'app-line-dialog',
  templateUrl: './plan-line-dialog.component.html',
  styleUrls: ['./plan-line-dialog.component.scss']
})
export class PlanLineDialogComponent implements OnInit, OnDestroy {

  // If direction is 'from' then you are making a line from the original node to the
  // one you are selecting, if the direction is 'to' then you are making a line to the
  // one you are selecting
  node: NodeInterface;
  direction = '';
  dialogTitle = '';
  nodeSelectList: NodeInterface[];
  nodeForm: FormGroup;
  unsubscribe$: Subject<void> = new Subject<void>();

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
      .pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
        if (data.length) {
          this.nodeSelectList = data;
          this.nodeSelectList.forEach(x => {
            console.log('node name ' + x.name);
          });
          this.pruneSelectList();
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

  pruneSelectList() {
    // First take myself out of the list
    const idx = this.nodeSelectList.findIndex(x => x.name === this.node.name);
    if (idx !== -1) {
      this.nodeSelectList.splice(idx, 1);
    }
    // Then take anything out that is already one of my predecessors

    // now take out anything that is a successor of me
  }

  onSubmit() {
    if (this.direction === 'from') {
      // Add the original node to the predecessor array of the node
      // you chose
      const targetNode: NodeInterface = this.nodeForm.value.newNode;
      this.dialogRef.close({
        source: this.node,
        target: targetNode});
    } else {
      const sourceNode: NodeInterface = this.nodeForm.value.newNode;
      this.dialogRef.close({
        source: sourceNode,
        target: this.node
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
