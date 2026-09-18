/** What kind of problem is being raised. These mirror the API's own list. */
export type ReportCategory =
  | 'wrong_payment_details'
  | 'payment_not_received'
  | 'deposit_not_returned'
  | 'did_not_attend'
  | 'impersonation'
  | 'inappropriate_behaviour'
  | 'other';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

/** One selectable reason, as the API renders it. */
export interface ReportCategoryOption {
  readonly id: ReportCategory;
  readonly label: string;
}

/** A report as the person who raised it sees it. */
export interface Report {
  readonly id: string;
  readonly category: ReportCategory;
  readonly category_label: string;
  readonly description: string;
  readonly status: ReportStatus;
  readonly booking_id?: string;
  readonly created_at: string;
}

/** A report in the admin queue, with who raised it and about whom. */
export interface AdminReport extends Report {
  readonly reporter_name: string;
  readonly reporter_role: string;
  readonly reporter_phone?: string;
  readonly artist_name?: string;
  readonly resolution_note?: string;
}

export interface CreateReportRequest {
  readonly booking_id?: string;
  readonly artist_id?: string;
  readonly category: ReportCategory;
  readonly description: string;
}
