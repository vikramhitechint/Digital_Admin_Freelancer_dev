// ─────────────────────────────────────────────
// Shared Platform Enums  (frontend + backend)
// ─────────────────────────────────────────────

// ── Company ──────────────────────────────────
export type CompanyStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'BANNED';

// ── Freelancer ────────────────────────────────
export type FreelancerStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'BANNED';

export type FreelancerAvailability = 'AVAILABLE' | 'BUSY' | 'INACTIVE';

// ── Admin Roles ───────────────────────────────
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'FINANCE_ADMIN';

// ── Project ───────────────────────────────────
export type ProjectStatus =
  | 'PENDING_ADMIN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNMENT_PENDING'
  | 'ASSIGNED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESS'
  | 'ONGOING'
  | 'COMPLETION_REQUESTED'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'DROP_REQUESTED'
  | 'DROPPED'
  | 'DISPUTED';

// ── Payment ───────────────────────────────────
export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentGateway = 'RAZORPAY' | 'CASHFREE';

// ── Payout ────────────────────────────────────
export type PayoutStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

// ── Drop Request ──────────────────────────────
export type DropRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED_TO_DISPUTE';

export type DropRequestInitiator = 'COMPANY' | 'FREELANCER';

// ── Dispute ───────────────────────────────────
export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'CLOSED';

// ── Wallet Transaction ────────────────────────
export type WalletTransactionType =
  | 'PROJECT_EARNING'
  | 'PLATFORM_FEE'
  | 'PENALTY'
  | 'REFUND'
  | 'PAYOUT'
  | 'ADJUSTMENT';

// ── Notification ──────────────────────────────
export type NotificationType =
  | 'NEW_COMPANY'
  | 'NEW_FREELANCER'
  | 'NEW_PROJECT'
  | 'PROJECT_AWAITING_REVIEW'
  | 'ASSIGNMENT_REQUIRED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'COMPLETION_REQUEST'
  | 'DROP_REQUEST'
  | 'DISPUTE'
  | 'PAYOUT_REQUEST'
  | 'NEW_MESSAGE'
  | 'PROJECT_APPROVED'
  | 'PROJECT_REJECTED'
  | 'PROJECT_ASSIGNED'
  | 'PROJECT_COMPLETED';

// ── Audit ─────────────────────────────────────
export type AuditAction =
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
  | 'COMPANY_SUSPENDED'
  | 'COMPANY_ACTIVATED'
  | 'COMPANY_BANNED'
  | 'FREELANCER_APPROVED'
  | 'FREELANCER_REJECTED'
  | 'FREELANCER_SUSPENDED'
  | 'PROJECT_APPROVED'
  | 'PROJECT_REJECTED'
  | 'PROJECT_ASSIGNED'
  | 'PAYMENT_VERIFIED'
  | 'REFUND_PROCESSED'
  | 'PENALTY_APPLIED'
  | 'PENALTY_OVERRIDDEN'
  | 'DISPUTE_RESOLVED'
  | 'PAYOUT_PROCESSED'
  | 'SETTINGS_CHANGED'
  | 'DROP_APPROVED'
  | 'DROP_REJECTED';

export type AuditEntityType =
  | 'COMPANY'
  | 'FREELANCER'
  | 'PROJECT'
  | 'PAYMENT'
  | 'DISPUTE'
  | 'DROP_REQUEST'
  | 'PAYOUT'
  | 'SETTING';

// ── Message ───────────────────────────────────
export type MessageSenderRole = 'COMPANY' | 'ADMIN' | 'FREELANCER';

export type ConversationChannel = 'COMPANY_ADMIN' | 'ADMIN_FREELANCER';

// ── Report ────────────────────────────────────
export type ReportType =
  | 'COMPANY'
  | 'FREELANCER'
  | 'PROJECT'
  | 'ASSIGNMENT'
  | 'PAYMENT'
  | 'REVENUE'
  | 'COMMISSION'
  | 'REFUND'
  | 'PENALTY'
  | 'PAYOUT'
  | 'DISPUTE';
