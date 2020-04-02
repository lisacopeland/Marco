import { Component, OnInit, Inject } from '@angular/core';
import { NodeInterface, MilestoneNodeInterface, ActionNodeInterface, LinkPointNodeInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// This dialog mutates the data or adds data but does not
// Make database changes
// This dialog is for editing Tasks and Milestones,
// MilestoneLinks are edited in the MilestoneLinkEdit Component

export interface NodeEditDataInterface {
  node: NodeInterface;
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
  node: NodeInterface;
  action: ActionNodeInterface;
  milestone: MilestoneNodeInterface;
  linkPoint: LinkPointNodeInterface;
  nodeSelectList: NodeInterface[];
  // successors: NodeInterface[] = [];
  predecessors: NodeInterface[] = [];
  nodeLink: string;
  parentId: string;
  editMode = false;
  nodeType = 'Milestone';
  nodeTypes = ['Milestone', 'Action', 'LinkPoint'];
  milestoneTypes = ['Start', 'Infrastructure', 'API', 'Feature', 'Service', 'Product', 'Internal', 'External'];

  constructor(
    private nodeService: NodeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NodeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NodeEditDataInterface) { }

  ngOnInit(): void {

    // TODO: Field validation, and action data
    this.editMode = this.data.node !== null;
    this.parentId = this.data.parentId;
    this.initForm();
    if (this.editMode) {
      this.node = this.data.node;
      if (this.data.node.nodeType === 'Milestone') {
        this.milestone = this.data.node as MilestoneNodeInterface;
      } else if (this.data.node.nodeType === 'LinkPoint') {
        this.linkPoint = this.data.node as LinkPointNodeInterface;
      } else {
        this.action = this.data.node as ActionNodeInterface;
      }
      this.editTitle = 'Editing ' + this.node.name;
      this.patchForm();
    }
    console.log(this.nodeForm);
    this.nodeService.nodeLookup
      .subscribe(data => {
        if (data.length) {
          // Take the current node out of the selectlist for predecessors and successors
          // and timertrigger
          this.nodeSelectList = data;
          if (this.editMode) {
            const idx = this.nodeSelectList.findIndex(x => x.name === this.node.name);
            this.nodeSelectList.splice(idx, 1);
          }
          this.nodeForm.patchValue({
            predecessors: ''
          });
          console.log(this.nodeForm.value.predecessors);
        }

      });
  }


  comparer(o1: any, o2: any): boolean {
    // if possible compare by object's name property - and not by reference.
    return o1 && o2 ? o1.id === o2.id : o2 === o2;
  }

  initForm() {

    this.nodeForm = new FormGroup({
      name: new FormControl(
        '',
        { validators: [Validators.required],
          asyncValidators: [this.validateNameAvailability.bind(this)],
          updateOn: 'blur' }),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      nodeType: new FormControl(this.nodeTypes[0]),
      timerDurationMinutes: new FormControl(0),
      timerTrigger: new FormControl(''),
      predecessors: new FormControl(''),
      // successors: new FormControl('')
    });
    if (!this.editMode) {
      this.nodeType = 'Milestone';
      this.nodeForm.get('nodeType').setValidators(Validators.required);
      this.swapNodeTypeFields('Milestone', false);
      this.onNodeTypeChanges();
    }
  }

  patchForm() {
      this.predecessors = this.nodeService.getPredecessors(this.node);
      // this.successors = this.nodeService.getSuccessors(this.node);
      const currentTimerTrigger = this.nodeService.getNodeById(this.node.timerTrigger);
      this.nodeType = this.node.nodeType;
      this.nodeForm.patchValue({
        name: this.node.name,
        description: this.node.description,
        nodeType: this.node.nodeType,
        timerDurationMinutes: this.node.timerDurationMinutes,
        timerTrigger: currentTimerTrigger
      });
      if (this.predecessors.length) {
        this.nodeForm.patchValue({
          predecessors: this.predecessors
        });
      }
      // if (this.successors.length) {
      //   this.nodeForm.patchValue({
      //     successors: this.successors
      //   });
      // }
      this.swapNodeTypeFields(this.nodeType, false);
      if (this.nodeType === 'Milestone') {
        this.nodeForm.patchValue({
          milestoneType: this.milestone.milestoneType,
          label: this.milestone.label,
          stateAnnounced: this.milestone.stateAnnounced
        });
      } else if (this.nodeType === 'Action') {
        this.nodeForm.patchValue({
          actionType: this.action.actionType,
          actionData: this.action.actionData,
          expectedDurationMinutes: this.action.expectedDurationMinutes
        });
      } else if (this.nodeType === 'LinkPoint') {
        this.nodeForm.patchValue({
          linkedMilestoneType: this.linkPoint.linkedMilestoneType,
          linkedLabel: this.linkPoint.linkedLabel,
          linkedStateAnnounced: this.linkPoint.linkedStateAnnounced
        });
      }
      this.nodeForm.get('name').disable();
      this.nodeForm.get('nodeType').disable();
  }

  swapNodeTypeFields(newNodeTypeValue: string, removeOldControls: boolean) {
    // This is only for when the user is adding a brand new node
    const oldNodeType = this.nodeType;
    this.nodeType = newNodeTypeValue;
      // Swtiching to Milestone or initializing the form
    if (newNodeTypeValue === 'Milestone') {
      this.nodeForm.addControl('milestoneType', new FormControl(this.milestoneTypes[0]));
      this.nodeForm.addControl('label', new FormControl('')),
      this.nodeForm.addControl('stateAnnounced', new FormControl(''));
    } else if (newNodeTypeValue === 'LinkPoint') {
      this.nodeForm.addControl('linkedMilestoneType', new FormControl(this.milestoneTypes[0]));
      this.nodeForm.addControl('linkedLabel', new FormControl('')),
      this.nodeForm.addControl('linkedStateAnnounced', new FormControl(''));
    } else if (newNodeTypeValue === 'Action' ) {
      this.nodeForm.addControl('actionType', new FormControl(''));
      this.nodeForm.addControl('actionData', new FormControl(''));
      this.nodeForm.addControl('expectedDurationMinutes', new FormControl(0));
    }

    if (removeOldControls) {
      if (oldNodeType === 'Milestone') {
        this.nodeForm.removeControl('milestoneType');
        this.nodeForm.removeControl('label');
        this.nodeForm.removeControl('stateAnnounced');
      } else if (oldNodeType === 'LinkPoint') {
        this.nodeForm.removeControl('linkedMilestoneType');
        this.nodeForm.removeControl('linkedLabel');
        this.nodeForm.removeControl('linkedStateAnnounced');
      } else if (oldNodeType === 'Action') {
        this.nodeForm.removeControl('actionType');
        this.nodeForm.removeControl('actionData');
        this.nodeForm.removeControl('expectedDurationMinutes');
      }
    }

  }

  validateNameAvailability(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.nodeService.isNameTaken(ctrl.value).pipe(
      map(isTaken => (isTaken ? { nameTaken: true } : null)),
      catchError(() => of(null))
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

    let node: NodeInterface;
    let nodeId = '';
    let timerTriggerId = '';
    if (this.nodeForm.value.timerTrigger) {
      timerTriggerId = this.nodeForm.value.timerTrigger.id;
    }
    if (!this.editMode) {
      nodeId = this.parentId + '!';
      if (this.nodeType === 'Action') {
        nodeId = nodeId + 'a.' + this.nodeForm.value.name;
      } else if (this.nodeType === 'Milestone') {
        nodeId = nodeId + 'm.' + this.nodeForm.value.name;
      } else if (this.nodeType === 'Linkpoint') {
        nodeId = nodeId + 'l.' + this.nodeForm.value.name;
      }
    } else {
      nodeId = this.node.id;
    }

    const selectPredecessors = this.nodeForm.value.predecessors.map(x => {
      return x.id;
    });

    // TODO: Add successors to other nodes
    if (this.nodeType === 'Milestone') {
      node = {
        id: nodeId,
        parentId: this.parentId,
        name: (this.editMode) ? this.node.name : this.nodeForm.value.name.toUpperCase(),
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: selectPredecessors,
        timerDurationMinutes: this.nodeForm.value.timerDurationMinutes,
        timerTrigger: timerTriggerId,
        milestoneType: this.nodeForm.value.milestoneType,
        label: this.nodeForm.value.label,
        stateAnnounced: this.nodeForm.value.declaredStatus,
        spanningPredecessors: (this.editMode) ? this.milestone.spanningPredecessors : [],
      } as MilestoneNodeInterface;

    } else if (this.nodeType === 'Action') {
      node = {
        id: nodeId,
        parentId: this.parentId,
        name: (this.editMode) ? this.node.name : this.nodeForm.value.name.toUpperCase(),
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: selectPredecessors,
        timerDurationMinutes: this.nodeForm.value.timerDurationMinutes,
        timerTrigger: timerTriggerId,
        actionType: this.nodeForm.value.actionType,
        actionData: this.nodeForm.value.actionData,
        inputs: null,
        expectedDurationMinutes: this.nodeForm.value.expectedDurationMinutes
      } as ActionNodeInterface;
    } else if (this.nodeType === 'LinkPoint') {
      node = {
        id: nodeId,
        parentId: this.parentId,
        name: (this.editMode) ? this.node.name : this.nodeForm.value.name.toUpperCase(),
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.node.selfLink : '',
        nodeType: this.nodeType,
        predecessors: selectPredecessors,
        timerDurationMinutes: this.nodeForm.value.timerDurationMinutes,
        timerTrigger: timerTriggerId,
        linkedId: (this.editMode) ? this.linkPoint.linkedId : '',
        linkedMilestoneType: this.nodeForm.value.linkedMilestoneType,
        linkedLabel: this.nodeForm.value.linkedLabel,
        linkedStateAnnounced: this.nodeForm.value.linkedStateAnnounced
      } as LinkPointNodeInterface;
    }
    this.dialogRef.close(node);
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
