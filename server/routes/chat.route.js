const express = require('express')
const { chatWithAI } = require('../controllers/chat.controller.js')
const { chatInteractive } = require('../controllers/interactive.controller.js')

const router = express.Router()

router.post('/', chatWithAI)
router.post('/interactive', chatInteractive)

module.exports = router
