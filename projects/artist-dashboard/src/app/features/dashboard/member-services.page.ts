import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServiceOfferingsComponent } from './service-offerings.component';

@Component({
  selector: 'bedge-member-services-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServiceOfferingsComponent, RouterLink],
  template: `
    <a routerLink="/dashboard/team" class="text-sm text-gray-500">← Team</a>
    <h1 class="text-lg font-bold text-ink mt-2 mb-1">Services &amp; prices</h1>
    <p class="text-sm text-gray-500 mb-4">Changes you make here are recorded as yours.</p>
    <bedge-service-offerings [memberArtistId]="artistId" />
  `,
})
export class MemberServicesPage {
  // Read once from the snapshot: the route is not reused across members.
  protected readonly artistId = inject(ActivatedRoute).snapshot.paramMap.get('artistId') ?? undefined;
}
