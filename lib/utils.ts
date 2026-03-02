import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function daysUntilRenewal(renewalDate: string): number {
  return differenceInDays(parseISO(renewalDate), new Date())
}

export function formatDate(date: string) {
  return format(parseISO(date), 'MMM d, yyyy')
}

export function getRenewalUrgency(days: number): 'overdue' | 'critical' | 'warning' | 'upcoming' | 'safe' {
  if (days < 0) return 'overdue'
  if (days <= 7) return 'critical'
  if (days <= 14) return 'warning'
  if (days <= 30) return 'upcoming'
  return 'safe'
}

export function urgencyColor(urgency: string) {
  switch (urgency) {
    case 'overdue': return 'text-red-600 bg-red-50 border-red-200'
    case 'critical': return 'text-red-500 bg-red-50 border-red-200'
    case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'upcoming': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-green-600 bg-green-50 border-green-200'
  }
}

export const CATEGORIES = [
  'Analytics', 'Communication', 'CRM', 'Design', 'Developer Tools',
  'Finance', 'HR & Payroll', 'Infrastructure', 'Marketing', 'Operations',
  'Productivity', 'Sales', 'Security', 'Storage', 'Support', 'Other'
]

export const BILLING_CYCLES = ['monthly', 'quarterly', 'annually', 'one-time']
