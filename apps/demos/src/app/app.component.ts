import {
  Component,
  ɵivyEnabled,
  ChangeDetectionStrategy,
  NgModuleRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ProgressState, IncrementProgress } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  @ViewChild('progressContainer', {
    static: true,
    read: ViewContainerRef,
  })
  progressContainer!: ViewContainerRef;

  @SelectSnapshot(ProgressState.getProgress) progress!: number;

  constructor(private ngModuleRef: NgModuleRef<unknown>, private store: Store) {}

  ngOnInit(): void {
    import(/* webpackChunkName: 'progress' */ './progress/progress.component').then(m => {
      const ref = this.progressContainer.createComponent(m.ProgressComponent);
      ref.instance.ivyEnabled = ɵivyEnabled;
      ref.changeDetectorRef.detectChanges();
    });
  }

  startProgress(): void {
    const intervalId = setInterval(() => {
      if (this.progress === 100) {
        clearInterval(intervalId);
        // Just for testing purposes.
        window.dispatchEvent(new CustomEvent('progressCompleted'));
      } else {
        this.store.dispatch(new IncrementProgress());
      }
    }, 5);
  }

  destroy(): void {
    this.ngModuleRef.destroy();
  }
}
