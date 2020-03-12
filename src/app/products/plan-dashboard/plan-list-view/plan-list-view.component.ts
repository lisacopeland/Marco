import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormGroup } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatDialog } from '@angular/material/dialog';
import { NodeActionInterface } from '../plan-dashboard.component';

@Component({
  selector: 'app-plan-list-view',
  templateUrl: './plan-list-view.component.html',
  styleUrls: ['./plan-list-view.component.scss']
})
export class PlanListViewComponent implements OnInit {
  @Output() nodeAction = new EventEmitter<NodeActionInterface>();
  planNodes: PlanNodeInterface[];
  filterValues = ['All', 'Milestone', 'Task'];
  displayedColumns: string[] = ['planNodeId', 'description', 'type', 'hasPredecessors'];
  dataSource: MatTableDataSource<PlanNodeInterface>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterValue = 'All';
  dataLength = 0;
  selectForm: FormGroup;

  constructor(public dialog: MatDialog,
              private nodeService: NodeService) { }

  ngOnInit(): void {
    this.selectForm = new FormGroup({
      filterSelect: new FormControl('All')
    });
    this.selectForm.get('filterSelect').valueChanges.subscribe(val => {
      this.filterValue = val;
      this.applyFilter(this.filterValue, this.dataSource);
    });
    this.nodeService.nodeLookup
      .subscribe(data => {
        if (data.length) {
          this.planNodes = data;
          this.displayList();
        }
      });
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

  onAddPlanNode() {
    // Send a message to the dashboard to add a node
    this.nodeAction.emit({
      action: 'add',
      planNode: null
    });
  }

  onEditNode(row) {
    this.nodeAction.emit({
      action: 'edit',
      planNode: row
    });
  }

  onDeleteNode(row) {
    this.nodeAction.emit({
      action: 'delete',
      planNode: row
    });
  }

  displayList() {
    if (this.planNodes && (Object.keys(this.planNodes).length !== 0)) {
      this.dataSource = new MatTableDataSource<PlanNodeInterface>(this.planNodes);
      this.dataLength = this.dataSource.data.length;
      this.applyFilter(this.filterValue, this.dataSource);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}