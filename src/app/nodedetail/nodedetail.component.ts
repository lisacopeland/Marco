import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeInterface } from '../shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NodeService } from '../shared/services/node.service';

@Component({
  selector: 'app-nodedetail',
  templateUrl: './nodedetail.component.html',
  styleUrls: ['./nodedetail.component.scss']
})
export class NodeDetailDialogComponent implements OnInit {

  editMode = false;
  editTitle = 'Adding New';
  node: NodeInterface;
  nodeForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<NodeDetailDialogComponent>,
              private nodeService: NodeService,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: NodeInterface) { }

  ngOnInit(): void {
    this.editMode = this.data !== null;
    if (this.editMode) {
      this.node = this.data;
      this.editTitle = 'Editing ' + this.node.name;
    } else {
      this.node = {
        id: '',
        name: '',
        predecessors: [],
        releasePlanId: ''
      };
    }
    this.initForm();
  }

  initForm() {
    this.nodeForm = new FormGroup({
    name: new FormControl(this.node.name, [Validators.required, Validators.minLength(2)])
  });
  }

  onSubmit() {
    if (this.nodeForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.node.name = this.nodeForm.value.name;
      this.nodeService.editNode(this.node);
    } else {
      const node = {
        name: this.nodeForm.value.name,
        id: '',
        releasePlanId: '',
        predecessors:[]
      };
      this.nodeService.addNode(node);
    }
    this.dialogRef.close(this.node);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
