import { Injector, Injectable } from '@angular/core';
import { Store, ɵm as NgxsConfig } from '@ngxs/store';

class NgxsSelectSnapshotModuleIsNotImported extends Error {
  constructor() {
    super(`You've forgotten to import "NgxsSelectSnapshotModule"!`)
  }
}

@Injectable()
export class StaticInjectorAccessor {
  private static injector: Injector | null = null;

  constructor(injector: Injector) {
    StaticInjectorAccessor.injector = injector;
  }

  /**
   * The `StaticInjectorAccessor` service can be treated as a `Service Locator`,
   * at some points service locator is an anti-pattern that breaks SOLID principles,
   * thus we should restrict access to dependencies and provide public interface for
   * only necessary dependencies as `Store` and `NgxsConfig`
   */
  public static getStore(): never | Store {
    if (this.injector === null) {
      throw new NgxsSelectSnapshotModuleIsNotImported();
    }

    return this.injector.get(Store);
  }

  public static getConfig(): never | NgxsConfig {
    if (this.injector === null)  {
      throw new NgxsSelectSnapshotModuleIsNotImported();
    }

    return this.injector.get(NgxsConfig);
  }
}
