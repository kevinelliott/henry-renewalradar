import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, daysUntilRenewal, getRenewalUrgency, urgencyColor } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/login')

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('status', 'active')

  const today = new Date()
  const currentDate = params.month ? new Date(params.month + '-01') : today
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const subs = subscriptions || []

  const prevMonth = format(subMonths(currentDate, 1), 'yyyy-MM')
  const nextMonth = format(addMonths(currentDate, 1), 'yyyy-MM')

  // Get renewals for each day
  const renewalsByDay = days.map(day => ({
    date: day,
    renewals: subs.filter(s => {
      try {
        return isSameDay(parseISO(s.renewal_date), day)
      } catch { return false }
    }),
  }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Renewal Calendar</h1>
        <div className="flex items-center gap-3">
          <Link href={`/calendar?month=${prevMonth}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <span className="text-slate-700 font-medium min-w-36 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Link href={`/calendar?month=${nextMonth}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Link>
        </div>
      </div>

      {/* Monthly spend summary */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex items-center gap-8">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Renewals this month</p>
          <p className="text-2xl font-bold text-slate-900">
            {renewalsByDay.filter(d => d.renewals.length > 0).length}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Total due</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(renewalsByDay.reduce((acc, d) => acc + d.renewals.reduce((a, s) => a + s.cost, 0), 0))}
          </p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        <div className="grid grid-cols-7">
          {/* Empty cells for start of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 border-b border-r border-slate-50 bg-slate-25" />
          ))}

          {renewalsByDay.map(({ date, renewals }) => {
            const isToday = isSameDay(date, today)
            const dayOfWeek = date.getDay()
            const isLastCol = dayOfWeek === 6

            return (
              <div
                key={date.toISOString()}
                className={`h-32 border-b border-r border-slate-50 p-2 overflow-hidden ${isLastCol ? 'border-r-0' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                }`}>
                  {format(date, 'd')}
                </div>
                <div className="space-y-1">
                  {renewals.slice(0, 3).map(sub => {
                    const days = daysUntilRenewal(sub.renewal_date)
                    const urgency = getRenewalUrgency(days)
                    const baseColors = {
                      overdue: 'bg-red-100 text-red-700',
                      critical: 'bg-red-100 text-red-700',
                      warning: 'bg-amber-100 text-amber-700',
                      upcoming: 'bg-blue-100 text-blue-700',
                      safe: 'bg-green-100 text-green-700',
                    }
                    return (
                      <Link key={sub.id} href={`/subscriptions/${sub.id}`}>
                        <div className={`text-xs px-1.5 py-0.5 rounded truncate ${baseColors[urgency]}`}>
                          {sub.name} {formatCurrency(sub.cost)}
                        </div>
                      </Link>
                    )
                  })}
                  {renewals.length > 3 && (
                    <div className="text-xs text-slate-400 px-1">+{renewals.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Empty cells for end of month */}
          {Array.from({ length: (6 - monthEnd.getDay()) }).map((_, i) => (
            <div key={`end-${i}`} className="h-32 border-b border-slate-50 bg-slate-25" />
          ))}
        </div>
      </div>
    </div>
  )
}
