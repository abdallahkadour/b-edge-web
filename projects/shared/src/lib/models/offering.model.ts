/**
 * One row of an artist's services screen - the salon menu with her switch,
 * her price and deposit (null = the salon's), and what a customer will pay.
 * Mirrors internal/offering.Offering.
 */
export interface ServiceOffering {
  readonly service_id: string;
  readonly service_name: string;
  readonly duration_min: number;
  readonly offered: boolean;
  readonly salon_price: string;
  readonly salon_deposit: string;
  readonly own_price: string | null;
  readonly own_deposit: string | null;
  readonly effective_price: string;
  readonly effective_deposit: string;
  /** True when the deposit was lowered to the price. Shown, never silent. */
  readonly deposit_capped: boolean;
  readonly updated_by_name?: string;
}

/**
 * PUT body. Omit a field to leave it alone; send null to go back to the
 * salon's value; send a string to set it.
 */
export interface UpdateOfferingRequest {
  offered: boolean;
  price?: string | null;
  deposit_amount?: string | null;
}
