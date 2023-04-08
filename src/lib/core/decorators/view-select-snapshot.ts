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
import { Store } from '@ngxs/store';
import {  Subscription } from 'rxjs';

import {
  defineSelectSnapshotProperties,
  getSelectorFromInstance,
} from '../internals/select-snapshot';

interface CreateSelectorParams {
  name: string | symbol;
  paths: string[];
  selectorOrFeature: any;
}

const targetToScheduledMicrotaskMap = new Map<Object, Promise<void>>();
const targetToCreateSelectorParamsMap = new Map<Object, CreateSelectorParams[]>();

const SUBSCRIPTIONS: unique symbol = Symbol('SUBSCRIPTIONS');

export function ViewSelectSnapshot(selectorOrFeature?: any, ...paths: string[]): PropertyDecorator {
  return (target: Object, name: string | symbol) => {
    const createSelectorParams = targetToCreateSelectorParamsMap.get(target) || [];

    createSelectorParams.push({
      name,
      paths,
      selectorOrFeature,
    });

    if (!targetToCreateSelectorParamsMap.has(target)) {
      targetToCreateSelectorParamsMap.set(target, createSelectorParams);
      // Since this is a property decorator we're not able to get the component definition and factory
      // synchronously in the current message loop tick. Note that this `Promise` will be resolved
      // before the `APP_INITIALIZER` is resolved.
      targetToScheduledMicrotaskMap.set(
        target,
        Promise.resolve().then(() => decorateTarget(target)),
      );
    }
  };
}

function decorateTarget(target: Object): void {
  const createSelectorParams = targetToCreateSelectorParamsMap.get(target)!;
  const def = getDef(target.constructor);
  const factory = getFactory(target.constructor);

  // `factory` is a readonly property, but still overridable.
  (def as { factory: () => InstanceWithSubscriptions }).factory = () => {
    const instance = factory();
    const store = ɵɵdirectiveInject(Store);
    const ref = ɵɵdirectiveInject(ChangeDetectorRef);
    for (const { name, paths, selectorOrFeature } of createSelectorParams) {
      const properties = defineSelectSnapshotProperties(
        selectorOrFeature,
        paths,
        target,
        name,
        store,
      );
      const selector = getSelectorFromInstance(
        instance,
        properties.selectorFnName,
        properties.createSelector,
        properties.selectorOrFeature,
      );
      const subscription = store.select(selector).subscribe(() => ref.markForCheck());
      const subscriptions = getSubscriptionsOnTheInstance(instance);
      subscriptions.push(subscription);
    }
    return instance;
  };

  overrideNgOnDestroy(target);

  targetToScheduledMicrotaskMap.delete(target);
  targetToCreateSelectorParamsMap.delete(target);
}

function overrideNgOnDestroy(target: Object): void {
  // Angular 10.0.5+ doesn't store `ngOnDestroy` hook on the component definition anymore and
  // allows to override lifecycle hooks through prototypes.
  // Previously, it was stored on the `type[NG_CMP_DEF].onDestroy` property, unfortunately,
  // it's a breaking change that'll require to use Angular 10.0.5+.
  const ngOnDestroy = target.constructor.prototype.ngOnDestroy;

  // Since Angular 10.0.5+ it's possible to override the `ngOnDestroy` directly on the prototype.
  target.constructor.prototype.ngOnDestroy = function (this: InstanceWithSubscriptions) {
    // Invoke the original `ngOnDestroy`.
    ngOnDestroy && ngOnDestroy.call(this);

    const subscriptions = this[SUBSCRIPTIONS];

    if (Array.isArray(subscriptions)) {
      while (subscriptions.length) {
        subscriptions.pop()!.unsubscribe();
      }
    }
  };
}

function getFactory<T>(type: Function): () => InstanceWithSubscriptions {
  return (type as ɵDirectiveType<T>).ɵfac as () => InstanceWithSubscriptions;
}

function getDef<T>(type: Function): ɵComponentDef<T> | ɵDirectiveDef<T> {
  return (type as ɵComponentType<T>)[ɵNG_COMP_DEF] || (type as ɵDirectiveType<T>)[ɵNG_DIR_DEF];
}

function getSubscriptionsOnTheInstance(instance: InstanceWithSubscriptions): Subscription[] {
  return instance[SUBSCRIPTIONS] || (instance[SUBSCRIPTIONS] = []);
}

interface InstanceWithSubscriptions {
  [SUBSCRIPTIONS]?: Subscription[];
}
