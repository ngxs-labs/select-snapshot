<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

> Flexibile decorator, an alternative for the `@Select` but selects a snapshot of the state

![@ngxs-labs/select-snapshot](https://github.com/ngxs-labs/select-snapshot/workflows/@ngxs-labs/select-snapshot/badge.svg)
[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fselect-snapshot.svg)](https://badge.fury.io/js/%40ngxs-labs%2Fselect-snapshot)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/select-snapshot/blob/master/LICENSE)

## Table of Contents

- [Compatibility with Angular Versions](#compatibility-with-angular-versions)
- [Install](#📦-install)
- [Usage](#🔨-usage)
- [API](#api)
  - [SelectSnapshot](#selectsnapshot)
  - [ViewSelectSnapshot](#viewselectsnapshot)
- [Summary](#summary)

## Compatibility with Angular Versions

<table>
  <thead>
    <tr>
      <th>@ngxs-labs/select-snapshot</th>
      <th>Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        3.x
      </td>
      <td>
        >= 10.0.5 < 13
      </td>
    </tr>
    <tr>
      <td>
        4.x
      </td>
      <td>
        >= 13 < 15
      </td>
    </tr>
    <tr>
      <td>
        5.x
      </td>
      <td>
        >= 15
      </td>
    </tr>
  </tbody>
</table>

## 📦 Install

To install `@ngxs-labs/select-snapshot`, run the following command:

```sh
$ npm install @ngxs-labs/select-snapshot
# Or if you're using yarn
$ yarn add @ngxs-labs/select-snapshot
# Or if you're using pnpm
$ pnpm install @ngxs-labs/select-snapshot
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

`@ngxs-labs/select-snapshot` exposes `@SelectSnapshot` and `@ViewSelectSnapshot` decorators, they might be used to decorate class properties.

### SelectSnapshot

`@SelectSnapshot` decorator should be used similarly to the `@Select` decorator. It will decorate the property to always return the latest selected value, whereas `@Select` decorates properties to return observable. Given the following example:

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

We don't have to inject the `Store` and call the `selectSnapshot`.

Behind the scenes, `@SelectSnapshot` sets up a getter that calls `store.selectSnapshot` with the provided selector on each access.
In the above example, it roughly equates to setting up this property getter:

```ts
get token(): string | null {
  // ... inject `Store` in variable `store`
  return store.selectSnapshot(AuthState.token);
}
```

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

The `@ViewSelectSnapshot` decorator will force the template to be updated whenever the `progress` property is changed on the state:

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

The decorator internally subscribes to `store.select` with the provided selector and calls `markForCheck()` whenever the state is updated (and the selector emits).

## Summary

We have looked at several examples of using both decorators. Consider to use the `@SelectSnapshot` if decorated properties are not used in templates! Consider to use the `@ViewSelectSnapshot` if decorated properties are used in templates (e.g. _renderable_ or passed as _bindings_).
