import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user has an org, if not we need to create one
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', data.user.id)
        .single()

      if (!profile?.org_id) {
        // Create org for new user
        const orgName = data.user.user_metadata?.full_name
          ? `${data.user.user_metadata.full_name}'s Workspace`
          : `${data.user.email?.split('@')[0]}'s Workspace`

        const slug = `org-${data.user.id.slice(0, 8)}`

        const { data: org } = await supabase
          .from('organizations')
          .insert({ name: orgName, slug, owner_id: data.user.id })
          .select()
          .single()

        if (org) {
          await supabase
            .from('profiles')
            .update({ org_id: org.id })
            .eq('id', data.user.id)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
