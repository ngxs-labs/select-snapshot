import { Injector, Injectable } from '@angular/core';
import { Store, ɵm as NgxsConfig } from '@ngxs/store';

class NgxsSelectSnapshotModuleIsNotImported extends Error {
  constructor() {
    super(`You've forgotten to import "NgxsSelectSnapshotModule"!`);
  }
}

@Injectable()
export class StaticInjector {
  private static injector: Injector | null = null;

  constructor(injector: Injector) {
    StaticInjector.injector = injector;
  }

  public static getStore(): never | Store {
    if (this.injector === null) {
      throw new NgxsSelectSnapshotModuleIsNotImported();
    }

    return this.injector.get<Store>(Store);
  }

  public static getConfig(): never | NgxsConfig {
    if (this.injector === null) {
      throw new NgxsSelectSnapshotModuleIsNotImported();
    }

    return this.injector.get<NgxsConfig>(NgxsConfig);
  }
}
