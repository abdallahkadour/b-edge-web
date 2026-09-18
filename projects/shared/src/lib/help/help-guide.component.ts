import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import type { Guide, GuideSection, GuideTopic } from './model';

/** A section filtered down to the topics that matched a search. */
interface MatchedSection extends Omit<GuideSection, 'topics'> {
  readonly topics: readonly GuideTopic[];
}

/**
 * Renders a Guide: searchable, grouped into sections, one topic at a time.
 *
 * WHY TOPICS ARE COLLAPSED BY DEFAULT
 *
 * The artist guide runs to about twenty tasks. Rendered open, it is several
 * screens of numbered steps on a phone, and finding "how do I add a service"
 * means scrolling past everything else. Collapsed, the whole guide is a
 * scannable list of the things you might want to do, which is how someone
 * actually arrives at a help page - with a task, not a desire to read.
 *
 * Search widens rather than filters silently: a query with no matches says
 * so, instead of showing an empty page that looks broken.
 *
 * The **bold** markers in step text are rendered here rather than stored as
 * HTML, so guide content can never inject markup into the page.
 */
@Component({
  selector: 'bedge-help-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pb-10">
      <p class="text-sm text-gray-500 leading-relaxed mb-5 max-w-2xl">{{ guide().intro }}</p>

      <label class="relative block mb-6 max-w-md">
        <span class="sr-only">Search the guide</span>
        <input
          type="search"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          placeholder="Search — e.g. deposit, hours, promo code"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink
                 placeholder-gray-400 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink transition-colors focus:border-gray-400"
        />
      </label>

      @if (matches().length === 0) {
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center">
          <p class="text-sm font-medium text-ink">Nothing matched "{{ query() }}"</p>
          <p class="text-xs text-gray-500 mt-1">Try a shorter word, or clear the search to see everything.</p>
        </div>
      }

      @for (section of matches(); track section.id) {
        <section class="mb-8">
          <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400">{{ section.title }}</h2>
          <p class="text-xs text-gray-500 mt-1 mb-3">{{ section.blurb }}</p>

          <div class="rounded-lg border border-gray-200 bg-white overflow-hidden">
            @for (topic of section.topics; track topic.id; let last = $last) {
              <div [class]="last ? '' : 'border-b border-gray-100'">
                <button
                  type="button"
                  (click)="toggle(topic.id)"
                  [attr.aria-expanded]="isOpen(topic.id)"
                  [attr.aria-controls]="'topic-' + topic.id"
                  class="w-full flex items-start gap-3 text-left px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <span
                    class="mt-1 shrink-0 text-gray-400 transition-transform"
                    [class.rotate-90]="isOpen(topic.id)"
                    aria-hidden="true"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                  <span class="min-w-0">
                    <span class="block text-sm font-medium text-ink">{{ topic.title }}</span>
                    <span class="block text-xs text-gray-500 mt-0.5">{{ topic.summary }}</span>
                  </span>
                </button>

                @if (isOpen(topic.id)) {
                  <div [id]="'topic-' + topic.id" class="px-4 pb-4 pl-[2.4rem]">
                    <ol class="list-decimal ms-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                      @for (step of topic.steps; track $index) {
                        <li>
                          @for (part of segments(step); track $index) {
                            @if (part.strong) {
                              <span class="font-semibold text-ink">{{ part.text }}</span>
                            } @else {
                              <span>{{ part.text }}</span>
                            }
                          }
                        </li>
                      }
                    </ol>

                    @if (topic.notes?.length) {
                      <ul class="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                        @for (note of topic.notes; track $index) {
                          <li class="flex gap-2 text-xs text-gray-500 leading-relaxed">
                            <span class="text-gray-300 shrink-0" aria-hidden="true">—</span>
                            <span>
                              @for (part of segments(note); track $index) {
                                @if (part.strong) {
                                  <span class="font-semibold text-gray-600">{{ part.text }}</span>
                                } @else {
                                  <span>{{ part.text }}</span>
                                }
                              }
                            </span>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class HelpGuideComponent {
  readonly guide = input.required<Guide>();

  protected readonly query = signal('');
  private readonly openIds = signal<ReadonlySet<string>>(new Set());

  protected isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  protected toggle(id: string): void {
    this.openIds.update((open) => {
      const next = new Set(open);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /**
   * Sections with at least one matching topic.
   *
   * Matching looks at the steps and notes too, not just the title - someone
   * searching "Whish" is looking for the deposit topic, whose title does not
   * contain the word.
   */
  protected readonly matches = computed<readonly MatchedSection[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.guide().sections;

    return this.guide()
      .sections.map((section) => ({
        ...section,
        topics: section.topics.filter((t) =>
          [t.title, t.summary, ...t.steps, ...(t.notes ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(q),
        ),
      }))
      .filter((section) => section.topics.length > 0);
  });

  /**
   * Splits "choose **Save service**" into plain and bold runs.
   *
   * Deliberately not innerHTML with a regex-to-<strong> replacement: guide
   * text would then be a path for markup into the page, and the fact that it
   * is currently all written by us is not a property worth depending on.
   */
  protected segments(text: string): readonly { text: string; strong: boolean }[] {
    return text
      .split(/\*\*/)
      .map((part, i) => ({ text: part, strong: i % 2 === 1 }))
      .filter((p) => p.text !== '');
  }
}
