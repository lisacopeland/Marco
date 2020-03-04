import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-plan-list-view',
  templateUrl: './plan-list-view.component.html',
  styleUrls: ['./plan-list-view.component.scss']
})
export class PlanListViewComponent implements OnInit, OnChanges {
  @Input() planNodes: PlanNodeInterface[];
  displayedColumns: string[] = ['planNodeId', 'description', 'type', 'hasPredecessors', 'dashboard'];
  dataSource: MatTableDataSource<PlanNodeInterface>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.displayList();
  }

  displayList() {
    if (this.planNodes && (Object.keys(this.planNodes).length !== 0)) {
      this.dataSource = new MatTableDataSource<PlanNodeInterface>(this.planNodes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}
