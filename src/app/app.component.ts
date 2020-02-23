import { Component, OnInit } from '@angular/core';
// import * as environment from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'marco';

  ngOnInit() {
    console.log('production is ');
  }
}
