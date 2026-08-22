import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';

import { ButtonComponent } from './button.component';

/** OpenFreeMap's free, no-API-key vector tile style. Commercial use is
 *  explicitly allowed (openfreemap.org: "Is commercial usage allowed? Yes.") -
 *  attribution is the only condition, handled by MapLibre's built-in
 *  attribution control, on by default. */
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Beirut - the default center when no location is known yet. Zoomed out
 *  enough to be useful anywhere in Lebanon, not just Beirut itself. */
const DEFAULT_CENTER: [number, number] = [35.5018, 33.8938];
const DEFAULT_ZOOM = 12;
const PIN_ZOOM = 15;

/**
 * Pin-drop location picker/viewer, backed by MapLibre GL JS + OpenFreeMap.
 *
 * Added here rather than kept single-purpose because both apps need it for
 * the same underlying reason: Lebanese addresses don't reliably resolve
 * from typed text (informal, landmark-based addressing is the norm), so a
 * pin on a map is the location itself, not a hint parsed into one. Used in
 * two shapes from one component to avoid duplicating the MapLibre
 * lifecycle/cleanup logic twice:
 *
 * - mode="pick": customer-pwa checkout. Map pans; a pin stays fixed at the
 *   viewport center (the same interaction Careem/Toters use). Confirming
 *   reads the map's current center as the chosen coordinates - there is no
 *   draggable marker to mis-drop.
 * - mode="view": artist-dashboard order view. A real marker at fixed
 *   coordinates, plus a "Get directions" link that opens the courier's own
 *   maps app - a plain URL, no API key, works whether they have Google
 *   Maps, Apple Maps, or Waze set as default.
 *
 * MapLibre itself (~1MB, a WebGL rendering engine) is loaded via a dynamic
 * `import()` inside ngAfterViewInit, NOT a static top-level import. A
 * static import here pulled the whole library into every page's EAGER
 * bundle - not just the checkout/order-detail routes that actually render
 * a map - because ng-packagr bundles a library's entry point into one FESM
 * file, and something elsewhere in @bedge/shared is already loaded eagerly
 * (interceptors, guards in app.config.ts). The dynamic import is what
 * actually gives the bundler a real code-split point; only the type import
 * above stays static, which is erased at compile time and costs nothing.
 *
 * CONSUMER REQUIREMENT: every app using this component must import
 * `maplibre-gl/dist/maplibre-gl.css` in its own global styles.scss (see
 * customer-pwa's and artist-dashboard's). A side-effect CSS import here,
 * inside the shared library, does NOT reach a consuming app's build -
 * ng-packagr doesn't carry it forward the way an application-level style
 * import is handled - so this component's own controls (attribution,
 * nav buttons, markers) silently render unstyled/unpositioned without it.
 * Found as a real bug: the attribution control (required for OpenFreeMap's
 * free usage terms) fell back to `position: static` and got clipped by
 * this host's own overflow-hidden container.
 */
