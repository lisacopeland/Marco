import { Component, OnInit, Inject } from '@angular/core';
import { PlanNodeInterface, PlanMilestoneInterface, PlanTaskInterface, MilestoneLinkInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// This dialog mutates the data or adds data but does not
// Make database changes
// This dialog is for editing Tasks and Milestones,
// MilestoneLinks are edited in the MilestoneLinkEdit Component

export interface NodeEditDataInterface {
  node: PlanNodeInterface;
  parentId: string;
}

@Component({
  selector: 'app-nodeedit',
  templateUrl: './nodeedit.component.html',
  styleUrls: ['./nodeedit.component.scss']
})
export class NodeEditDialogComponent implements OnInit {

  editTitle = 'Add New Milestone or Task';
  nodeForm: FormGroup;
  node: PlanNodeInterface;
  nodeSelectList: PlanNodeInterface[];
  successors: PlanNodeInterface[] = [];
  predecessors: PlanNodeInterface[] = [];
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

    this.editMode = this.data.node !== null;
    this.parentId = this.data.parentId;
    if (this.editMode) {
      if (this.node.nodeType === 'Milestone') {
        this.node = this.data.node as PlanMilestoneInterface;
      } else {
        this.node = this.data.node as PlanTaskInterface;
      }
      this.editTitle = 'Editing ' + this.node.name;
    }
    this.nodeService.nodeLookup
      .subscribe(data => {
        if (data.length) {
          this.nodeSelectList = data;
          if (this.editMode) {
            const idx = this.nodeSelectList.findIndex(x => x.name === this.node.name);
            this.nodeSelectList.splice(idx, 1);
          }
        }
      });
    this.initForm();
  }

  initForm() {

    // TODO: timerTrigger should be a select of all of the other nodes in the releaseplan
    this.nodeForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      nodeType: new FormControl(this.nodeTypes[0]),
      timerDurationMinutes: new FormControl(0),
      timerTrigger: new FormControl(''),
      predecessor: new FormControl(''),
      successor: new FormControl('')
    });
    if (this.editMode) {
      let currentNode;
      if (this.node.nodeType === 'Milestone') {
        currentNode = this.node as PlanMilestoneInterface;
      } else {
        currentNode = this.node as PlanTaskInterface;
      }
      // Get this nodes predecessors
      this.node.predecessors.forEach(predecessorId => {
        const idx = this.nodeSelectList.findIndex(x => x.id === predecessorId);
        if (idx !== -1) {
          this.successors.push(this.nodeSelectList[idx]);
        }
      });
      // Get this nodes successor
      this.successors = [];
      this.nodeSelectList.forEach(node => {
        // See if the node being edited is in the list of predecessors of
        // this nodes predecessors
        const idx = node.predecessors.findIndex(x => x === node.id);
        if (idx !== -1) {
          // node is a predecessor of node being edited
          this.successors.push(node);
        }
      });
      this.nodeType = this.node.nodeType;
      this.nodeForm.patchValue({
        name: this.node.name,
        description: this.node.description,
        nodeType: this.node.nodeType,
        timerDurationMinutes: this.node.timerDurationMinutes,
        timerTrigger: this.node.timerTrigger
      });
      if (this.predecessors.length) {
        this.nodeForm.patchValue({
          predecessor: this.predecessors[0]
        });
      }
      if (this.successors.length) {
        this.nodeForm.patchValue({
          successor: this.successors[0]
        });
      }

      if (this.nodeType === 'Milestone') {
        this.nodeForm.addControl('milestoneType', new FormControl(currentNode.milestoneType));
        this.nodeForm.addControl('label', new FormControl(currentNode.label)),
        this.nodeForm.addControl('stateAnnounced', new FormControl(currentNode.stateAnnounced));
      } else {
        this.nodeForm.addControl('taskType', new FormControl(currentNode.taskType));
        this.nodeForm.addControl('taskData', new FormControl(currentNode.taskData));
        this.nodeForm.addControl('expectedDurationMinutes', new FormControl(currentNode.expectedDurationMinutes));
      }
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
    // This is only for when the user is adding a brand new node
    this.nodeType = newNodeTypeValue;
      // Swtiching to Milestone or initializing the form
    if (newNodeTypeValue === 'Milestone') {
        this.nodeForm.addControl('milestoneType', new FormControl(this.milestoneTypes[0], Validators.required));
        this.nodeForm.addControl('label', new FormControl('', Validators.required));
        this.nodeForm.addControl('stateAnnounced', new FormControl(''));
        // If you are swapping from Milestone to Task
        if (removeOldControls) {
          this.nodeForm.removeControl('taskType');
          this.nodeForm.removeControl('taskData');
          // this.nodeForm.removeControl('inputs');
          this.nodeForm.removeControl('expectedDurationMinutes');
        }
      } else {
        // Swtiching from Milestone to task
        this.nodeForm.addControl('taskType', new FormControl(''));
        this.nodeForm.addControl('taskData', new FormControl(''));
        // this.nodeForm.addControl('inputs', new FormControl(''));
        this.nodeForm.addControl('expectedDurationMinutes', new FormControl(0));
        if (removeOldControls) {
          this.nodeForm.removeControl('milestoneType');
          this.nodeForm.removeControl('label');
          this.nodeForm.removeControl('stateAnnounced');
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
    let nodeId = '';
    if (!this.editMode) {
      nodeId = this.parentId + '!';
      if (this.nodeType === 'task') {
        nodeId = nodeId + 'T.' + this.nodeForm.value.name;
      } else {
        nodeId = nodeId + 'M.' + this.nodeForm.value.name;
      }
    } else {
      nodeId = this.node.id;
    }

    if (this.nodeType === 'Milestone') {
      const currentNode = this.node as PlanMilestoneInterface;

      node = {
        id: nodeId,
        parentId: this.parentId,
        name: this.nodeForm.value.name,
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: [this.nodeForm.value.predecessors.id],
        timerDurationMinutes: this.nodeForm.value.timerDurationMinutes,
        timerTrigger: this.nodeForm.value.timerTrigger,
        milestoneType: this.nodeForm.value.milestoneType,
        label: this.nodeForm.value.label,
        stateAnnounced: this.nodeForm.value.declaredStatus,
        spanningPredecessors: (this.editMode) ? currentNode.spanningPredecessors : [],
      } as PlanMilestoneInterface;
    } else {
      node = {
        id: nodeId,
        parentId: this.parentId,
        name: this.nodeForm.value.name,
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: [this.nodeForm.value.predecessor.id],
        timerDurationMinutes: this.nodeForm.value.timerDurationMinutes,
        timerTrigger: this.nodeForm.value.timerTrigger,
        taskType: this.nodeForm.value.taskType,
        taskData: this.nodeForm.value.taskData,
        inputs: null,
        expectedDurationMinutes: this.nodeForm.value.expectedDurationMinutes
      } as PlanTaskInterface;
    }

    this.dialogRef.close(node);

/*     if (this.editMode) {
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
    } */

  }

  onClose(): void {
    this.dialogRef.close();
  }

}
