import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { ThemeStore } from './theme.store';

/**
 * A controllable prefers-color-scheme, because the real one is whatever the
 * machine running the suite happens to be set to - which would make the
 * `system` tests pass or fail depending on the developer's laptop.
 */
function stubMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mq = {
    matches: prefersDark,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb);
    },
    removeEventListener: () => {},
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mq),
  );
  return {
    /** Simulate the OS flipping while the app is open. */
    flip(matches: boolean) {
      mq.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
}

function make(): ThemeStore {
  TestBed.resetTestingModule();
  return TestBed.inject(ThemeStore);
}

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to following the system and leaves the root unstamped', () => {
    stubMatchMedia(false);
    const store = make();

    expect(store.preference()).toBe('system');
    // The absence of the attribute is the whole mechanism for OS following -
    // the stylesheet's media query only gets a say when nothing is stamped.
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('resolves to dark under system when the OS prefers dark', () => {
    stubMatchMedia(true);
    const store = make();

    expect(store.preference()).toBe('system');
    expect(store.resolved()).toBe('dark');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('tracks the OS changing while the app is open', () => {
    const mq = stubMatchMedia(false);
    const store = make();
    expect(store.resolved()).toBe('light');

    mq.flip(true);
    expect(store.resolved()).toBe('dark');
  });

  it('stops tracking the OS once an explicit choice is made', () => {
    const mq = stubMatchMedia(false);
    const store = make();

    store.set('light');
    mq.flip(true);

    // The point of the three-state model: an explicit light must survive the
    // OS going dark, which is what a two-state toggle gets wrong.
    expect(store.resolved()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('stamps the root and persists the choice', () => {
    stubMatchMedia(false);
    const store = make();

    store.set('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    // Same key the pre-boot script in index.html reads.
    expect(localStorage.getItem('bedge_theme')).toBe('dark');
  });

  it('restores a saved choice on construction', () => {
    localStorage.setItem('bedge_theme', 'dark');
    stubMatchMedia(false);
    const store = make();

    expect(store.preference()).toBe('dark');
    expect(store.resolved()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('going back to system removes the stamp rather than pinning light', () => {
    localStorage.setItem('bedge_theme', 'dark');
    const mq = stubMatchMedia(false);
    const store = make();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    store.set('system');

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    mq.flip(true);
    expect(store.resolved()).toBe('dark');
  });

  it('falls back to system for a corrupt stored value', () => {
    localStorage.setItem('bedge_theme', 'sepia');
    stubMatchMedia(true);
    const store = make();

    expect(store.preference()).toBe('system');
    expect(store.resolved()).toBe('dark');
  });

  it('cycles light -> dark -> system -> light', () => {
    stubMatchMedia(false);
    const store = make();

    store.set('light');
    store.cycle();
    expect(store.preference()).toBe('dark');
    store.cycle();
    expect(store.preference()).toBe('system');
    store.cycle();
    expect(store.preference()).toBe('light');
  });

  it('still applies the theme when localStorage refuses to write', () => {
    stubMatchMedia(false);
    const store = make();
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    // Private browsing throws here. The user asked for dark either way, and
    // failing to remember it must not mean failing to do it.
    expect(() => store.set('dark')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    setItem.mockRestore();
  });

  it('survives an environment with no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(() => make()).not.toThrow();
    expect(make().resolved()).toBe('light');
  });
});
