import { Component, OnInit, OnChanges, Input } from '@angular/core';
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
  selector: 'app-linkpoint-edit',
  templateUrl: './linkpointedit.component.html',
  styleUrls: ['./linkpointedit.component.scss']
})
export class LinkpointEditComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() node: LinkPointNodeInterface;

  currentChoice: MilestoneNodeInterface;
  linkpointForm: FormGroup;
  editMode = false;
  onReady = false;
  milestoneTypes = ['Start', 'Infrastructure', 'API', 'Feature', 'Service', 'Product', 'Internal', 'External'];
  linkMilestoneChoices = [
    {
      id: 'test001',
      milestoneType: 'API',
      label: 'test 001 label',
      stateAnnounced: 'this is the state Announced'
    },
    {
      id: 'test002',
      milestoneType: 'Feature',
      label: 'test 002 label',
      stateAnnounced: 'this is the state Announced'
    }

  ];

  constructor(private productService: ProductService,
              private nodeService: NodeService) { }

  ngOnInit(): void {

  }

  comparer(o1: any, o2: any): boolean {
    // if possible compare by object's name property - and not by reference.
    return o1 && o2 ? o1.id === o2.id : o2 === o2;
  }

  initForm() {
    this.linkpointForm = new FormGroup({
      linkedMilestoneSelect: new FormControl('')
    });
    this.onLinkSelectChanges();
    this.parentForm.addControl('linkpointForm', this.linkpointForm);
    this.linkpointForm.setParent(this.parentForm);
    this.onReady = true;
  }

  patchForm() {
    this.editMode = true;
    this.currentChoice = this.linkMilestoneChoices.find(x => x.id === this.node.linkedId) as MilestoneNodeInterface;
    this.linkpointForm.patchValue({
      linkedMilestoneSelect: this.currentChoice,
    });
  }

  onLinkSelectChanges(): void {
    this.linkpointForm.get('linkedMilestoneSelect').valueChanges
      .subscribe(val => {
        this.currentChoice = val;
      });
  }

}
