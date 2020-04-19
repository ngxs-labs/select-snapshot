import { Component, ɵivyEnabled, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ProgressState, IncrementProgress } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  ivyEnabled = ɵivyEnabled;

  @SelectSnapshot(ProgressState.getProgress) progress: number;

  constructor(private store: Store) {}

  startProgress(): void {
    const intervalId = setInterval(() => {
      if (this.progress === 100) {
        clearInterval(intervalId);
        // Just for testing purposes.
        window.dispatchEvent(new CustomEvent('progressCompleted'));
      } else {
        this.store.dispatch(new IncrementProgress());
      }
    }, 20);
  }
}
