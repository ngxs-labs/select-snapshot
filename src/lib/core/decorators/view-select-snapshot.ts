import {
  ɵNG_DIR_DEF,
  ɵNG_COMP_DEF,
  ɵComponentType,
  ɵDirectiveType,
  ɵComponentDef,
  ɵDirectiveDef,
  ɵɵdirectiveInject,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import {
  defineSelectSnapshotProperties,
  getSelectorFromInstance,
} from '../internals/select-snapshot';

/**
 * This decorator has to be used only with components since only components
 * can have templates and interpolated properties. The purpose of this decorator
 * is also to make `selectSnapshot` working in OnPush components.
 */
export function ViewSelectSnapshot(selectorOrFeature?: any, ...paths: string[]) {
  return (target: any, name: string) => {
    // Means we're running in AOT mode.
    if (!!getDef(target.constructor)) {
      decorateView(selectorOrFeature, paths, target, name);
    } else {
      // This means that application is running in the JIT mode. TypeScript invokes
      // property decorators first before class decorators. That means that the `ɵcmp`
      // property is not available yet
      // NOTE: This is safe! Because that micro task is scheduled before
      // the application initialized.
      // Angular waits for the completion of the `APP_INITIALIZER`
      // promise factories later.
      Promise.resolve().then(() => decorateView(selectorOrFeature, paths, target, name));
    }
  };
}

function decorateView(selectorOrFeature: any, paths: string[], target: any, name: string): void {
  const properties = defineSelectSnapshotProperties(selectorOrFeature, paths, target, name);

  const def = getDef(target.constructor);
  const factory = getFactory(target.constructor);

  (def as { factory: Function }).factory = () => {
    const instance = factory();
    const selector = getSelectorFromInstance(
      instance,
      properties.selectorFnName,
      properties.createSelector,
      properties.selectorOrFeature,
    );
    overrideOnDestroy(def, selector);
    return instance;
  };
}

function getFactory<T>(type: ɵDirectiveType<T>): () => T {
  return type.ɵfac;
}

function getDef<T>(
  type: ɵComponentType<T> | ɵDirectiveType<T>,
): ɵComponentDef<T> | ɵDirectiveDef<T> {
  return type[ɵNG_COMP_DEF] || type[ɵNG_DIR_DEF];
}

function createStoreSubscription(selector: any): Subscription {
  const store = ɵɵdirectiveInject(Store);
  // `<any>` is needed here because `ChangeDetectorRef` is an abstract class,
  // abstract classes cannot be assigned to `Type<T>`.
  const ref = ɵɵdirectiveInject<ChangeDetectorRef>(<any>ChangeDetectorRef);
  return store.select(selector).subscribe(() => ref.markForCheck());
}

function overrideOnDestroy<T>(def: ɵComponentDef<T> | ɵDirectiveDef<T>, selector: any): void {
  const subscription = createStoreSubscription(selector);
  const onDestroy: (() => void) | null = def.onDestroy;

  (def as { onDestroy: () => void }).onDestroy = function () {
    // Invoke the original `ngOnDestroy` if it exists.
    // tslint:disable-next-line
    onDestroy && onDestroy.call(this);
    subscription.unsubscribe();
  };
}
