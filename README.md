<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

> Flexibile decorator, an alternative for the `@Select` but selects a snapshot of the state

[![Build status](https://ci.appveyor.com/api/projects/status/jf1q7ypda4udyb2h/branch/master?svg=true)](https://ci.appveyor.com/project/arturovt/select-snapshot/branch/master)
[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fselect-snapshot.svg)](https://badge.fury.io/js/%40ngxs-labs%2Fselect-snapshot)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/select-snapshot/blob/master/LICENSE)

## 📦 Install

To install `@ngxs-labs/select-snapshot` run the following command:

```console
npm install @ngxs-labs/select-snapshot
# of if you use yarn
yarn add @ngxs-labs/select-snapshot
```

## 🔨 Usage

Import the `NgxsSelectSnapshotModule` into your root application module:

```typescript
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';

@NgModule({
  imports: [NgxsModule.forRoot(states), NgxsSelectSnapshotModule.forRoot()],
})
export class AppModule {}
```

### Selecting snapshot

The `@SelectSnapshot` is just a simple decorator same as `@Select`. It allows you to decorate properties of your classes applying new getter and lets you to avoid injecting `Store` class everywhere. Simple example, let's create some tiny `pandas` state:

```typescript
import { State, Action, StateContext } from '@ngxs/store';

class AddPanda {
  static type = '[Pandas] Add panda';
  constructor(public panda: string) {}
}

@State<string[]>({
  name: 'pandas',
  defaults: [],
})
export class PandasState {
  @Action(AddPanda)
  addPanda(ctx: StateContext<string[]>, action: AddPanda): void {
    const pandas = ctx.getState();
    ctx.setState([...pandas, action.panda]);
  }
}
```

Assume you've provided this state into your root `NgxsModule` and want already to try the `@SelectSnapshot` decorator:

```typescript
import { Component } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { PandasState } from './pandas.state';

@Component({
  selector: 'app-root',
  template: '<app-panda *ngFor="let panda of pandas" [panda]="panda"></app-panda>',
})
export class AppComponent {
  @SelectSnapshot(PandasState) pandas: string[];
}
```

The `@SelectSnapshot` decorator has the same API as the `@Select` decorator. It accepts state class, selector function, string or nothing as an argument.
