import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { StaticInjectorAccessor } from './core/internals/static-injector-accessor';

@NgModule()
export class NgxsSelectSnapshotModule {
  constructor(@Self() private staticInjectorAccessor: StaticInjectorAccessor) {}

  public static forRoot(): ModuleWithProviders<NgxsSelectSnapshotModule> {
    return {
      ngModule: NgxsSelectSnapshotModule,
      providers: [StaticInjectorAccessor]
    };
  }
}
