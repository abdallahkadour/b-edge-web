import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The one primary button.
 *
 * Before this existed there were 32 hand-written copies of essentially
 * this button across the two apps, and they had already drifted: some
 * `rounded`, some `rounded-lg`; three different heights for the same
 * "full width primary" role; `disabled:opacity-40` in one place and
 * `disabled:opacity-60` in another; `transition-all` versus
 * `transition-opacity`. None of that was a decision - it was copy-paste
 * entropy, and it is exactly what a customer reads as "slightly cheap"
 * without being able to say why.
 *
 * Note what this does NOT do: it does not invent new design values. Every
 * class below already exists in tailwind.config.js, which has a genuinely
 * good token layer (ink, the gray scale, semantic success/danger). This
 * component's job is to stop those tokens being recombined differently on
 * every screen.
 *
 * Deliberately a component and not a directive: the loading spinner and
 * the disabled-while-loading behaviour need real markup and logic, not
 * just a class string.
 */
@Component({
  selector: 'bedge-button',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A custom element is display:inline by default, which silently breaks
  // w-full, flex-1 and margins applied to the host. Match the inner
  // button so layout classes behave as they read.
  host: { '[class]': "fullWidth() ? 'block' : 'inline-block'" },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
    >
      @if (loading()) {
        <lucide-icon name="loader-2" [size]="iconSize()" [strokeWidth]="2" class="animate-spin" />
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  protected readonly iconSize = computed(() =>
    this.size() === 'sm' ? 13 : this.size() === 'lg' ? 16 : 15,
  );

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 font-bold rounded-lg ' +
      'transition-opacity disabled:opacity-40 disabled:cursor-not-allowed';

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-5 text-[13px] uppercase tracking-wide',
      lg: 'h-[52px] px-6 text-sm uppercase tracking-wide',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-ink text-white hover:opacity-90',
      secondary: 'bg-white text-ink border border-ink hover:bg-gray-50',
      ghost: 'bg-white text-ink border border-gray-200 hover:bg-gray-50',
      danger: 'bg-white text-danger-dark border border-danger-light hover:bg-red-50',
    };

    return [
      base,
      sizes[this.size()],
      variants[this.variant()],
      this.fullWidth() ? 'w-full' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}
