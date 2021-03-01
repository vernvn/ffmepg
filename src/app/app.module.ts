import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app.component';
import { InfoService } from './app.service'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DynamicDragDirective } from './app.directive'
@NgModule({
  declarations: [
    AppComponent,
    DynamicDragDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: true })
  ],
  providers: [ InfoService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
