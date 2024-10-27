const Product = require('../models/Product') // Import Product model
const SSLCommerz = require('ssl-commerz-node')
const PaymentSession = SSLCommerz.PaymentSession
const { v4: uuidv4 } = require('uuid')

const sslCommerzSettings = {
  store_id: 'webco66fe9a1c6704c', 
  store_passwd: 'webco66fe9a1c6704c@ssl', 
  isSandbox: true, 
}

exports.initiatePayment = async (req, res) => {
  const { amount, customerName, email, address, phone } = req.body

  // Generate a unique transaction ID
  const tran_id = uuidv4()

  const payment = new PaymentSession(
    sslCommerzSettings.isSandbox, // Set sandbox or production mode
    sslCommerzSettings.store_id,
    sslCommerzSettings.store_passwd
  )

  // Set transaction parameters
  payment.setUrls({
    success: 'http://localhost:5000/payment-success', // Success URL
    fail: 'http://localhost:5000/payment-fail', // Fail URL
    cancel: 'http://localhost:5000/payment-cancel', // Cancel URL
    ipn: 'http://localhost:5000/payment-ipn', // IPN URL (Optional)
  })

  // Set customer information
  payment.setCusInfo({
    name: customerName,
    email: email,
    add1: address,
    phone: phone,
  })

  // Set order/product details
  payment.setOrderInfo({
    currency: 'BDT',
    amount: amount,
    tran_id: tran_id, // Use the generated unique transaction ID
    product_name: product.name, // You can make this dynamic based on the product
    product_category: 'Your Product Category',
    product_profile: 'general',
  })  

  // Optional: Set shipping information
  payment.setShippingInfo({
    method: 'Courier',
    num_items: 1,
    name: 'Courier Name',
  })

  // Call SSLCommerz Payment Gateway API
  payment
    .initiate()
    .then((response) => {
      if (response.status === 'SUCCESS') {
        // You might want to store the transaction details in your database here
        res.json({
          url: response.GatewayPageURL, // Redirect the user to this URL for payment
        })
      } else {
        res.status(500).json({
          error: 'Failed to initiate payment',
        })
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: 'SSLCommerz error: ' + err.message,
      })
    })
}

// Handle payment success
exports.handleSuccess = (req, res) => {
  const paymentData = req.body

  // Log the payment data or save it to your database
  console.log('Payment Successful:', paymentData)

  // You should verify the transaction status here using the paymentData
  // Example: Update the transaction status in your database to 'Paid'
  // You can access fields like paymentData.tran_id, paymentData.amount, etc.

  // Send a response to the user
  res.send('Payment was successful. Transaction ID: ' + paymentData.tran_id)
}

// Handle payment failure
exports.handleFail = (req, res) => {
  const paymentData = req.body

  // Log the failure data or save it to your database
  console.log('Payment Failed:', paymentData)

  // You might want to update the transaction status in your database to 'Failed'

  // Send a response to the user
  res.send('Payment failed. Transaction ID: ' + paymentData.tran_id)
}

// Handle payment cancellation
exports.handleCancel = (req, res) => {
  const paymentData = req.body

  // Log the cancellation data or save it to your database
  console.log('Payment Canceled:', paymentData)

  // Update the transaction status in your database to 'Canceled'

  // Send a response to the user
  res.send('Payment was canceled. Transaction ID: ' + paymentData.tran_id)
}

// Optional: Handle IPN (Instant Payment Notification)
exports.handleIPN = (req, res) => {
  const ipnData = req.body

  // Process the IPN data (such as validating the payment with SSLCommerz)
  console.log('IPN Data:', ipnData)

  // Send an acknowledgment to SSLCommerz
  res.status(200).send('IPN received')
}
