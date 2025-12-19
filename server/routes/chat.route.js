const express = require('express')
const { chatWithAI } = require('../controllers/chat.controller.js')

const router = express.Router()

router.post('/', chatWithAI)

module.exports = router
