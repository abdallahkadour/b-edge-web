/**
 * Test-environment shims for customer-pwa.
 *
 * Vitest runs components in jsdom, which implements most of the DOM but not
 * `window.matchMedia`. `InstallPromptComponent` calls it in its constructor to
 * work out whether the PWA is already installed, so simply creating the app
 * component threw `window.matchMedia is not a function` and BOTH tests in
 * app.spec.ts failed - including "should create the app", which looked like an
 * app fault rather than a missing browser API.
 *
 * Shimmed here rather than guarded in the component: matchMedia exists in
 * every browser capable of running this PWA, so a `typeof` check in production
 * would be dead code carried solely for the test harness.
 *
 * The stub reports "not standalone", which is the honest default for a test:
 * an installed PWA is the special case, not the baseline.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined, // deprecated, still referenced by some libs
        removeListener: () => undefined, // deprecated
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}
