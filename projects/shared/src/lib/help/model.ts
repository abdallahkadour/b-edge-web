/**
 * The shape of an in-app user guide.
 *
 * WHY THE GUIDE IS DATA AND NOT MARKUP
 *
 * Three audiences (artist, customer, admin) need the same reading
 * experience - search, grouped sections, numbered steps - and two of them
 * live in different applications. Writing the guide as templates would mean
 * three copies of that experience drifting apart, which is the same problem
 * the shared UI primitives were created to solve.
 *
 * It also keeps the guide REVIEWABLE. Steps are strings in a list, so a diff
 * shows a wording change as a wording change rather than as a wall of moved
 * markup, and anyone can correct a label without touching Angular.
 */

/** One task a reader wants to accomplish, written as ordered steps. */
export interface GuideTopic {
  /** Stable slug. Used for the URL fragment, so it must not change casually
   *  once published - links to it may already exist. */
  readonly id: string;
  readonly title: string;
  /** One line answering "is this the thing I was looking for?", shown while
   *  the topic is collapsed. */
  readonly summary: string;
  /** Each entry is one action. Text in **bold** marks something the reader
   *  will see on screen - a button, a field, a menu item - and those strings
   *  are taken verbatim from the templates, not paraphrased. */
  readonly steps: readonly string[];
  /** Things that are true but are not a step: limits, consequences,
   *  what happens next, what cannot be undone. */
  readonly notes?: readonly string[];
}

/** A group of related topics. */
export interface GuideSection {
  readonly id: string;
  readonly title: string;
  readonly blurb: string;
  readonly topics: readonly GuideTopic[];
}

/** A complete guide for one audience. */
export interface Guide {
  readonly id: string;
  readonly title: string;
  /** Who this is for, in one sentence. */
  readonly intro: string;
  readonly sections: readonly GuideSection[];
}
