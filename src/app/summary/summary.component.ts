import { Component, OnInit } from '@angular/core';
import { ReleasePlanService } from '../shared/services/releaseplan.service';
import { ReleasePlanInterface } from '../shared/interfaces/releaseplan.interface';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ReleasePlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  releasePlans: ReleasePlanInterface[];

  constructor(private releasePlanService: ReleasePlanService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.releasePlans = this.releasePlanService.getReleasePlans();
  }

  onAdd() {
    const dialogRef = this.dialog.open(ReleasePlanEditDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
