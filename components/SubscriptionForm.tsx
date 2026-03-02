'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, BILLING_CYCLES } from '@/lib/utils'
import { Save, Loader2 } from 'lucide-react'

interface Props {
  orgId: string
  subscription?: any
}

export default function SubscriptionForm({ orgId, subscription }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: subscription?.name || '',
    vendor: subscription?.vendor || '',
    description: subscription?.description || '',
    category: subscription?.category || 'Other',
    cost: subscription?.cost?.toString() || '',
    currency: subscription?.currency || 'USD',
    billing_cycle: subscription?.billing_cycle || 'monthly',
    renewal_date: subscription?.renewal_date || '',
    auto_renews: subscription?.auto_renews ?? true,
    status: subscription?.status || 'active',
    owner_name: subscription?.owner_name || '',
    website_url: subscription?.website_url || '',
    notes: subscription?.notes || '',
    alert_30: subscription?.alert_30 ?? true,
    alert_7: subscription?.alert_7 ?? true,
    alert_1: subscription?.alert_1 ?? true,
  })

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      org_id: orgId,
      cost: parseFloat(form.cost) || 0,
    }

    let result
    if (subscription?.id) {
      result = await supabase
        .from('subscriptions')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', subscription.id)
    } else {
      result = await supabase.from('subscriptions').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    router.push('/subscriptions')
    router.refresh()
  }

  const inputClass = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Subscription Name *</label>
          <input
            required
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. GitHub Teams"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Vendor / Provider *</label>
          <input
            required
            value={form.vendor}
            onChange={e => update('vendor', e.target.value)}
            placeholder="e.g. GitHub"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Cost *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={e => update('cost', e.target.value)}
              placeholder="0.00"
              className={`${inputClass} pl-7`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Billing Cycle</label>
          <select value={form.billing_cycle} onChange={e => update('billing_cycle', e.target.value)} className={inputClass}>
            {BILLING_CYCLES.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select value={form.category} onChange={e => update('category', e.target.value)} className={inputClass}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Next Renewal Date *</label>
          <input
            required
            type="date"
            value={form.renewal_date}
            onChange={e => update('renewal_date', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select value={form.status} onChange={e => update('status', e.target.value)} className={inputClass}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Owner / Responsible Person</label>
          <input
            value={form.owner_name}
            onChange={e => update('owner_name', e.target.value)}
            placeholder="e.g. Sarah, Engineering Team"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Website URL</label>
          <input
            type="url"
            value={form.website_url}
            onChange={e => update('website_url', e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          rows={3}
          placeholder="Any notes about this subscription, login info location, cancellation instructions..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Alert settings */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Renewal Alerts</p>
        <div className="space-y-2">
          {[
            { key: 'alert_30', label: '30 days before renewal' },
            { key: 'alert_7', label: '7 days before renewal' },
            { key: 'alert_1', label: '1 day before renewal' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={e => update(key, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {subscription ? 'Save Changes' : 'Add Subscription'}
        </button>
        <a href="/subscriptions" className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
      </div>
    </form>
  )
}
