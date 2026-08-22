import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RateLimitBannerComponent } from '@bedge/shared';

import { InstallPromptComponent } from './shared/install-prompt.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InstallPromptComponent, RateLimitBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('customer-pwa');
}
