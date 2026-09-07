import { Injectable, computed, signal } from '@angular/core';

/**
 * What the user chose, which is NOT the same as which theme is showing.
 *
 * `system` is a real, distinct third state rather than a synonym for the
 * current OS value: it means "keep following the OS", so a phone that
 * switches to dark at sunset takes the app with it. Collapsing it to
 * whichever theme happened to be active at the time is the usual bug here,
 * and it makes the app stop tracking the OS forever after one visit to the
 * settings screen.
 */
export type ThemePreference = 'light' | 'dark' | 'system';

/** The two themes that can actually be on screen. */
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'bedge_theme';

function isPreference(v: unknown): v is ThemePreference {
  return v === 'light' || v === 'dark' || v === 'system';
}

/**
 * Owns the colour theme.
 *
 * HOW THE THEME ACTUALLY GETS APPLIED
 *
 * Not by this class directly restyling anything. The palette lives in CSS
 * custom properties (projects/shared/src/lib/styles/theme.css) which the
 * Tailwind config resolves every colour through, so the entire UI re-themes
 * from one attribute on <html>. All this store does is stamp - or remove -
 * that attribute.
 *
 * Removing it is load-bearing, not a tidy-up. `system` must leave the
 * element UNSTAMPED so the `prefers-color-scheme` media query in theme.css
 * is what decides. Stamping data-theme="light" for the system preference
 * would pin the app to light and silently break OS following.
 *
 * WHY THE MEDIA QUERY IS SUBSCRIBED RATHER THAN READ ONCE
 *
 * `resolved()` is used by the UI to show which theme is in effect. Under
 * `system` that answer changes without any user action - at sunset, or when
 * someone flips the OS switch with the app open - so a one-off read at
 * construction would go stale. The listener is attached once for the life
 * of the app and never removed, which is correct for a root-provided
 * singleton.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly _preference = signal<ThemePreference>('system');

  /** Tracks the OS setting, so `system` stays live rather than sampled. */
  private readonly _systemPrefersDark = signal(false);

  /** What the user picked: light, dark, or follow the OS. */
  readonly preference = this._preference.asReadonly();

  /** What is actually on screen right now. */
  readonly resolved = computed<ResolvedTheme>(() => {
    const p = this._preference();
    if (p !== 'system') return p;
    return this._systemPrefersDark() ? 'dark' : 'light';
  });

  constructor() {
    // Guarded rather than assumed: this library is also loaded by the unit
    // tests, where a DOM exists but matchMedia may not, and a throw in a
    // root-provided constructor takes the whole app down.
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this._preference.set(this.read());

    const mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    if (mq) {
      this._systemPrefersDark.set(mq.matches);
      // addEventListener, not the deprecated addListener - but Safari below
      // 14 only has the latter, and Lebanon has a long iOS tail.
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', (e) => this._systemPrefersDark.set(e.matches));
      } else if (typeof (mq as MediaQueryList).addListener === 'function') {
        (mq as MediaQueryList).addListener((e) => this._systemPrefersDark.set(e.matches));
      }
    }

    this.apply();
  }

  /** Record a choice and apply it. */
  set(preference: ThemePreference): void {
    this._preference.set(preference);

    // A failed write must not stop the theme changing - private mode and a
    // full quota both throw here, and the user asked for dark either way.
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* the theme still applies for this session */
    }

    this.apply();
  }

  /**
   * Cycle light -> dark -> system, for a single-button toggle.
   *
   * Three states, so a two-way switch cannot express it. Anything that
   * offers only light and dark should call `set` with an explicit value
   * instead of reaching for this.
   */
  cycle(): void {
    const next: Record<ThemePreference, ThemePreference> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    this.set(next[this._preference()]);
  }

  private read(): ThemePreference {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Anything unrecognised - a hand-edited value, or a key from an older
      // build - falls back to following the OS rather than guessing.
      return isPreference(raw) ? raw : 'system';
    } catch {
      return 'system';
    }
  }

  private apply(): void {
    const root = document.documentElement;
    if (this._preference() === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', this._preference());
    }
  }
}
