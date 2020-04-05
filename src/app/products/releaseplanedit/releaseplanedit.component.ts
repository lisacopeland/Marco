import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionSequenceTemplateInterface } from '@shared/interfaces/actionsequencetemplate.interface';
import { ActionSequenceTemplateService } from '@shared/services/actionsequencetemplate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
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
  tagChoices = ['region_build', 'availability_zone', 'local_zone'];

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
      name: new FormControl(
        '',
        { validators: [Validators.required],
          asyncValidators: [this.validateNameAvailability.bind(this)],
          updateOn: 'blur' }),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
      tags: new FormControl(''),
    });
    if (this.editMode) {
      this.actionSequenceTemplateForm.get('name').disable();
      this.actionSequenceTemplateForm.patchValue({
        name: this.actionSequenceTemplate.name,
        description: this.actionSequenceTemplate.description,
        tags: this.actionSequenceTemplate.tags
      });
    } else {
      this.onNameChanges();
    }
  }

  validateNameAvailability(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.actionSequenceTemplateService.isNameTaken(ctrl.value).pipe(
      map(isTaken => (isTaken ? { nameTaken: true } : null)),
      catchError(() => of(null))
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
      this.dialogRef.close(this.actionSequenceTemplate);
    } else {
      const actionSequenceTemplate: ActionSequenceTemplateInterface = {
        description: this.actionSequenceTemplateForm.value.description,
        id: this.parentId + '.' + this.actionSequenceTemplateForm.value.name,
        parentId: this.parentId,
        name: this.actionSequenceTemplateForm.value.name,
        tags: this.actionSequenceTemplateForm.value.tags,
        selfLink: '', // Assigned by Service
        view: 'Master',
        nodes: [],
        verifyStatusLink: null,
        verifyLink: null,
        commitLink: null,
        saveLink: null,
        deleteAllLink: null,
        deleteWorkingLink: null,
        committedLink: null,
        workingLink: null
      };
      this.dialogRef.close(this.actionSequenceTemplate);
      this.actionSequenceTemplateService.addActionSequenceTemplate(this.planLink, actionSequenceTemplate)
        .subscribe(() => {
          this.snackBar.open('Release plan successfully added', '', {
            duration: 2000,
          });
        });
    }

  }

  onClose(): void {
    this.dialogRef.close();
  }
}
