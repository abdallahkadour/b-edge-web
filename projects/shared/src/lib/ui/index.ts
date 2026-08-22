/**
 * @bedge/shared UI primitives.
 *
 * Scope note: this is deliberately a small set, not a component library.
 * They were chosen by auditing what is actually duplicated in this
 * codebase today (32 buttons, status pills reimplemented in three
 * components, card shells with four different border shades), not by
 * copying a list from a design system blog post. Adding a component here
 * that nothing uses yet would be the same technical debt in the other
 * direction.
 *
 * LocationMapComponent is the one exception to "style-only primitive" -
 * it wraps real behaviour (MapLibre GL JS) rather than just Tailwind
 * classes, but it lives here rather than under core/ because both apps
 * need the exact same pin-drop/pin-view widget, not just similar-looking
 * markup - see its own doc comment for why.
 */
export * from './button.component';
export * from './badge.component';
export * from './card.component';
export * from './input.directive';
export * from './location-map.component';
