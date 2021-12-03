import { useEffect, useState } from "react"
import axios from "axios"
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
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

    console.log(elements)
    return

    const { error, paymentIntent } = await stripe.confirmPayment(
      {
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
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
          <PaymentElement/>
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
      <div>Payment status: {payment.status}</div>
    </div>
  )
}

export default function Home() {
  const [payment, setPayment] = useState({ status: 'initial' })
  const [errorMessage, setErrorMessage] = useState('')

  const [clientSecret, setClientSecret] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState([])
  const options = {
    // passing the client secret obtained from the server
    clientSecret,
  }

  useEffect(async () => {
    const request = await axios.get('/api/payment-methods', { params: { customer: 'cus_KZjOiQixZYKdVA' } })
    setPaymentMethods(request.data.data)
  }, [])

  const handlePay = async () => {
    // const customer = await axios.post('/api/customers')
    const response = await axios.post('/api/payment-intents', {
      amount: 100,
      customer: 'cus_KZjOiQixZYKdVA',
    })

    setClientSecret(response.data.client_secret)
  }

  const handlePayWithSavedCard = async (paymentMethodId) => {
    const response = await axios.post('/api/payment-intents', {
      amount: 100,
      customer: 'cus_KZjOiQixZYKdVA',
      paymentMethodId,
      confirm: true
    })

    setPayment(response.data)

  }

  if (!clientSecret) {
    return (
      <div className="p-4">
        <div className="mb-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="mb-2">
              <button className="btn btn-secondary" onClick={() => handlePayWithSavedCard(method.id)}>Card ending {method.card.last4}</button>
            </div>
          ))}
          <button className="btn btn-primary" onClick={handlePay}>Pay with new method</button>
        </div>
        <div>Payment status: {payment.status}</div>
      </div>
    )
  }

  return (
    <Elements stripe={getStripe()} options={options}>
      <StripeForm/>
    </Elements>
  )
}
