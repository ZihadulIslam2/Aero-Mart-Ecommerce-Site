const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')

// Payment initiation route
router.post('/payment/initiate', paymentController.initiatePayment)

// Routes for payment success/fail/cancel
router.post('/payment-success', paymentController.handleSuccess)
router.post('/payment-fail', paymentController.handleFail)
router.post('/payment-cancel', paymentController.handleCancel)

module.exports = router
