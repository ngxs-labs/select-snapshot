import { Component } from '@angular/core';

import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { CounterState } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @SelectSnapshot(CounterState.getCounter)
  public counter: number;
}
