import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';

import { IncrementProgress } from './progress.actions';

export interface ProgressStateModel {
  progress: number;
}

@Injectable()
@State<ProgressStateModel>({
  name: 'progress',
  defaults: {
    progress: 0,
  },
})
export class ProgressState {
  @Selector()
  static getProgress(state: ProgressStateModel): number {
    return state.progress;
  }

  @Action(IncrementProgress)
  incrementProgress(ctx: StateContext<ProgressStateModel>) {
    const state = ctx.getState();

    if (state.progress !== 100) {
      state.progress += 1;
      ctx.setState({ ...state });
    }
  }
}
