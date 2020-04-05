import { Component, OnInit, Inject, OnChanges, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NodeInterface, MilestoneNodeInterface, ActionNodeInterface, LinkPointNodeInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '@shared/services/product.service';

// This dialog mutates the data or adds data but does not
// Make database changes
// This dialog is for editing Tasks and Milestones,
// MilestoneLinks are edited in the MilestoneLinkEdit Component

@Component({
  selector: 'app-milestone-edit',
  templateUrl: './milestoneedit.component.html',
  styleUrls: ['./milestoneedit.component.scss']
})
export class MilestoneEditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() node: MilestoneNodeInterface;

  milestoneForm: FormGroup;
  editMode = false;
  onReady = false;
  milestoneTypes = ['Start', 'Infrastructure', 'API', 'Feature', 'Service', 'Product', 'Internal', 'External'];

  constructor(private productService: ProductService,
              private nodeService: NodeService) { }

  ngOnInit(): void {

  }

  ngOnChanges() {
    // this.ref.detectChanges();

/*     this.initForm();
    if (this.node) {
      this.editMode = true;
      this.patchForm();
    } */
  }

  ngOnDestroy() {
    this.parentForm.removeControl('milestoneForm');
  }

  comparer(o1: any, o2: any): boolean {
    // if possible compare by object's name property - and not by reference.
    return o1 && o2 ? o1.id === o2.id : o2 === o2;
  }

  initForm() {
    this.milestoneForm = new FormGroup({
      milestoneType: new FormControl(this.milestoneTypes[0]),
      label: new FormControl(''),
      stateAnnounced: new FormControl('')
    });
    this.parentForm.addControl('milestoneForm', this.milestoneForm);
    this.milestoneForm.setParent(this.parentForm);
    this.onReady = true;
  }

  patchForm() {
    this.editMode = true;
    this.parentForm.get('milestoneForm').patchValue({
      milestoneType: this.node.milestoneType,
      label: this.node.label,
      stateAnnounced: this.node.stateAnnounced
    });
  }

}
