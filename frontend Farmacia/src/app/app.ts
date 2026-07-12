import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './shared/notification/toast-container/toast-container';
import { ConfirmDialog } from './shared/notification/confirm-dialog/confirm-dialog';
import { ApiSimConsole } from './shared/api-sim-console/api-sim-console';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, ConfirmDialog, ApiSimConsole],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-confirm-dialog></app-confirm-dialog>
    <app-api-sim-console></app-api-sim-console>
  `,
})
export class App {
  title = 'frontend';
}
