/** How money actually moves in Lebanon. */
export type PaymentMethodKind = 'whish' | 'omt';

/** A payment destination as the owning artist manages it. */
export interface SalonPaymentMethod {
  readonly id: string;
  readonly method: PaymentMethodKind;
  /** "Whish" / "OMT" - rendered, never derived in a template. */
  readonly method_label: string;
  readonly account_name: string;
  readonly account_ref: string;
  readonly is_active: boolean;
}

/**
 * A payment destination as a paying client sees it.
 *
 * No id and no active flag: the client is shown only what they need in order
 * to make the transfer correctly, and the public endpoint returns active
 * destinations only.
 */
export interface PublicPaymentMethod {
  readonly method: PaymentMethodKind;
  readonly method_label: string;
  /** The name the transfer will be made out to. The client should check this
   *  against what their banking app shows before confirming. */
  readonly account_name: string;
  readonly account_ref: string;
}

export interface UpsertPaymentMethodRequest {
  readonly method: PaymentMethodKind;
  readonly account_name: string;
  readonly account_ref: string;
}
