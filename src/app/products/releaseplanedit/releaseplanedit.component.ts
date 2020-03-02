import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { ReleasePlanService } from '@services/releaseplan.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

export interface PlanEditDataInterface {
  parentId: string;
  planLink: string;
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
  planLink: string;
  parentId: string;
  editMode = false;

  constructor(
    private releasePlanService: ReleasePlanService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlanEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanEditDataInterface) {}

  ngOnInit(): void {
    this.parentId = this.data.parentId;
    this.planLink = this.data.planLink;
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
      this.releasePlanService.editReleasePlan(this.releasePlan)
        .subscribe(() => {
          this.snackBar.open('Release plan successfully updated', '', {
            duration: 2000,
          });
        });
    } else {
      const releasePlan: ReleasePlanInterface = {
        description: this.releasePlanForm.value.description,
        id: this.parentId + '.' + this.releasePlanForm.value.name,
        parentId: this.parentId,
        name: this.releasePlanForm.value.name,
        startNode: 'product5.releaseplan1:node1',
        deploymentId: '',
        tags: [this.releasePlanForm.value.tags],
        selfLink: '', // Assigned by Service
        planNodeLink: '' // Assigned by Service
      };
      this.releasePlanService.addReleasePlan(this.planLink, releasePlan)
        .subscribe(() => {
          this.snackBar.open('Release plan successfully added', '', {
            duration: 2000,
          });
        });
    }
    this.dialogRef.close(this.releasePlan);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
