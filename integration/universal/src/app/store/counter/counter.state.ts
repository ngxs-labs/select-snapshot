import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';

import { Increment, Decrement } from './counter.actions';

export interface CounterStateModel {
  counter: number;
}

@Injectable()
@State<CounterStateModel>({
  name: 'counter',
  defaults: {
    counter: 0,
  },
})
export class CounterState {
  @Selector()
  static getCounter(state: number): number {
    return state;
  }

  @Action(Increment)
  increment({ setState, getState }: StateContext<CounterStateModel>) {
    const state = getState();
    state.counter += 1;
    setState({ ...state });
  }

  @Action(Decrement)
  decrement({ setState, getState }: StateContext<CounterStateModel>) {
    const state = getState();
    state.counter -= 1;
    setState({ ...state });
  }
}
