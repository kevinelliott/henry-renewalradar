import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, daysUntilRenewal, formatDate, getRenewalUrgency, urgencyColor } from '@/lib/utils'
import { Bell, TrendingUp, AlertTriangle, CheckCircle, Plus, ArrowRight, Calendar } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, organizations(name, plan, subscription_status, trial_ends_at)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/login')

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('status', 'active')
    .order('renewal_date', { ascending: true })

  const subs = subscriptions || []

  // Metrics
  const monthlySpend = subs.reduce((acc, s) => {
    const cost = s.cost || 0
    if (s.billing_cycle === 'monthly') return acc + cost
    if (s.billing_cycle === 'annually') return acc + cost / 12
    if (s.billing_cycle === 'quarterly') return acc + cost / 3
    return acc
  }, 0)

  const annualSpend = monthlySpend * 12

  const upcomingRenewals = subs.filter(s => {
    const days = daysUntilRenewal(s.renewal_date)
    return days >= 0 && days <= 30
  })

  const criticalRenewals = subs.filter(s => {
    const days = daysUntilRenewal(s.renewal_date)
    return days >= 0 && days <= 7
  })

  const org = profile.organizations as any

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {subs.length} active subscription{subs.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </Link>
      </div>

      {/* Trial banner */}
      {org?.subscription_status === 'trialing' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Free trial active — ends {formatDate(org.trial_ends_at)}
              </p>
              <p className="text-xs text-amber-700">Add a payment method to keep access after your trial.</p>
            </div>
          </div>
          <Link href="/settings" className="text-sm font-medium text-amber-900 hover:underline flex items-center gap-1">
            Upgrade <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monthly Spend</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(monthlySpend)}</div>
          <div className="text-xs text-slate-400 mt-1">{formatCurrency(annualSpend)}/year</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Subs</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{subs.length}</div>
          <div className="text-xs text-slate-400 mt-1">currently active</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Due in 30 Days</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{upcomingRenewals.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            {formatCurrency(upcomingRenewals.reduce((a, s) => a + (s.cost || 0), 0))} total
          </div>
        </div>
        <div className={`rounded-xl border p-5 ${criticalRenewals.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`w-4 h-4 ${criticalRenewals.length > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            <span className={`text-xs font-medium uppercase tracking-wide ${criticalRenewals.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>Due in 7 Days</span>
          </div>
          <div className={`text-2xl font-bold ${criticalRenewals.length > 0 ? 'text-red-700' : 'text-slate-900'}`}>{criticalRenewals.length}</div>
          <div className={`text-xs mt-1 ${criticalRenewals.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {criticalRenewals.length > 0 ? 'needs attention' : 'looking good'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upcoming renewals */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Upcoming Renewals</h2>
            <Link href="/subscriptions" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingRenewals.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No renewals in the next 30 days</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingRenewals.slice(0, 8).map(sub => {
                const days = daysUntilRenewal(sub.renewal_date)
                const urgency = getRenewalUrgency(days)
                const colors = urgencyColor(urgency)
                return (
                  <Link key={sub.id} href={`/subscriptions/${sub.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {sub.vendor.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{sub.name}</p>
                        <p className="text-xs text-slate-400">{sub.vendor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(sub.cost)}</p>
                        <p className="text-xs text-slate-400">{sub.billing_cycle}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colors}`}>
                        {days === 0 ? 'Today' : `${days}d`}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Spend by category */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Spend by Category</h2>
          </div>
          {subs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm">No subscriptions yet</p>
              <Link href="/subscriptions/new" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                Add your first one
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {Object.entries(
                subs.reduce((acc: Record<string, number>, s) => {
                  const cat = s.category || 'Other'
                  const monthly = s.billing_cycle === 'annually' ? s.cost / 12
                    : s.billing_cycle === 'quarterly' ? s.cost / 3
                    : s.cost
                  acc[cat] = (acc[cat] || 0) + monthly
                  return acc
                }, {})
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([cat, amount]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{cat}</span>
                      <span className="font-medium text-slate-900">{formatCurrency(amount)}/mo</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min((amount / monthlySpend) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {subs.length === 0 && (
        <div className="mt-8 bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Add your first subscription</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Start tracking your SaaS stack. We'll alert you before every renewal so you're never caught off guard.
          </p>
          <Link
            href="/subscriptions/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Subscription
          </Link>
        </div>
      )}
    </div>
  )
}
