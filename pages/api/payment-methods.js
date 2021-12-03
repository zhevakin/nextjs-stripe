import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2020-03-02',
})

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log(req)
      const { customer } = req.query
      const methods = await stripe.paymentMethods.list({ customer, type: 'card' })

      res.status(200).json(methods)
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
