import { Component, OnInit, Inject } from '@angular/core';
import { PlanNodeInterface, PlanMilestoneInterface, PlanTaskInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface NodeEditDataInterface {
  parentId: string;
  nodeLink: string;
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
  nodeLink: string;
  parentId: string;
  editMode = false;
  nodeType = 'Milestone';
  nodeTypes = ['Milestone', 'Task'];
  milestoneTypes = ['Start', 'API', 'Feature', 'Service', 'Product'];

  constructor(
    private nodeService: NodeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NodeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NodeEditDataInterface) { }

  ngOnInit(): void {
    this.parentId = this.data.parentId;
    this.nodeLink = this.data.nodeLink;
    this.editMode = this.data.node !== null;
    if (this.editMode) {
      if (this.node.nodeType === 'Milestone') {
        this.node = this.data.node as PlanMilestoneInterface;
      } else {
        this.node = this.data.node as PlanTaskInterface;
      }
      this.editTitle = 'Editing ' + this.node.name;
    }
    this.initForm();
  }

  initForm() {

    // If you are not in edit mode, start with nodetype Milestone and show the fields
    // for that nodeType
    this.nodeForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      nodeType: new FormControl(this.nodeTypes[0]),
      delayedStartTimerDurationMins: new FormControl(0),
      delayedStartTimerTrigger: new FormControl('')
    });
    if (this.editMode) {
      this.nodeType = this.node.nodeType;
      this.nodeForm.patchValue({
        name: this.node.name,
        description: this.node.description,
        nodeType: this.node.nodeType
      });
      this.nodeForm.get('name').disable();
      this.nodeForm.get('nodeType').disable();
    } else {
      this.nodeType = 'Milestone';
      this.nodeForm.get('name').setValidators(Validators.required);
      this.nodeForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
      this.onNameChanges();
      this.nodeForm.get('nodeType').setValidators(Validators.required);
      this.swapNodeTypeFields('Milestone', false);
      this.onNodeTypeChanges();
    }
  }

  swapNodeTypeFields(newNodeTypeValue: string, removeOldControls: boolean) {
    // I shouldn't even have this because I wont allow changing the nodetype
    this.nodeType = newNodeTypeValue;
      // Swtiching to Milestone or initializing the form
    if (newNodeTypeValue === 'Milestone') {
        this.nodeForm.addControl('milestoneType', new FormControl(this.milestoneTypes[0], Validators.required));
        this.nodeForm.addControl('label', new FormControl('', Validators.required));
        this.nodeForm.addControl('declaredStatus', new FormControl(''));
        if (this.editMode) {
          // Initialize the fields with the original values
          const currentNode = this.node as PlanMilestoneInterface;
          this.nodeForm.patchValue({
            milestoneType: currentNode.milestoneType,
            label: currentNode.label,
            declaredStatus: currentNode.declaredStatus,
          });
        }
        // If you are swapping from Milestone to Task
        if (removeOldControls) {
          this.nodeForm.removeControl('taskType');
          this.nodeForm.removeControl('taskData');
          this.nodeForm.removeControl('inputs');
          this.nodeForm.removeControl('expectedDurationMins');
        }
      } else {
        // Swtiching from Milestone to task
        this.nodeForm.addControl('taskType', new FormControl(''));
        this.nodeForm.addControl('taskData', new FormControl(''));
        this.nodeForm.addControl('inputs', new FormControl(''));
        this.nodeForm.addControl('expectedDurationMins', new FormControl(0));
        if (this.editMode) {
          const currentNode = this.node as PlanTaskInterface;
          this.nodeForm.patchValue({
            taskType: currentNode.taskType,
            taskData: currentNode.taskData,
            inputs: currentNode.inputs,
            expectedDurationMins: currentNode.expectedDurationMins
          });
        }
        if (removeOldControls) {
          this.nodeForm.removeControl('milestoneType');
          this.nodeForm.removeControl('label');
          this.nodeForm.removeControl('declaredStatus');
        }
      }

  }

  validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    const node = this.parentId + ':' + control.value;
    return this.nodeService.checkNameNotTaken(node)
      .pipe(
        delay(1000),
        map(res => {
          if (!res) {
            this.nodeForm.get('name').setErrors({ nameTaken: true });
            return;
          }
          return null;
        }),
        catchError(() => null)
      );
  }

  onNameChanges(): void {
    this.nodeForm.get('name').valueChanges.pipe
      (debounceTime(300),
        distinctUntilChanged()).
      subscribe(val => {
        this.nodeForm.patchValue({
          name: val.toUpperCase()
        });
        if (this.nodeForm.get('name').hasError('nameTaken')) {
          console.log('name is taken!');
        }
      });
  }

  onNodeTypeChanges(): void {
    this.nodeForm.get('nodeType').valueChanges
      .subscribe(val => {
        this.swapNodeTypeFields(val, true);
      });
  }

  onSubmit() {
    if (this.nodeForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }

    let node;
    if (this.nodeType === 'Milestone') {
      const currentNode = this.node as PlanMilestoneInterface;
      node = {
        id: (this.editMode) ? this.node.id : this.parentId + ':' + this.nodeForm.value.name,
        parentId: this.parentId,
        name: this.nodeForm.value.name,
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: (this.editMode) ? this.node.predecessors : [],
        delayedStartTimerDurationMins: this.nodeForm.value.delayedStartTimerDurationMins,
        delayedStartTimerTrigger: this.nodeForm.value.delayedStartTimerTrigger,
        milestoneType: this.nodeForm.value.milestoneType,
        label: this.nodeForm.value.label,
        declaredStatus: this.nodeForm.value.declaredStatus,
        spanningPredecessors: (this.editMode) ? currentNode.spanningPredecessors : [],
      } as PlanMilestoneInterface;
    } else {
      node = {
        id: (this.editMode) ? this.node.id : this.parentId + ':' + this.nodeForm.value.name,
        parentId: this.parentId,
        name: this.nodeForm.value.name,
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: (this.editMode) ? this.node.predecessors : [],
        delayedStartTimerDurationMins: this.nodeForm.value.delayedStartTimerDurationMins,
        delayedStartTimerTrigger: this.nodeForm.value.delayedStartTimerTrigger,
        taskType: this.nodeForm.value.taskType,
        taskData: this.nodeForm.value.taskData,
        inputs: this.nodeForm.value.inputs,
        expectedDurationMins: this.nodeForm.value.expectedDurationMins
      } as PlanTaskInterface;
    }

    if (this.editMode) {
      this.nodeService.editNode(node)
        .subscribe(data => {
          this.snackBar.open('Node successfully updated', '', {
            duration: 2000,
          });
          this.dialogRef.close(node);
        });
    } else {
      this.nodeService.addNode(this.nodeLink, node)
      .subscribe(() => {
        this.snackBar.open('Node successfully added', '', {
          duration: 2000,
        });
        this.dialogRef.close(node);
      });
    }

  }

  onClose(): void {
    this.dialogRef.close();
  }

}
