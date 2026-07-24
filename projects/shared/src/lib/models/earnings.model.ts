/**
 * Earnings domain models. Mirror the Go earnings response structs.
 * Money fields are strings — decimal.Decimal serializes to quoted JSON strings.
 */

/** A single day in the 7-day daily breakdown. */
export interface DailyEarnings {
  readonly day: string;     // ISO 8601 UTC
  readonly revenue: string; // decimal as string
}

/** Revenue for a single service in the period. */
export interface ServiceEarnings {
  readonly service_id: string;
  readonly service_name: string;
  readonly bookings_count: number;
  readonly revenue: string; // decimal as string
}

/** Stats for a single time window (today / this week / this month). */
export interface PeriodStats {
  readonly revenue: string;        // decimal as string
  readonly bookings_count: number;
}

/** The date range that was queried. */
export interface EarningsPeriod {
  readonly from: string; // ISO 8601
  readonly to: string;   // ISO 8601
}

/** Full response from GET /earnings/summary (Go earnings.EarningsSummaryResponse). */
export interface EarningsSummary {
  readonly period: EarningsPeriod;
  readonly this_month: PeriodStats;
  readonly today: PeriodStats;
  readonly this_week: PeriodStats;
  readonly total_revenue: string;        // decimal as string
  readonly total_bookings: number;
  readonly total_deposits: string;       // decimal as string
  readonly average_booking_value: string; // decimal as string
  readonly daily_breakdown: DailyEarnings[];
  readonly by_service: ServiceEarnings[];
}
