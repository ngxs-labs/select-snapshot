import { StaticInjector } from '../internals/static-injector';
import { META_KEY, getPropsArray, propGetter, removeDollarAtTheEnd } from '../internals/internals';

export function SelectSnapshot(selectorOrFeature?: any, ...paths: string[]) {
  return (target: any, name: string) => {
    const selectorFnName = `__${name}__selector`;

    if (!selectorOrFeature) {
      selectorOrFeature = removeDollarAtTheEnd(name);
    }

    const createSelector = (selectorOrFeature: any) => {
      const config = StaticInjector.getConfig();

      if (typeof selectorOrFeature === 'string') {
        const propsArray = getPropsArray(selectorOrFeature, paths);
        return propGetter(propsArray, config);
      } else if (selectorOrFeature[META_KEY] && selectorOrFeature[META_KEY].path) {
        return propGetter(selectorOrFeature[META_KEY].path.split('.'), config);
      } else {
        return selectorOrFeature;
      }
    };

    if (delete target[name]) {
      Object.defineProperty(target, selectorFnName, {
        writable: true,
        enumerable: false,
        configurable: true
      });

      Object.defineProperty(target, name, {
        get: function() {
          // Create anonymous function that will map to the needed state only once
          const selector =
            this[selectorFnName] || (this[selectorFnName] = createSelector(selectorOrFeature));
          const store = StaticInjector.getStore();
          return store.selectSnapshot(selector);
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
