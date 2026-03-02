import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, daysUntilRenewal, formatDate, getRenewalUrgency, urgencyColor } from '@/lib/utils'
import { Plus, Search, Filter } from 'lucide-react'

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/login')

  let query = supabase
    .from('subscriptions')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('renewal_date', { ascending: true })

  if (params.status) query = query.eq('status', params.status)
  if (params.category) query = query.eq('category', params.category)

  const { data: subscriptions } = await query

  let subs = subscriptions || []
  if (params.q) {
    const q = params.q.toLowerCase()
    subs = subs.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.vendor.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    )
  }

  const totalMonthly = subs.filter(s => s.status === 'active').reduce((acc, s) => {
    if (s.billing_cycle === 'monthly') return acc + s.cost
    if (s.billing_cycle === 'annually') return acc + s.cost / 12
    if (s.billing_cycle === 'quarterly') return acc + s.cost / 3
    return acc
  }, 0)

  const categories = [...new Set(subs.map(s => s.category).filter(Boolean))]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-slate-500 text-sm mt-1">
            {subs.length} subscription{subs.length !== 1 ? 's' : ''} · {formatCurrency(totalMonthly)}/mo
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <form>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search subscriptions..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>
        <div className="flex gap-2">
          {['active', 'cancelled', 'paused'].map(s => (
            <Link
              key={s}
              href={params.status === s ? '/subscriptions' : `/subscriptions?status=${s}`}
              className={`text-sm px-3 py-2 rounded-lg border font-medium capitalize transition-colors ${
                params.status === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {subs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-slate-400 mb-4">No subscriptions found</p>
          <Link href="/subscriptions/new" className="text-indigo-600 text-sm hover:underline">
            Add your first subscription
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subscription</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cost</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Renewal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subs.map(sub => {
                  const days = daysUntilRenewal(sub.renewal_date)
                  const urgency = getRenewalUrgency(days)
                  const colors = urgencyColor(urgency)
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                            {sub.vendor.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{sub.name}</p>
                            <p className="text-xs text-slate-400">{sub.vendor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{sub.category}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(sub.cost)}</p>
                        <p className="text-xs text-slate-400 capitalize">{sub.billing_cycle}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">{formatDate(sub.renewal_date)}</p>
                        {sub.status === 'active' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors}`}>
                            {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days} days`}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          sub.status === 'active' ? 'bg-green-50 text-green-700'
                          : sub.status === 'cancelled' ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
