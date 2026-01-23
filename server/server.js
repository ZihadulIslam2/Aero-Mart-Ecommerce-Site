require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRouter = require('./routes/auth/auth-routes')
const adminProductsRouter = require('./routes/admin/products-routes')
const adminOrderRouter = require('./routes/admin/order-routes')

const shopProductsRouter = require('./routes/shop/products-routes')
const shopCartRouter = require('./routes/shop/cart-routes')
const shopAddressRouter = require('./routes/shop/address-routes')
const shopOrderRouter = require('./routes/shop/order-routes')
const shopSearchRouter = require('./routes/shop/search-routes')
const shopReviewRouter = require('./routes/shop/review-routes')

const commonFeatureRouter = require('./routes/common/feature-routes')
const shopFavoritesRouter = require('./routes/shop/favorites-routes')
const chatRoute = require('./routes/chat.route')
const stripePaymentRouter = require('./routes/payment/stripe-routes')

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

const db_url = process.env.MONGO_URL

mongoose
  .connect(db_url)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log(error))

const app = express()

app.get('/', (req, res) => {
  res.json({ message: 'hello world' })
})
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Expires',
      'Pragma',
    ],
    credentials: true,
  }),
)

app.use(cookieParser())
// Stripe webhook needs raw body for signature verification
app.use(
  '/api/payment/stripe/webhook',
  express.raw({ type: 'application/json' }),
)
// For most routes use JSON parser
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/admin/products', adminProductsRouter)
app.use('/api/admin/orders', adminOrderRouter)

app.use('/api/shop/products', shopProductsRouter)
app.use('/api/shop/cart', shopCartRouter)
app.use('/api/shop/address', shopAddressRouter)
app.use('/api/shop/order', shopOrderRouter)
app.use('/api/shop/search', shopSearchRouter)
app.use('/api/shop/review', shopReviewRouter)
app.use('/api/shop/favorites', shopFavoritesRouter)

app.use('/api/common/feature', commonFeatureRouter)

app.use('/api/chat', chatRoute)
app.use('/api/payment/stripe', stripePaymentRouter)

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`))
