import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ProgressState } from '../../store';

@Component({
  selector: 'app-progress',
  template: `
    <div>
      <div [style.width.%]="progress"></div>
    </div>
  `,
  styleUrls: ['./progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComponent {
  @Input() @HostBinding('class.ivy-enabled') ivyEnabled: boolean;

  @ViewSelectSnapshot(ProgressState.getProgress) progress: number;
}
