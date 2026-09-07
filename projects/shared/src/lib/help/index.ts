/**
 * The in-app guide RENDERER and its data shape.
 *
 * The guide CONTENT deliberately does not live here. It sits in each
 * application's own lazy-loaded help feature, because a barrel export from
 * this library lands in the shared initial chunk: putting the text here cost
 * both apps several kilobytes on every page load to carry a screen almost
 * nobody opens. Measured, not assumed - the artist dashboard's initial
 * bundle grew 21.8 kB before the content was moved out.
 */
export * from './model';
export * from './help-guide.component';
