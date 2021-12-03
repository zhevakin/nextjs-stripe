import { useState } from "react"
import axios from "axios"
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#6772e5',
      color: '#6772e5',
      fontWeight: '500',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#fce883',
      },
      '::placeholder': {
        color: '#6772e5',
      },
    },
    invalid: {
      iconColor: '#ef2961',
      color: '#ef2961',
    },
  },
}

const StripeForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [payment, setPayment] = useState({ status: 'initial' })
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const response = await axios.post('/api/payment-intents', {
      amount: 100,
    })
    setPayment(response.data)

    const cardElement = elements.getElement(CardElement)
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      response.data.client_secret,
      {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'TEST USER' },
        },
      },
    )

    if (error) {
      setPayment({ status: 'error' })
      setErrorMessage(error.message ?? 'An unknown error occurred')
    } else if (paymentIntent) {
      setPayment(paymentIntent)
    }
  }

  return (
    <div style={{ maxWidth: 400, padding: 30 }}>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <CardElement
            options={CARD_OPTIONS}
            onChange={(e) => {
              if (e.error) {
                setPayment({ status: 'error' })
                setErrorMessage(
                  e.error.message ?? 'An unknown error occurred',
                )
              }
            }}
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
      {JSON.stringify(payment)}
    </div>
  )
}

export default function Home() {
  return (
    <Elements stripe={getStripe()}>
      <StripeForm/>
    </Elements>
  )
}
