import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiSimConsole } from './shared/api-sim-console/api-sim-console';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ApiSimConsole],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
