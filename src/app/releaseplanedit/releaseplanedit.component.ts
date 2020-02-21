import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleasePlanInterface } from '../shared/interfaces/releaseplan.interface';
import { ReleasePlanService } from '../shared/services/releaseplan.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-releaseplanedit',
  templateUrl: './releaseplanedit.component.html',
  styleUrls: ['./releaseplanedit.component.scss']
})
export class ReleasePlanEditDialogComponent implements OnInit {

  editTitle = 'Add New Release Plan';
  planForm: FormGroup;
  releasePlan: ReleasePlanInterface;
  editMode = false;

  constructor(
    private releasePlanService: ReleasePlanService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReleasePlanEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReleasePlanInterface) {}

  ngOnInit(): void {
    this.editMode = this.data !== null;
    if (this.editMode) {
      this.releasePlan = this.data;
      this.editTitle = 'Editing ' + this.releasePlan.name;
    } else {
      this.releasePlan = {
        id: '',
        name: '',
      };
    }
    this.initForm();
  }

  initForm() {
    this.planForm = new FormGroup({
      name: new FormControl(this.releasePlan.name, [Validators.required, Validators.minLength(2)])
    });
  }

  onSubmit() {
    if (this.planForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.releasePlan.name = this.planForm.value.name;
      this.releasePlanService.editReleasePlan(this.releasePlan);
    } else {
      const releasePlan = {
        name: this.planForm.value.name,
        id: ''
      };
      this.releasePlanService.addReleasePlan(releasePlan);
    }
    this.dialogRef.close(this.releasePlan);
  }

  onClose(): void {
    this.dialogRef.close();
  }


}
