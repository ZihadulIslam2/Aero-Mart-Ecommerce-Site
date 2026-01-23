const express = require('express')
const {
  createCheckoutSession,
  stripeWebhook,
} = require('../../controllers/payment/stripe-controller')

const router = express.Router()

router.post('/create-checkout-session', createCheckoutSession)

// Stripe requires raw body for webhook signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook,
)

module.exports = router
