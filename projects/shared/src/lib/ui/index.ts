/**
 * @bedge/shared UI primitives.
 *
 * Scope note: this is deliberately four primitives, not a component
 * library. They were chosen by auditing what is actually duplicated in
 * this codebase today (32 buttons, status pills reimplemented in three
 * components, card shells with four different border shades), not by
 * copying a list from a design system blog post. Adding a component here
 * that nothing uses yet would be the same technical debt in the other
 * direction.
 */
export * from './button.component';
export * from './badge.component';
export * from './card.component';
export * from './input.directive';
