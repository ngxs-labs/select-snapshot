import { NgModule, ModuleWithProviders, NgModuleRef } from '@angular/core';

import { setInjector, clearInjector } from './core/internals/static-injector';

@NgModule()
export class NgxsSelectSnapshotModule {
  constructor(ngModuleRef: NgModuleRef<any>) {
    setInjector(ngModuleRef.injector);
    ngModuleRef.onDestroy(clearInjector);
  }

  static forRoot(): ModuleWithProviders<NgxsSelectSnapshotModule> {
    return {
      ngModule: NgxsSelectSnapshotModule,
    };
  }
}
