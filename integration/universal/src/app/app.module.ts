import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';

import { ProgressState } from './store';

import { AppComponent } from './app.component';
import { ProgressComponent } from './components/progress/progress.component';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'universal-select-snapshot' }),
    HttpClientModule,
    NgxsModule.forRoot([ProgressState]),
    NgxsSelectSnapshotModule.forRoot(),
  ],
  declarations: [AppComponent, ProgressComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
