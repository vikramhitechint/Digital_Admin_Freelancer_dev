import type {
  AdminRole,
  CompanyStatus,
  FreelancerStatus,
  FreelancerAvailability,
  ProjectStatus,
  PaymentStatus,
  PaymentGateway,
  PayoutStatus,
  DropRequestStatus,
  DropRequestInitiator,
  DisputeStatus,
  WalletTransactionType,
  NotificationType,
  AuditAction,
  AuditEntityType,
  MessageSenderRole,
  ConversationChannel,
} from './enums';

// ─────────────────────────────────────────────
// API Response Wrapper
// ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
  is_active: boolean;
  two_fa_enabled: boolean;
  created_at: string;
}

export interface AuthSession {
  admin: AdminUser;
  token: string;
  expires_at: string;
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export interface DashboardStats {
  companies: {
    total: number;
    pending_approval: number;
    active: number;
    suspended: number;
  };
  freelancers: {
    total: number;
    pending_approval: number;
    active: number;
    available: number;
    busy: number;
  };
  projects: {
    total: number;
    pending_review: number;
    assignment_pending: number;
    assigned: number;
    payment_pending: number;
    ongoing: number;
    completion_review: number;
    completed: number;
    dropped: number;
    disputed: number;
  };
  finance: {
    total_payments: number;
    platform_revenue: number;
    freelancer_earnings: number;
    pending_payouts: number;
    refunds: number;
  };
  disputes: {
    open: number;
    pending: number;
    resolved: number;
  };
}

// ─────────────────────────────────────────────
// Company
// ─────────────────────────────────────────────
export interface Company {
  id: string;
  profile_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  website?: string;
  address?: string;
  status: CompanyStatus;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Freelancer
// ─────────────────────────────────────────────
export interface Freelancer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  skills: string[];
  category?: string;
  experience_years?: number;
  bio?: string;
  portfolio_url?: string;
  status: FreelancerStatus;
  availability: FreelancerAvailability;
  kyc_verified: boolean;
  rating?: number;
  completed_projects: number;
  current_projects: number;
  total_earnings: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Project
// ─────────────────────────────────────────────
export interface Project {
  id: string;
  company_id: string;
  title: string;
  description: string;
  category?: string;
  required_skills: string[];
  budget: number;
  currency: string;
  timeline_days?: number;
  deadline?: string;
  status: ProjectStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  assignment?: ProjectAssignment;
  files?: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploaded_by: string;
  created_at: string;
}

export interface ProjectStatusHistory {
  id: string;
  project_id: string;
  from_status?: ProjectStatus;
  to_status: ProjectStatus;
  changed_by: string;
  changed_by_role: string;
  reason?: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// Assignment
// ─────────────────────────────────────────────
export interface ProjectAssignment {
  id: string;
  project_id: string;
  freelancer_id: string;
  assigned_by: string;
  assigned_at: string;
  notes?: string;
  freelancer?: Freelancer;
}

// ─────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────
export interface Payment {
  id: string;
  project_id: string;
  company_id: string;
  amount: number;
  currency: string;
  platform_fee: number;
  freelancer_amount: number;
  gateway: PaymentGateway;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  status: PaymentStatus;
  verified_at?: string;
  created_at: string;
  project?: Pick<Project, 'id' | 'title'>;
  company?: Pick<Company, 'id' | 'company_name'>;
}

// ─────────────────────────────────────────────
// Payout
// ─────────────────────────────────────────────
export interface PayoutRequest {
  id: string;
  freelancer_id: string;
  amount: number;
  bank_account?: string;
  upi_id?: string;
  status: PayoutStatus;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  freelancer?: Pick<Freelancer, 'id' | 'full_name' | 'email'>;
}

// ─────────────────────────────────────────────
// Drop Request
// ─────────────────────────────────────────────
export interface DropRequest {
  id: string;
  project_id: string;
  initiated_by: string;
  initiator_role: DropRequestInitiator;
  reason: string;
  status: DropRequestStatus;
  penalty_applied?: number;
  penalty_override?: number;
  override_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  project?: Pick<Project, 'id' | 'title' | 'budget' | 'status'>;
}

// ─────────────────────────────────────────────
// Dispute
// ─────────────────────────────────────────────
export interface Dispute {
  id: string;
  project_id: string;
  drop_request_id?: string;
  reason: string;
  status: DisputeStatus;
  resolution_notes?: string;
  refund_amount?: number;
  penalty_amount?: number;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  project?: Pick<Project, 'id' | 'title' | 'status'>;
}

// ─────────────────────────────────────────────
// Message / Conversation
// ─────────────────────────────────────────────
export interface Conversation {
  id: string;
  project_id: string;
  channel: ConversationChannel;
  created_at: string;
  last_message_at?: string;
  project?: Pick<Project, 'id' | 'title'>;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: MessageSenderRole;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────
export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  body: string;
  entity_id?: string;
  entity_type?: string;
  is_read: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// Audit Log
// ─────────────────────────────────────────────
export interface AuditLog {
  id: string;
  admin_id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: Pick<AdminUser, 'id' | 'full_name' | 'role'>;
}

// ─────────────────────────────────────────────
// Platform Settings
// ─────────────────────────────────────────────
export interface PlatformSettings {
  id: string;
  platform_commission_percent: number;   // default 10
  drop_penalty_percent: number;          // default 25
  company_penalty_share_percent: number; // default 15
  platform_penalty_share_percent: number;// default 10
  updated_by?: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Wallet
// ─────────────────────────────────────────────
export interface FreelancerWallet {
  id: string;
  freelancer_id: string;
  total_earned: number;
  available_balance: number;
  pending_amount: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  reference_id?: string;
  created_at: string;
}
