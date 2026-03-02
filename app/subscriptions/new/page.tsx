import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubscriptionForm from '@/components/SubscriptionForm'

export default async function NewSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/login')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add Subscription</h1>
        <p className="text-slate-500 text-sm mt-1">Track a new SaaS subscription and get renewal alerts</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <SubscriptionForm orgId={profile.org_id} />
      </div>
    </div>
  )
}
