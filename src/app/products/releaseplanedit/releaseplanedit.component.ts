import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionSequenceTemplateInterface } from '@shared/interfaces/actionsequencetemplate.interface';
import { ActionSequenceTemplateService } from '@shared/services/actionsequencetemplate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface PlanEditDataInterface {
  planLink: string;
  actionSequenceTemplate: ActionSequenceTemplateInterface;
}

@Component({
  selector: 'app-planedit',
  templateUrl: './releaseplanedit.component.html',
  styleUrls: ['./releaseplanedit.component.scss']
})
export class PlanEditDialogComponent implements OnInit {

  editTitle = 'Add New Release Plan';
  actionSequenceTemplateForm: FormGroup;
  actionSequenceTemplate: ActionSequenceTemplateInterface;
  planLink: string;
  selfLink: string;
  parentId: string;
  editMode = false;

  constructor(
    private actionSequenceTemplateService: ActionSequenceTemplateService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PlanEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanEditDataInterface) {}

  ngOnInit(): void {
    // this.selfLink = this.data.selfLink;
    // this.planLink = this.data.planLink;
    this.editMode = this.data.actionSequenceTemplate !== null;
    if (this.editMode) {
      this.actionSequenceTemplate = this.data.actionSequenceTemplate;
      this.editTitle = 'Editing ' + this.actionSequenceTemplate.description;
    }
    this.initForm();
  }

  initForm() {
    this.actionSequenceTemplateForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      tags: new FormControl(''),
    });
    if (this.editMode) {
      this.actionSequenceTemplateForm.patchValue({
        name: this.actionSequenceTemplate.name,
        description: this.actionSequenceTemplate.description,
        tags: this.actionSequenceTemplate.tags
      });
      this.actionSequenceTemplateForm.get('name').disable();
    } else {
      this.actionSequenceTemplateForm.get('name').setValidators(Validators.required);
      this.actionSequenceTemplateForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
      this.onNameChanges();
    }
  }

  validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    const planId = this.parentId + '.' + control.value;
    return this.actionSequenceTemplateService.checkNameNotTaken(planId)
      .pipe(
        delay(1000),
        map(res => {
          if (!res) {
            this.actionSequenceTemplateForm.get('name').setErrors({ nameTaken: true });
            return;
          }
          return null;
        }),
        catchError(() => null)
      );
  }

  onNameChanges(): void {
    this.actionSequenceTemplateForm.get('name').valueChanges.pipe
      (debounceTime(300),
        distinctUntilChanged()).
      subscribe(val => {
        this.actionSequenceTemplateForm.patchValue({
          name: val.toUpperCase()
        });
        if (this.actionSequenceTemplateForm.get('name').hasError('nameTaken')) {
          console.log('name is taken!');
        }
      });
  }

  onSubmit() {
    if (this.actionSequenceTemplateForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.actionSequenceTemplate.description = this.actionSequenceTemplateForm.value.description;
      this.actionSequenceTemplate.tags = this.actionSequenceTemplateForm.value.tags;
      this.actionSequenceTemplateService.editActionSequenceTemplate(this.actionSequenceTemplate)
        .subscribe(() => {
          this.snackBar.open('Release plan successfully updated', '', {
            duration: 2000,
          });
        });
    } else {
      const actionSequenceTemplate: ActionSequenceTemplateInterface = {
        description: this.actionSequenceTemplateForm.value.description,
        id: this.parentId + '.' + this.actionSequenceTemplateForm.value.name,
        parentId: this.parentId,
        name: this.actionSequenceTemplateForm.value.name,
        tags: ['tag1', 'tag2'],
        selfLink: '', // Assigned by Service
        view: 'Master',
        nodes: [],
        verifyLink: null,
        commitLink: null,
        saveLink: null,
        deleteAllLink: null,
        deleteWorkingLink: null,
        committedLink: null,
        workingLink: null
      };
      this.actionSequenceTemplateService.addActionSequenceTemplate(this.planLink, actionSequenceTemplate)
        .subscribe(() => {
          this.snackBar.open('Release plan successfully added', '', {
            duration: 2000,
          });
        });
    }
    this.dialogRef.close(this.actionSequenceTemplate);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
