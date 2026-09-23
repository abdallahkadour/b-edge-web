import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import {
  ArtistDataService,
  ButtonComponent,
  InputDirective,
  extractApiErrorMessage,
} from '@bedge/shared';

/**
 * Prove the phone number on your account is yours.
 *
 * WHY THIS SCREEN EXISTS AT ALL
 *
 * It is not a profile nicety. A salon may only invite an artist whose number
 * is verified, so an unverified artist cannot be hired onto a team — they
 * simply do not appear as invitable, and the owner is told the number is not
 * verified rather than anything they can act on. This is the difference
 * between being hireable and not, and the copy says so instead of asking for
 * a number and hoping the user infers why.
 *
 * THE NUMBER IS NOT EDITABLE HERE
 *
 * Deliberately. The server reads it from the account and ignores anything a
 * request supplies — otherwise an artist could verify somebody else's phone
 * onto their own profile, which is precisely what verification is meant to
 * establish. Offering an editable field here would imply a capability the API
 * does not grant, and the user would only discover that after typing.
 *
 * WHAT THE STATES ARE
 *
 *   verified   done, nothing to do, a quiet confirmation
 *   idle       has a number, has not sent a code
 *   sent       a code is out; enter it, or resend after the cooldown
 *
 * The cooldown is client-side only and deliberately shorter than the server's
 * real limit (3 per 5 minutes). It exists to stop double-taps, not to enforce
 * anything — the server owns the rule, and re-implementing that here would
 * give two limits that drift.
 */
@Component({
  selector: 'bedge-phone-verification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, InputDirective, LucideAngularModule],
  templateUrl: './phone-verification.component.html',
})
export class PhoneVerificationComponent implements OnDestroy {
  private readonly artists = inject(ArtistDataService);

  /** The number on the account. Display only — never sent back. */
  readonly phone = input<string | undefined>(undefined);

  /** ISO timestamp, or undefined if never verified. */
  readonly verifiedAt = input<string | undefined>(undefined);

  /** Emitted once on success so the parent can refresh the profile. */
  readonly verified = output<void>();

  protected readonly code = signal('');
  protected readonly sending = signal(false);
  protected readonly checking = signal(false);
  protected readonly codeSent = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  /** Seconds until the resend button re-enables. */
  protected readonly cooldown = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly isVerified = computed(() => !!this.verifiedAt());
  protected readonly hasPhone = computed(() => !!this.phone());

  /**
   * Six digits. Matches the server's `len=6,numeric` exactly rather than
   * being loose, because unlike a phone number there is no formatting
   * ambiguity to be generous about — a code is six digits or it is not a code.
   */
  protected readonly codeValid = computed(() => /^\d{6}$/.test(this.code()));

  ngOnDestroy(): void {
    this.stopTimer();
  }

  protected requestCode(): void {
    if (this.sending() || this.cooldown() > 0) return;

    this.sending.set(true);
    this.error.set(null);
    this.notice.set(null);

    this.artists.requestPhoneOtp().subscribe({
      next: (res) => {
        this.sending.set(false);
        this.codeSent.set(true);
        this.notice.set(res.message ?? 'Code sent');
        this.startCooldown(60);
      },
      error: (err: HttpErrorResponse) => {
        this.sending.set(false);
        this.error.set(extractApiErrorMessage(err, 'Could not send the code. Try again.'));
      },
    });
  }

  protected submitCode(): void {
    if (this.checking() || !this.codeValid()) return;

    this.checking.set(true);
    this.error.set(null);
    this.notice.set(null);

    this.artists.verifyPhone(this.code()).subscribe({
      next: () => {
        this.checking.set(false);
        this.code.set('');
        this.stopTimer();
        // The parent owns the profile; re-reading it there keeps one source
        // of truth rather than this component asserting a state it inferred.
        this.verified.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.checking.set(false);
        this.error.set(extractApiErrorMessage(err, 'That code did not work.'));
      },
    });
  }

  /** Accepts a paste of "123 456" or "123-456" without scolding the user. */
  protected onCodeInput(raw: string): void {
    this.code.set(raw.replace(/\D/g, '').slice(0, 6));
  }

  private startCooldown(seconds: number): void {
    this.stopTimer();
    this.cooldown.set(seconds);
    this.timer = setInterval(() => {
      const next = this.cooldown() - 1;
      this.cooldown.set(next);
      if (next <= 0) this.stopTimer();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.cooldown.set(0);
  }
}
