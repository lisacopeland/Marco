import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { ReleasePlanService } from '@services/releaseplan.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

export interface PlanEditData {
  parentId: string;
  releasePlan: ReleasePlanInterface;
}

@Component({
  selector: 'app-planedit',
  templateUrl: './releaseplanedit.component.html',
  styleUrls: ['./releaseplanedit.component.scss']
})
export class PlanEditDialogComponent implements OnInit {

  editTitle = 'Add New Release Plan';
  releasePlanForm: FormGroup;
  releasePlan: ReleasePlanInterface;
  parentId: string;
  editMode = false;

  constructor(
    private releasePlanService: ReleasePlanService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlanEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanEditData) {}

  ngOnInit(): void {
    this.parentId = this.data.parentId;
    this.editMode = this.data.releasePlan !== null;
    if (this.editMode) {
      this.releasePlan = this.data.releasePlan;
      this.editTitle = 'Editing ' + this.releasePlan.description;
    }
    this.initForm();
  }

  initForm() {
    this.releasePlanForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      tags: new FormControl(''),
    });
    if (this.editMode) {
      this.releasePlanForm.patchValue({
        name: this.releasePlan.name,
        description: this.releasePlan.description,
        tags: this.releasePlan.tags[0]
      });
      this.releasePlanForm.get('name').disable();
    } else {
      this.releasePlanForm.get('name').setValidators(Validators.required);
      this.releasePlanForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
    }
  }

  validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    const planId = this.parentId + '.' + control.value;
    return this.releasePlanService.checkNameNotTaken(planId)
      .pipe(
        delay(1000),
        map(res => {
          if (!res) {
            this.releasePlanForm.get('name').setErrors({ nameTaken: true });
            return;
          }
          return null;
        }),
        catchError(() => null)
      );
  }

  onSubmit() {
    if (this.releasePlanForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.releasePlan.description = this.releasePlanForm.value.description;
      this.releasePlan.tags[0] = this.releasePlanForm.value.tags;
      this.releasePlanService.editPlan(this.releasePlan);
      this.snackBar.open('Release plan successfully updated', '', {
        duration: 2000,
      });
    } else {
      const releasePlan = {
        description: this.releasePlanForm.value.description,
        planId: '', // Assigned by service
        parentId: this.parentId,
        name: this.releasePlanForm.value.name,
        startNodeId: '',
        deploymentId: '',
        tags: [this.releasePlanForm.value.tags],
        selfLink: '', // Assigned by Service
        planNodeLink: '' // Assigned by Service
      };
      this.releasePlanService.addPlan(releasePlan);
      this.snackBar.open('Release plan successfully added', '', {
        duration: 2000,
      });
    }
    this.dialogRef.close(this.releasePlan);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
