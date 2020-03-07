import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-plan-list-view',
  templateUrl: './plan-list-view.component.html',
  styleUrls: ['./plan-list-view.component.scss']
})
export class PlanListViewComponent implements OnInit, OnChanges {
  @Input() planNodes: PlanNodeInterface[];
  filterValues = ['All', 'Milestone', 'Task'];
  displayedColumns: string[] = ['planNodeId', 'description', 'type', 'hasPredecessors', 'dashboard'];
  dataSource: MatTableDataSource<PlanNodeInterface>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterValue = 'All';
  selectForm: FormGroup;


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log('hi from ngOnChanges');

    this.selectForm = new FormGroup({
      filterSelect: new FormControl('All')
    });
    this.selectForm.get('filterSelect').valueChanges.subscribe(val => {
      this.filterValue = val;
      this.applyFilter(this.filterValue, this.dataSource);
    });
    this.displayList();
  }

  applyFilter(filterValue: string, dataSource: MatTableDataSource<PlanNodeInterface>) {
    if (dataSource.data === null || dataSource.data.length === 0) {
      return;
    } else if (filterValue === 'All') {
      dataSource.filterPredicate = (data, filter) => {
        return true;
      };
    } else {
      dataSource.filterPredicate = (data, filter) => {
        return String(data.nodeType).includes(filter);
      };
    }
    dataSource.filter = filterValue;
  }


  displayList() {
    // if (this.planNodes && (Object.keys(this.planNodes).length !== 0)) {
      this.dataSource = new MatTableDataSource<PlanNodeInterface>(this.planNodes);
      this.applyFilter(this.filterValue, this.dataSource);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    // }
  }
}
