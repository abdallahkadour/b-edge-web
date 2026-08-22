import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RateLimitBannerComponent } from '@bedge/shared';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RateLimitBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('artist-dashboard');
}
