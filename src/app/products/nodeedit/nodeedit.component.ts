import { Component, OnInit, Inject } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

export interface NodeEditData {
  parentId: string;
  node: PlanNodeInterface;
}

@Component({
  selector: 'app-nodeedit',
  templateUrl: './nodeedit.component.html',
  styleUrls: ['./nodeedit.component.scss']
})
export class NodeEditDialogComponent implements OnInit {

  editTitle = 'Add New Node';
  nodeForm: FormGroup;
  node: PlanNodeInterface;
  parentId: string;
  editMode = false;
  nodeTypes = ['Milestone', 'Task'];

  constructor(
    private nodeService: NodeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NodeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NodeEditData) { }

  ngOnInit(): void {
    this.parentId = this.data.parentId;
    this.editMode = this.data.node !== null;
    if (this.editMode) {
      this.node = this.data.node;
      this.editTitle = 'Editing ' + this.node.description;
    }
    this.initForm();
  }

  initForm() {
    this.nodeForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(this.node.description, [Validators.required, Validators.minLength(2)]),
      type: new FormControl(''),
      delayedStartTimerDurationMins: new FormControl(0),
      delayedStartTimerTrigger: new FormControl('')
    });
    if (this.editMode) {
      this.nodeForm.patchValue({
        name: this.node.planNodeName,
        description: this.node.description,
        type: this.node.nodeType
      });
      this.nodeForm.get('name').disable();
      this.nodeForm.get('nodeType').disable();
    } else {
      this.nodeForm.get('name').setValidators(Validators.required);
      this.nodeForm.get('nodeType').setValidators(Validators.required);
      this.nodeForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
    }
  }

  validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    const node = this.parentId + ':' + control.value;
    return this.nodeService.checkNameNotTaken(node)
      .pipe(
        delay(1000),
        map(res => {
          if (res) {
            this.nodeForm.get('name').setErrors({ nameTaken: true });
            return;
          }
          return null;
        }),
        catchError(() => null)
      );
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
      this.snackBar.open('Node successfully updated', '', {
        duration: 2000,
      });
    } else {
      const node = {
        planNodeId: '',
        planNodeName: this.nodeForm.value.name,
        nodeType: this.nodeForm.value.nodeType,
        parentId: this.parentId,
        description: this.nodeForm.value.description,
        predecessors: [],
        delayedStartTimerDurationMins: this.nodeForm.value.delayedStartTimerDurationMins,
        delayedStartTimerTrigger: this.nodeForm.value.delayedStartTimerTrigger,
        selfLink: ''
      };
      this.nodeService.addNode(node);
      this.snackBar.open('Node successfully added', '', {
        duration: 2000,
      });
    }
    this.dialogRef.close(this.node);
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
