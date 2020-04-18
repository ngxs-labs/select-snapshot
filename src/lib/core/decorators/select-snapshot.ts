import { getStore } from '../internals/static-injector';
import {
  META_KEY,
  getPropsArray,
  compliantPropGetter,
  removeDollarAtTheEnd,
} from '../internals/internals';

export function SelectSnapshot(selectorOrFeature?: any, ...paths: string[]) {
  return (target: any, name: string) => {
    const selectorFnName = `__${name}__selector`;

    if (!selectorOrFeature) {
      selectorOrFeature = removeDollarAtTheEnd(name);
    }

    function createSelector(selectorOrFeature: any) {
      if (typeof selectorOrFeature === 'string') {
        const propsArray = getPropsArray(selectorOrFeature, paths);
        return compliantPropGetter(propsArray);
      } else if (selectorOrFeature[META_KEY] && selectorOrFeature[META_KEY].path) {
        return compliantPropGetter(selectorOrFeature[META_KEY].path.split('.'));
      } else {
        return selectorOrFeature;
      }
    }

    if (delete target[name]) {
      Object.defineProperty(target, selectorFnName, {
        writable: true,
        enumerable: false,
        configurable: true,
      });

      Object.defineProperty(target, name, {
        get() {
          // Create anonymous function that will map to the needed state only once
          const selector =
            this[selectorFnName] || (this[selectorFnName] = createSelector(selectorOrFeature));
          const store = getStore();
          return store.selectSnapshot(selector);
        },
        enumerable: true,
        configurable: true,
      });
    }
  };
}
