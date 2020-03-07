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
export interface MilestoneLinkEditDataInterface {
  milestoneLink: MilestoneLinkInterface;
}

@Component({
  selector: 'app-milestonelink-edit',
  templateUrl: './milestonelink-edit.component.html',
  styleUrls: ['./milestonelink-edit.component.scss']
})
export class MilestoneLinkEditDialogComponent implements OnInit {

  editTitle = 'Add New Node';
  nodeForm: FormGroup;
  parentId: string;
  milestoneLink: MilestoneLinkInterface;
  editMode = false;
  milestoneTypes = ['Start', 'API', 'Feature', 'Service', 'Product'];

  constructor(
    private nodeService: NodeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MilestoneLinkEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MilestoneLinkEditDataInterface) { }

  ngOnInit(): void {

    this.editMode = this.data.milestoneLink !== null;
    if (this.editMode) {
      this.milestoneLink = this.data.milestoneLink;
      this.editTitle = 'Editing ' + this.milestoneLink.name;
    }
    this.initForm();
  }

  initForm() {

    // If you are not in edit mode, start with nodetype Milestone and show the fields
    // for that nodeType
    this.nodeForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      linkedMilestoneType: new FormControl(this.milestoneTypes[0]),
      linkedLabel: new FormControl(''),
      linkedStateAnnounced: new FormControl('')
    });
    if (this.editMode) {

      this.nodeForm.patchValue({
        name: this.milestoneLink.name,
        description: this.milestoneLink.description,
        linkedMilestoneType: this.milestoneLink.linkedMilestoneType,
        linkedLabel: this.milestoneLink.linkedLabel,
        linkedStateAnnounced: this.milestoneLink.linkedStateAnnounced
      });
      this.nodeForm.get('name').disable();
    } else {
      this.nodeForm.get('name').setValidators(Validators.required);
      this.nodeForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
      this.onNameChanges();
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

  onSubmit() {
    if (this.nodeForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }

    const milestoneLink = {
        id: (this.editMode) ? this.milestoneLink.id : null,
        parentId: this.parentId,
        name: this.nodeForm.value.name,
        description: this.nodeForm.value.description,
        selfLink: (this.editMode) ? this.milestoneLink.selfLink : '',
        linkedMilestoneType: this.nodeForm.value.linkedMilestoneType,
        linkedLabel: this.nodeForm.value.linkedLabel,
        linkedStateAnnounced: this.nodeForm.value.linkedAnnouncedState,
      } as MilestoneLinkInterface;
    this.dialogRef.close(milestoneLink);

  }

  onClose(): void {
    this.dialogRef.close();
  }

}
