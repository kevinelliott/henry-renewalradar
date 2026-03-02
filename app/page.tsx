import Link from 'next/link'
import { Bell, Shield, BarChart3, Users, CheckCircle, ArrowRight, Zap, Clock, DollarSign } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">RenewalRadar</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm px-4 py-2 rounded-full mb-6 font-medium">
            <Zap className="w-3.5 h-3.5" />
            No more surprise renewal charges
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Your entire SaaS stack,<br />
            <span className="text-indigo-600">under control</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Track every subscription your company pays for. Get email alerts 30, 7, and 1 day before renewals.
            Know exactly what you're spending — and what to cut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              Start 14-day free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="px-8 py-4 rounded-xl font-semibold text-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              See how it works
            </a>
          </div>
          <p className="text-sm text-slate-400 mt-4">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">$18,000</div>
            <div className="text-sm text-slate-500">average annual savings found per company</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">73%</div>
            <div className="text-sm text-slate-500">of companies have unused subscriptions still active</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">2 min</div>
            <div className="text-sm text-slate-500">to add your first subscription and get protected</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to manage SaaS spend</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Built for finance, ops, and engineering teams who are tired of digging through invoices
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bell,
                title: 'Proactive Renewal Alerts',
                desc: 'Get email alerts 30, 7, and 1 day before every renewal. Never be caught off guard again.'
              },
              {
                icon: BarChart3,
                title: 'Spend Dashboard',
                desc: 'See your total monthly and annual SaaS spend at a glance. Filter by category, owner, or status.'
              },
              {
                icon: Clock,
                title: 'Renewal Calendar',
                desc: 'Visual calendar of every upcoming renewal. Plan your budget month by month.'
              },
              {
                icon: Users,
                title: 'Owner Assignment',
                desc: 'Assign each subscription to a team member. Know who is responsible for every tool.'
              },
              {
                icon: Shield,
                title: 'Cancellation Tracking',
                desc: 'Mark subscriptions for cancellation before the renewal. Get reminded if you forget.'
              },
              {
                icon: DollarSign,
                title: 'Budget vs Actual',
                desc: "Set SaaS budgets by category and see how you're tracking. Spot overages before they happen."
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">14-day free trial on all plans. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">$49</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">For solo finance managers and small teams</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['1 user', 'Up to 25 subscriptions', 'Email alerts (30/7/1 day)', 'Spend dashboard', 'Renewal calendar'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full block text-center bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                Start free trial
              </Link>
            </div>
            {/* Team */}
            <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Team</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-indigo-200">/month</span>
                </div>
                <p className="text-indigo-200 text-sm mt-2">For ops and finance teams at growing companies</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 10 users', 'Unlimited subscriptions', 'Email alerts + Slack', 'Budget tracking', 'CSV export', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full block text-center bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Stop losing money on forgotten subscriptions</h2>
          <p className="text-slate-500 text-lg mb-8">
            Companies typically find 3-5 unused subscriptions in their first week with RenewalRadar.
            The tool pays for itself immediately.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors">
            Get started free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Bell className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">RenewalRadar</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 RenewalRadar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
