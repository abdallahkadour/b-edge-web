import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ServiceOfferingsComponent } from './service-offerings.component';

@Component({
  selector: 'bedge-my-services-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServiceOfferingsComponent],
  template: `
    <h1 class="text-lg font-bold text-ink mb-1">My services</h1>
    <p class="text-sm text-gray-500 mb-4">Switch on what you do. Leave a price blank to use the salon's.</p>
    <bedge-service-offerings />
  `,
})
export class MyServicesPage {}
