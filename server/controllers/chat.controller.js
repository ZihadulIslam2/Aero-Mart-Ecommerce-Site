const axios = require('axios')
const Product = require('../models/Product')

// System context for the AI chatbot
const getSystemContext = (products) => {
  const productList = products
    .map(
      (p) =>
        `- ${p.title}: ${p.description}, Category: ${p.category}, Brand: ${
          p.brand
        }, Price: $${p.price}${
          p.salePrice ? ` (Sale: $${p.salePrice})` : ''
        }, Stock: ${p.totalStock}`
    )
    .join('\n')

  return `
  ******** Important: make with in 30 words. do not give responce in more then 30 word:****

  
  You are a helpful customer service chatbot for Aero Mart, an e-commerce website.

IMPORTANT INSTRUCTIONS:
- You assist customers with product inquiries, site information, and general shopping help
- Be friendly, professional, and concise in your responses
- When customers ask about products, provide specific details from our catalog
- For contact/support, direct them to: zihadul708@gmail.com

ABOUT AERO MART:
- Aero Mart is an online e-commerce platform
- We sell clothing and fashion items for men and women
- Brands available: Nike, Adidas, H&M, Zara
- Categories: Men's wear, Women's wear
- Contact for help: zihadul708@gmail.com

AVAILABLE PRODUCTS:
${productList}

When answering:
- If asked about products, mention specific items with prices and details
- If asked about the website, explain what Aero Mart offers
- If asked about contact/support, provide the email address
- Be helpful and guide users to make informed purchase decisions
- Keep responses natural and conversational

******** Important: make with in 30 words****
`
}

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body
    console.log('User message:', message)

    // Fetch current products from database for up-to-date information
    const products = await Product.find({}).select(
      'title description category brand price salePrice totalStock'
    )

    // Build context-aware prompt
    const systemContext = getSystemContext(products)
    const fullPrompt = `${systemContext}

Customer Question: ${message}

Assistant Response:`

    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'tinyllama',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
        },
      },
      {
        timeout: 100000, // 30 second timeout
      }
    )

    res.json({
      reply: response.data.response,
    })
  } catch (error) {
    console.error('AI chat error:', error.message)

    // Provide fallback response if AI fails
    const fallbackMessage =
      'Sorry, I am experiencing technical difficulties. For assistance, please contact us at zihadul708@gmail.com'

    res.status(500).json({
      error: 'AI response failed',
      reply: fallbackMessage,
    })
  }
}

module.exports = {
  chatWithAI,
}
