import { Component, ChangeDetectionStrategy, HostBinding, OnDestroy } from '@angular/core';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ProgressState } from '../store';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProgressComponent implements OnDestroy {
  @HostBinding('class.ivy-enabled') ivyEnabled!: boolean;

  @ViewSelectSnapshot(ProgressState.getProgress) progress!: number;

  ngOnDestroy(): void {
    console.log('Just ensuring that this hook is still called.');
  }
}
