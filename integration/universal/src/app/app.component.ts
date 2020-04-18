import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { CounterState, Increment } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  @SelectSnapshot(CounterState.getCounter) counter: number;

  constructor(private store: Store) {}

  increment(): void {
    this.store.dispatch(new Increment());
  }
}
