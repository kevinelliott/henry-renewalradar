import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { differenceInDays, parseISO } from 'date-fns'

// This route is called by a cron job (e.g. Vercel Cron or external)
// Authorization: Bearer CRON_SECRET
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  const supabase = createClient(url, key)

  // Get all active subscriptions with alerts enabled
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, organizations(name, owner_id, profiles:profiles(email))')
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date()
  const alertsSent: string[] = []

  for (const sub of subscriptions || []) {
    const daysUntil = differenceInDays(parseISO(sub.renewal_date), today)
    const alertTypes: Array<{ days: number; key: string; label: string }> = [
      { days: 30, key: 'alert_30', label: '30 days' },
      { days: 7, key: 'alert_7', label: '7 days' },
      { days: 1, key: 'alert_1', label: '1 day' },
    ]

    for (const alert of alertTypes) {
      if (daysUntil !== alert.days) continue
      if (!sub[alert.key]) continue

      // Check if we already sent this alert recently (within 2 days)
      const { data: existingLog } = await supabase
        .from('alert_logs')
        .select('id')
        .eq('subscription_id', sub.id)
        .eq('alert_type', `${alert.days}day`)
        .gte('sent_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (existingLog) continue

      // Get org owner email
      const { data: orgProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('org_id', sub.org_id)
        .limit(10)

      const emails = (orgProfile || []).map((p: any) => p.email).filter(Boolean)

      // Send email via Resend (if configured)
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder_resend_key') {
        const { Resend } = require('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        for (const email of emails) {
          await resend.emails.send({
            from: 'RenewalRadar <alerts@renewalradar.app>',
            to: email,
            subject: `[Alert] ${sub.name} renews in ${alert.label}`,
            html: `
              <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
                  <div style="width: 40px; height: 40px; background: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 18px;">R</span>
                  </div>
                  <span style="font-weight: bold; font-size: 18px; color: #0f172a;">RenewalRadar</span>
                </div>
                <h2 style="color: #0f172a; margin-bottom: 8px;">${sub.name} renews in ${alert.label}</h2>
                <p style="color: #64748b; margin-bottom: 24px;">This is a reminder that your subscription to <strong>${sub.vendor}</strong> will automatically renew soon.</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Subscription</td>
                      <td style="color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">${sub.name}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Vendor</td>
                      <td style="color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">${sub.vendor}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Cost</td>
                      <td style="color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">$${sub.cost} ${sub.billing_cycle}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Renewal Date</td>
                      <td style="color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">${sub.renewal_date}</td>
                    </tr>
                  </table>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscriptions/${sub.id}" style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  View Subscription
                </a>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
                  You're receiving this because you have renewal alerts enabled for this subscription in RenewalRadar.
                </p>
              </div>
            `,
          })
        }
      }

      // Log the alert
      await supabase.from('alert_logs').insert({
        subscription_id: sub.id,
        org_id: sub.org_id,
        alert_type: `${alert.days}day`,
        sent_to: emails,
      })

      alertsSent.push(`${sub.name} (${alert.days}day)`)
    }
  }

  return NextResponse.json({ sent: alertsSent.length, alerts: alertsSent })
}

export async function GET(req: NextRequest) {
  return POST(req)
}
