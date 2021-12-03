import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2020-03-02',
})

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { amount, confirm, customer, paymentMethodId } = req.body
    try {
      // Validate the amount that was passed from the client.
      if (amount < 0) {
        throw new Error('Invalid amount.')
      }
      // Create PaymentIntent from body params.
      const params = {
        customer,
        payment_method_types: ['card', 'sofort'],
        amount: 1000,
        currency: 'EUR',
        description: 'TEST',
        setup_future_usage: 'off_session',
        confirm: !!confirm,
        payment_method: paymentMethodId,
      }
      const payment_intent = await stripe.paymentIntents.create(params)

      res.status(200).json(payment_intent)
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}