import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SubscriptionForm from '@/components/SubscriptionForm'
import DeleteSubscriptionButton from '@/components/DeleteSubscriptionButton'
import { formatCurrency, formatDate, daysUntilRenewal, getRenewalUrgency, urgencyColor } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Bell, ExternalLink } from 'lucide-react'

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single()

  if (!sub) notFound()

  const { data: logs } = await supabase
    .from('alert_logs')
    .select('*')
    .eq('subscription_id', id)
    .order('sent_at', { ascending: false })
    .limit(10)

  const days = daysUntilRenewal(sub.renewal_date)
  const urgency = getRenewalUrgency(days)
  const colors = urgencyColor(urgency)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/subscriptions" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to subscriptions
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-lg font-bold">
              {sub.vendor.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{sub.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-500 text-sm">{sub.vendor}</span>
                {sub.website_url && (
                  <a href={sub.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-600 text-xs flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Visit site
                  </a>
                )}
              </div>
            </div>
          </div>
          <DeleteSubscriptionButton id={sub.id} />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-400 mb-1">Cost</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(sub.cost)}</p>
            <p className="text-xs text-slate-400 capitalize">{sub.billing_cycle}</p>
          </div>
          <div className={`rounded-xl border p-4 ${colors}`}>
            <p className="text-xs mb-1 opacity-70">Next Renewal</p>
            <p className="text-xl font-bold">{formatDate(sub.renewal_date)}</p>
            <p className="text-xs opacity-70">
              {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days} days away`}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <p className="text-xl font-bold text-slate-900 capitalize">{sub.status}</p>
            <p className="text-xs text-slate-400">{sub.auto_renews ? 'Auto-renews' : 'Manual renewal'}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Edit Details</h2>
        <SubscriptionForm orgId={profile.org_id} subscription={sub} />
      </div>

      {/* Alert history */}
      {logs && logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Alert History</h2>
          </div>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{log.alert_type} alert sent</span>
                <span className="text-slate-400 text-xs">{new Date(log.sent_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
