import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { StaticInjector } from './core/internals/static-injector';

@NgModule()
export class NgxsSelectSnapshotModule {
  constructor(@Self() private staticInjector: StaticInjector) {}

  public static forRoot(): ModuleWithProviders<NgxsSelectSnapshotModule> {
    return {
      ngModule: NgxsSelectSnapshotModule,
      providers: [StaticInjector]
    };
  }
}
