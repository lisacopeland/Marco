import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { ReleasePlanService } from '@services/releaseplan.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ReleasePlanEditData {
  productId: string;
  releasePlan: ReleasePlanInterface;
}

@Component({
  selector: 'app-releaseplanedit',
  templateUrl: './releaseplanedit.component.html',
  styleUrls: ['./releaseplanedit.component.scss']
})
export class ReleasePlanEditDialogComponent implements OnInit {

  editTitle = 'Add New Release Plan';
  planForm: FormGroup;
  releasePlan: ReleasePlanInterface;
  productId: string;
  editMode = false;

  constructor(
    private releasePlanService: ReleasePlanService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReleasePlanEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReleasePlanEditData) {}

  ngOnInit(): void {
    this.productId = this.data.productId;
    this.editMode = this.data.releasePlan !== null;
    if (this.editMode) {
      this.releasePlan = this.data.releasePlan;
      this.editTitle = 'Editing ' + this.releasePlan.name;
    } else {
      this.releasePlan = {
        id: '',
        name: '',
        productId: this.productId
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
      this.snackBar.open('Release plan successfully updated', '', {
        duration: 2000,
      });
    } else {
      const releasePlan = {
        name: this.planForm.value.name,
        id: '',
        productId: this.productId
      };
      this.releasePlanService.addReleasePlan(releasePlan);
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
