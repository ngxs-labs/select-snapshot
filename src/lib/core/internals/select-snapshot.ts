import { Type } from '@angular/core';
import { Store } from '@ngxs/store';

import { getStore } from './static-injector';
import { removeDollarAtTheEnd, getPropsArray, compliantPropGetter, META_KEY } from './internals';

type CreateSelectorFactory = (selectorOrFeature: any) => any;

function createSelectorFactory(paths: string[]): CreateSelectorFactory {
  return (selectorOrFeature: any) => {
    if (typeof selectorOrFeature === 'string') {
      const propsArray = getPropsArray(selectorOrFeature, paths);
      return compliantPropGetter(propsArray);
    } else if (selectorOrFeature[META_KEY] && selectorOrFeature[META_KEY].path) {
      return compliantPropGetter(selectorOrFeature[META_KEY].path.split('.'));
    }

    return selectorOrFeature;
  };
}

export function getSelectorFromInstance(
  instance: any,
  selectorFnName: string,
  createSelector: CreateSelectorFactory,
  selectorOrFeature: any,
) {
  return instance[selectorFnName] || (instance[selectorFnName] = createSelector(selectorOrFeature));
}

export function defineSelectSnapshotProperties(
  selectorOrFeature: any,
  paths: string[],
  target: Object,
  name: string | symbol,
  store?: Store,
) {
  const selectorFnName = `__${name.toString()}__selector`;
  const createSelector = createSelectorFactory(paths);

  Object.defineProperties(target, {
    [selectorFnName]: {
      writable: true,
      enumerable: false,
      configurable: true,
    },
    [name]: {
      get() {
        const selector = getSelectorFromInstance(
          this,
          selectorFnName,
          createSelector,
          selectorOrFeature,
        );
        // Don't use the `directiveInject` here as it works ONLY
        // during view creation.
        store = store || getStore();
        return store.selectSnapshot(selector);
      },
      enumerable: true,
      configurable: true,
    },
  });

  return {
    selectorFnName,
    createSelector,
    selectorOrFeature: selectorOrFeature || removeDollarAtTheEnd(name),
  };
}