@Component({
  selector: 'bedge-location-map',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100" [style.height]="height()">
      <div #mapContainer class="absolute inset-0"></div>

      @if (mode() === 'pick') {
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 drop-shadow-lg">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#0a0a0a" stroke="white" stroke-width="1">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </div>
      }
    </div>

    @if (mode() === 'pick') {
      <bedge-button [fullWidth]="true" class="mt-3" (click)="confirm()">
        {{ confirmLabel() }}
      </bedge-button>
    } @else if (lat() !== undefined && lng() !== undefined) {
      <a
        [href]="directionsUrl()"
        target="_blank"
        rel="noopener"
        class="mt-3 flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 text-sm font-semibold text-ink hover:bg-gray-50 transition-colors"
      >
        Get directions
      </a>
    }
  `,
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private map?: MapLibreMap;
  private marker?: Marker;

  readonly mode = input<'pick' | 'view'>('pick');
  /** Known location - required for mode="view", used only as the initial
   *  center (if given) for mode="pick". */
  readonly lat = input<number | undefined>(undefined);
  readonly lng = input<number | undefined>(undefined);
  readonly height = input('280px');
  readonly confirmLabel = input('Confirm this location');

  readonly locationConfirmed = output<{ lat: number; lng: number }>();

  protected readonly directionsUrl = computed(() => {
    const lat = this.lat();
    const lng = this.lng();
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  });

  async ngAfterViewInit(): Promise<void> {
    // The CSS import above stays static and costs little (tens of KB, not
    // MapLibre's ~1MB of JS) - Angular extracts stylesheet imports into
    // their own CSS chunk regardless, so it never bloats a JS bundle the
    // way a static JS import of the library did.
    const {
      Map: MapLibreMapCtor,
      Marker: MarkerCtor,
      NavigationControl,
      setWorkerUrl,
    } = await import('maplibre-gl');
    // MapLibre's own worker-URL auto-detection doesn't resolve correctly
    // through Angular's build pipeline (esbuild for `ng build`, Vite for
    // `ng serve` - neither is the plain bundler MapLibre expects), so the
    // worker script silently never loads: the style/sprites/background
    // fetch and render fine (main-thread work), but actual vector tile
    // parsing (the worker's job) never happens, leaving a flat background
    // color with no roads/land/labels drawn. The fix used here is
    // MapLibre's own documented escape hatch for exactly this case: serve
    // the worker as a plain static file (copied into public/maplibre/ by
    // hand, matching dist/maplibre-gl-worker.mjs + its sibling
    // maplibre-gl-shared.mjs it imports) and point setWorkerUrl at it, so
    // nothing about loading it goes through bundler-specific module
    // resolution at all.
    //
    // Verified against a real `ng build` production bundle (streets,
    // coastline, and Beirut neighbourhood labels all render correctly) -
    // that's what ships to users. `ng serve`'s Vite dev server is a known
    // remaining gap: identical network requests all succeed (worker file,
    // style, tiles, fonts - all 200, no console errors), yet the canvas
    // stays a flat background color under `ng serve` specifically. Not
    // chased further since it doesn't affect the shipped app - if this
    // component needs visual iteration, verify against `ng build` output
    // (see CLAUDE-v6.md) rather than trusting `ng serve` for this one
    // component.
    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

    const known = this.lat() !== undefined && this.lng() !== undefined;
    const center: [number, number] = known ? [this.lng()!, this.lat()!] : DEFAULT_CENTER;

    this.map = new MapLibreMapCtor({
      container: this.mapContainer().nativeElement,
      style: MAP_STYLE_URL,
      center,
      zoom: known ? PIN_ZOOM : DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });
    this.map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    // Defensive: MapLibre measures its container at construction time,
    // which can be before this host's own [style.height] binding and
    // surrounding layout have necessarily settled. A resize() once the
    // map reports itself loaded forces a recompute against the
    // container's real, final dimensions. (The actual cause of the
    // missing/misplaced attribution control turned out to be a separate,
    // bigger bug - see the class doc comment above: maplibre-gl.css
    // wasn't being loaded by consuming apps at all. Keeping this resize()
    // anyway since it's cheap and a real, if secondary, correctness
    // safeguard against container-size timing.)
    this.map.once('load', () => this.map?.resize());

    if (this.mode() === 'view' && known) {
      this.marker = new MarkerCtor({ color: '#0a0a0a' }).setLngLat(center).addTo(this.map);
      return;
    }

    if (this.mode() === 'pick' && !known) {
      // Best-effort - a denied/unavailable geolocation just leaves the map
      // centered on Beirut, which is still a reasonable starting point
      // anywhere in Lebanon. Never blocks or errors the picker.
      navigator.geolocation?.getCurrentPosition(
        (pos) => this.map?.jumpTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: PIN_ZOOM }),
        () => {},
        { timeout: 4000 },
      );
    }
  }

  ngOnDestroy(): void {
    this.marker?.remove();
    this.map?.remove();
  }

  /** Reads the map's current center - the pin the customer sees fixed on
   *  screen never moves, the map moves under it, so the center IS the
   *  chosen point. */
  confirm(): void {
    const center = this.map?.getCenter();
    if (!center) return;
    this.locationConfirmed.emit({ lat: center.lat, lng: center.lng });
  }
}
