import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ReleasePlanService } from '../shared/services/releaseplan.service';
import { ReleasePlanInterface } from '../shared/interfaces/releaseplan.interface';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ReleasePlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<boolean> = new Subject();
  displayedColumns: string[] = ['id', 'name', 'dashboard'];
  dataSource: MatTableDataSource<ReleasePlanInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private releasePlanService: ReleasePlanService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.releasePlanService.getReleasePlanObservable()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(releasePlans => {
      this.dataSource = new MatTableDataSource<ReleasePlanInterface>(releasePlans);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(ReleasePlanEditDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
