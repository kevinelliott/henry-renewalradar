export function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder', {
    apiVersion: '2024-12-18.acacia',
  })
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_placeholder_starter',
    features: ['1 user', 'Up to 25 subscriptions', 'Email alerts', 'Spend tracking'],
  },
  team: {
    name: 'Team',
    price: 99,
    priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_placeholder_team',
    features: ['Up to 10 users', 'Unlimited subscriptions', 'Email + Slack alerts', 'Budget tracking', 'CSV export', 'Priority support'],
  },
}
