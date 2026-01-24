const Stripe = require('stripe')
const Order = require('../../models/Order')
const nodemailer = require('nodemailer')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

async function createCheckoutSession(req, res) {
  try {
    const { items, user, metadata } = req.body // items: [{name, price, quantity}] minimal for demo
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items for checkout' })
    }

    if (!user?.id) {
      return res.status(400).json({ error: 'UserId required' })
    }

    const line_items = items.map((it) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: it.name },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: it.quantity || 1,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shop/payment-success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shop/checkout`,
      metadata: {
        userId: user.id,
        ...metadata,
      },
    })

    console.log('Stripe session created:', session.id, 'for userId:', user.id)
    res.json({ url: session.url })
  } catch (err) {
    console.error('stripe create session error', err)
    res.status(500).json({ error: 'Stripe session failed' })
  }
}

async function stripeWebhook(req, res) {
  try {
    const sig = req.headers['stripe-signature']
    let event
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      )
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('Payment success for userId:', session.metadata?.userId)

      // Verify userId exists
      if (!session.metadata?.userId) {
        console.error('No userId in payment metadata!')
        return res.status(400).send('No userId in metadata')
      }

      // Create order record with all details
      const order = await Order.create({
        userId: session.metadata.userId,
        cartItems: session.metadata?.cartItems
          ? JSON.parse(session.metadata.cartItems)
          : [],
        totalAmount: session.amount_total / 100,
        paymentStatus: 'paid',
        paymentMethod: 'stripe',
        orderStatus: 'placed',
        orderDate: new Date(),
      })
      console.log('Order created:', order._id)

      // Send email confirmation (basic SMTP example)
      if (process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@aeromart.com',
          to: session.customer_details?.email,
          subject: 'Order Confirmation - Aero Mart',
          text: 'Your order has been placed successfully. Thank you!',
        })
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('stripe webhook error', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

module.exports = { createCheckoutSession, stripeWebhook }
