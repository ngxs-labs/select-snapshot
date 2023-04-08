<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

> Flexibile decorator, an alternative for the `@Select` but selects a snapshot of the state

![@ngxs-labs/select-snapshot](https://github.com/ngxs-labs/select-snapshot/workflows/@ngxs-labs/select-snapshot/badge.svg)
[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fselect-snapshot.svg)](https://badge.fury.io/js/%40ngxs-labs%2Fselect-snapshot)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/select-snapshot/blob/master/LICENSE)

## Table of Contents

- [Angular Compatibility](#angular-compatibility)
- [Install](#📦-install)
- [Usage](#🔨-usage)
- [API](#api)
  - [SelectSnapshot](#selectsnapshot)
  - [ViewSelectSnapshot](#viewselectsnapshot)
- [Summary](#summary)

## Angular Compatibility

`@ngxs-labs/select-snapshot@3+` is compatible only with Angular starting from 10.0.5 version.

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

## API

There are 2 decorators exposed publicly. These are `@SelectSnapshot` and `@ViewSelectSnapshot`. They can be used to decorate class properties.

### SelectSnapshot

`@SelectSnapshot` decorator behaves the same as the `@Select` decorator. The only difference is `@SelectSnapshot` decorated property will always return the current state value whereas `@Select` decorated property returns an `Observable`. Let's look at the following example:

```ts
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

@Injectable()
export class TokenInterceptor {
  @SelectSnapshot(AuthState.token) token: string | null;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    }

    return next.handle(req);
  }
}
```

As you may notice we don't have to inject the `Store` class and invoke the `selectSnapshot` on it.

### ViewSelectSnapshot

`@ViewSelectSnapshot` is a decorator that should decorate class properties that are used in templates (e.g. _renderable_ or passed as _bindings_). Given the following example:

```ts
@Component({
  selector: 'app-progress',
  template: `
    <div>
      <div [style.width.%]="progress"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComponent {
  // 🚫 Do not use `SelectSnapshot` since `progress` is used in the template.
  @SelectSnapshot(ProgressState.getProgress) progress: number;
}
```

Why? Because if the `progress` state gets updated then Angular has to check that view and update it. This view will not get updated because it's marked as `OnPush`, which means it's constantly in `CheckOnce` state. How to make the above example work?

```ts
@Component({
  selector: 'app-progress',
  template: `
    <div>
      <div [style.width.%]="progress"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComponent {
  // ✔️ Our view will be checked and updated.
  @ViewSelectSnapshot(ProgressState.getProgress) progress: number;
}
```

How does it work? The `@ViewSelectSnapshot` decorator calls `markForCheck()` under the hood when the `progress` state gets updated.

## Summary

We have looked at several examples of using both decorators. Consider to use the `@SelectSnapshot` if decorated properties are not used in templates! Consider to use the `@ViewSelectSnapshot` if decorated properties are used in templates (e.g. _renderable_ or passed as _bindings_).
