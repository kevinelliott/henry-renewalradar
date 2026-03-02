import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLANS } from '@/lib/stripe'
import { CheckCircle, Crown, CreditCard } from 'lucide-react'
import BillingButton from '@/components/BillingButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/login')

  const org = profile.organizations as any

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-medium text-slate-900">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-500">Workspace</span>
            <span className="text-sm font-medium text-slate-900">{org?.name}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-500">Plan</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 capitalize">{org?.plan || 'Starter'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                org?.subscription_status === 'active' ? 'bg-green-100 text-green-700'
                : org?.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600'
              }`}>
                {org?.subscription_status === 'trialing' ? 'Trial' : org?.subscription_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Plan & Billing</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = org?.plan === key
            return (
              <div key={key} className={`rounded-xl border-2 p-5 ${isCurrentPlan ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'}`}>
                {isCurrentPlan && (
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium mb-2 inline-block">Current plan</span>
                )}
                <h3 className="font-bold text-slate-900 mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold text-slate-900 mb-3">
                  ${plan.price}<span className="text-sm font-normal text-slate-400">/mo</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrentPlan && (
                  <BillingButton planKey={key} planName={plan.name} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Delete workspace</p>
            <p className="text-xs text-slate-500 mt-0.5">Permanently delete your workspace and all data</p>
          </div>
          <button className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
            Delete workspace
          </button>
        </div>
      </div>
    </div>
  )
}
