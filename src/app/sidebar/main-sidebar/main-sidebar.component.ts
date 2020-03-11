import { Component, OnInit } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 500,
  touchendHideDelay: 1000,
};

@Component({
  selector: 'app-main-sidebar',
  templateUrl: './main-sidebar.component.html',
  styleUrls: ['./main-sidebar.component.scss'],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }
  ]
})
export class MainSidebarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
