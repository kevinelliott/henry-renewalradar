import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''
  const stripe = getStripe()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  const supabase = createClient(url, key)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { org_id, plan } = session.metadata || {}
    if (org_id) {
      await supabase
        .from('organizations')
        .update({
          plan,
          subscription_status: 'active',
          stripe_subscription_id: session.subscription,
        })
        .eq('id', org_id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    await supabase
      .from('organizations')
      .update({ subscription_status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as any
    await supabase
      .from('organizations')
      .update({ subscription_status: sub.status })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
