// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
import { clsx, type ClassValue } from 'clsx';

/** Merge class names safely */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format number as Indian Rupees */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date as "10 Sep 2026" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format date + time as "10 Sep 2026, 5:30 PM" */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative time: "2 hours ago" */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

/** Get initials from name: "Rahul Sharma" → "RS" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Platform commission calculation */
export function calculateCommission(
  amount: number,
  commissionPercent: number,
): { platformFee: number; freelancerAmount: number } {
  const platformFee = Math.round((amount * commissionPercent) / 100);
  return { platformFee, freelancerAmount: amount - platformFee };
}

/** Status → badge class mapping */
export function statusToBadge(status: string): string {
  const map: Record<string, string> = {
    APPROVED: 'badge-green',
    ACTIVE: 'badge-green',
    COMPLETED: 'badge-green',
    PAYMENT_SUCCESS: 'badge-green',
    AVAILABLE: 'badge-green',
    RESOLVED: 'badge-green',
    PENDING_APPROVAL: 'badge-yellow',
    ASSIGNMENT_PENDING: 'badge-yellow',
    PAYMENT_PENDING: 'badge-yellow',
    COMPLETION_REQUESTED: 'badge-yellow',
    UNDER_REVIEW: 'badge-yellow',
    PENDING: 'badge-yellow',
    APPROVED_PAYOUT: 'badge-yellow',
    ONGOING: 'badge-blue',
    ASSIGNED: 'badge-blue',
    PROCESSING: 'badge-blue',
    REJECTED: 'badge-red',
    BANNED: 'badge-red',
    DROPPED: 'badge-red',
    FAILED: 'badge-red',
    SUSPENDED: 'badge-orange',
    DISPUTED: 'badge-orange',
    DROP_REQUESTED: 'badge-orange',
    OPEN: 'badge-orange',
    BUSY: 'badge-purple',
    INACTIVE: 'badge-slate',
    CANCELLED: 'badge-slate',
  };
  return map[status] ?? 'badge-slate';
}
