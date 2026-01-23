// const { GoogleGenerativeAI } = require('@google/generative-ai')
const axios = require('axios')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Address = require('../models/Address')
const Order = require('../models/Order')
const Favorite = require('../models/Favorite')

// Commented out Gemini - using local Ollama instead
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Ollama API endpoint (running locally on port 11434)
const OLLAMA_API =
  process.env.OLLAMA_API || 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b'

// In-memory session storage for context (userId -> last product)
const userContext = new Map()

// System instruction for tool-like JSON responses
const SYSTEM_PROMPT = `You are Aero Mart's shopping assistant. Respond with ONLY a valid JSON object, no other text.
{
  "intent": "search_products|show_product_details|add_to_cart|add_favorite|ensure_address|confirm_order|small_talk",
  "query": "product name or search keywords (NOT an ID - only use for text search)",
  "productId": null,
  "quantity": 1,
  "notes": "brief response to user (required, at least 5 words)",
  "params": {"category": null, "brand": null}
}
RULES:
1. ALWAYS include "notes" with a natural response (never empty)
2. NEVER put product IDs or database IDs in query field
3. For questions like "how many stock", "what's the price", "tell me more" - the user is asking about LAST product shown
4. For contextual references ("this product", "it", "that one", "stock", "price") - set intent=show_product_details with NO query
5. For search, set intent=search_products with query (product name/keywords only)
6. Never include IDs anywhere except productId field (which should be null)
7. Keep responses helpful and concise`

async function parseAIIntent(message, userId, lastProductId, retryCount = 0) {
  const MAX_RETRIES = 2

  try {
    // Add context about last product if available
    let contextStr = SYSTEM_PROMPT
    if (lastProductId) {
      contextStr += `\n\nIMPORTANT: The user was just shown a product with ID: ${lastProductId}. If they say "order it", "buy this", "purchase this", use this lastProductId.`
    }

    const prompt =
      contextStr +
      '\n\nUser message: ' +
      message +
      '\n\nRespond with ONLY valid JSON (no other text).'

    console.log('Calling Ollama API:', OLLAMA_API)

    const response = await axios.post(
      OLLAMA_API,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.3, // Lower temp for more consistent JSON output
      },
      {
        timeout: 30000,
      },
    )

    const text = response.data.response || ''

    console.log('Ollama raw response:', text)

    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')

    // Check if response is empty or just whitespace
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in response')
    }

    const raw = text.slice(jsonStart, jsonEnd + 1)
    const parsed = JSON.parse(raw)

    // Check if parsed intent is valid (has intent field)
    if (!parsed.intent) {
      throw new Error('No intent in parsed response')
    }

    console.log('Parsed intent:', parsed)
    return parsed
  } catch (e) {
    console.error(
      `parseAIIntent error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`,
      e.message,
    )

    // Retry automatically if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 500))
      return parseAIIntent(message, userId, lastProductId, retryCount + 1)
    }

    // If all retries exhausted, return fallback
    console.error('All retries exhausted. Using fallback response.')
    return {
      intent: 'small_talk',
      notes:
        'I can help you search and order products. Try asking "Show me baby products".',
    }
  }
}

function normalizeProducts(products) {
  return products.map((p) => ({
    id: p._id?.toString(),
    title: p.title,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
    brand: p.brand,
    category: p.category,
    image: p.image || (p.images && p.images[0]) || '',
    images: p.images || (p.image ? [p.image] : []),
    stock: p.totalStock,
  }))
}

async function chatInteractive(req, res) {
  try {
    // Use a session-based ID if user not authenticated
    const userId = req.body.userId || req.body.sessionId || 'anonymous'
    const message = (req.body.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Message required' })

    console.log('User message:', message)
    console.log('UserId:', userId)

    // Get last product context for this user
    const lastProductId = userContext.get(userId)
    console.log('Last product context:', lastProductId)

    const intent = await parseAIIntent(message, userId, lastProductId)
    console.log('Extracted intent:', intent)

    // Default response payload
    const payload = { notes: intent.notes || '', intent: intent.intent }

    if (intent.intent === 'search_products') {
      const keyword = intent.query || ''
      console.log('Searching products with keyword:', keyword)

      let q = {}

      // If we have search terms, use text search
      if (keyword) {
        const regex = new RegExp(keyword, 'i')
        q.$or = [
          { title: regex },
          { description: regex },
          { brand: regex },
          { category: regex },
        ]
      }

      // Add category as an additional OR condition if AI suggests one (not strict filter)
      if (intent.params?.category) {
        const categoryRegex = new RegExp(intent.params.category, 'i')
        if (q.$or) {
          q.$or.push({ category: categoryRegex })
        } else {
          q.category = categoryRegex
        }
      }

      // Add brand filter only if explicitly mentioned
      if (intent.params?.brand) {
        q.brand = new RegExp(intent.params.brand, 'i')
      }

      console.log('MongoDB query:', JSON.stringify(q, null, 2))
      const products = await Product.find(q).limit(12)
      console.log('Found products:', products.length)
      payload.products = normalizeProducts(products)

      // Store first product for context
      if (products.length > 0 && userId) {
        userContext.set(userId, products[0]._id.toString())
        console.log('Stored product context:', products[0]._id.toString())
      }

      // Update notes if no products found or notes are empty
      if (products.length === 0) {
        payload.notes =
          "I couldn't find any matching products. Try searching with different keywords."
      } else if (!payload.notes) {
        payload.notes = `Found ${products.length} product(s) matching your search!`
      }
    }

    if (intent.intent === 'show_product_details') {
      let product = null

      // First, try to find by productId if provided (validate it's a valid ObjectId first)
      if (intent.productId) {
        try {
          // Check if productId looks like a valid MongoDB ObjectId (24 hex chars)
          if (/^[a-f\d]{24}$/i.test(intent.productId)) {
            product = await Product.findById(intent.productId)
          }
        } catch (e) {
          console.warn('Invalid productId format:', intent.productId)
          product = null
        }
      }

      // If query looks like a productId (24 hex chars), skip regex search and use it as productId instead
      if (!product && intent.query && /^[a-f\d]{24}$/i.test(intent.query)) {
        try {
          product = await Product.findById(intent.query)
          console.log(
            `Query is a valid ObjectId, found:`,
            product ? product.title : 'none',
          )
        } catch (e) {
          console.warn('Invalid query as ObjectId:', intent.query)
          product = null
        }
      }

      // If no productId found or invalid, try to search by query name
      if (!product && intent.query && !/^[a-f\d]{24}$/i.test(intent.query)) {
        const nameRegex = new RegExp(intent.query, 'i')
        product = await Product.findOne({
          $or: [{ title: nameRegex }, { description: nameRegex }],
        })
        console.log(
          `Searched by query "${intent.query}", found:`,
          product ? product.title : 'none',
        )
      }

      // Fall back to last product context (most important for contextual questions)
      if (!product && lastProductId) {
        try {
          product = await Product.findById(lastProductId)
          console.log(
            'Using lastProductId context, found:',
            product ? product.title : 'none',
          )
        } catch (e) {
          console.warn('Invalid lastProductId:', lastProductId)
          product = null
        }
      }

      if (product) {
        const normalized = normalizeProducts([product])[0]
        payload.product = normalized
        payload.products = [normalized] // Also show as single product result
        if (userId) userContext.set(userId, product._id.toString())
        payload.notes ||= 'Here are the details for this product.'
      } else {
        payload.notes = "I couldn't find that product. Try searching again."
      }
    }

    if (intent.intent === 'add_to_cart' && intent.productId && userId) {
      // Validate ObjectId format
      if (/^[a-f\d]{24}$/i.test(intent.productId)) {
        const qty = Number(intent.quantity || 1)
        // Minimal cart add: upsert item in user's cart
        let cart = await Cart.findOne({ userId })
        if (!cart) cart = await Cart.create({ userId, items: [] })
        const idx = cart.items.findIndex(
          (i) => i.productId.toString() === intent.productId,
        )
        if (idx >= 0) cart.items[idx].quantity += qty
        else cart.items.push({ productId: intent.productId, quantity: qty })
        await cart.save()
        payload.cart = { ok: true }
        payload.notes ||= 'Added to your cart.'
      } else {
        payload.notes =
          'Invalid product ID. Please search for the product first.'
      }
    }

    if (intent.intent === 'add_favorite' && userId && intent.productId) {
      // Validate ObjectId format
      if (/^[a-f\d]{24}$/i.test(intent.productId)) {
        const fav = await Favorite.findOneAndUpdate(
          { userId, productId: intent.productId },
          { userId, productId: intent.productId },
          { upsert: true, new: true },
        )
        payload.favorite = { ok: true, productId: intent.productId }
        payload.notes ||= 'Saved to your favorites.'
      } else {
        payload.notes =
          'Invalid product ID. Please search for the product first.'
      }
    }

    if (intent.intent === 'ensure_address' && userId) {
      const addresses = await Address.find({ userId })
      payload.addressPresent = addresses.length > 0
      if (!payload.addressPresent) {
        payload.promptAddress = true
        payload.notes ||=
          'Please add a shipping address. I can help you save one now.'
      } else {
        payload.notes ||= 'Your address is on file. Proceeding...'
      }
    }

    if (intent.intent === 'confirm_order' && userId) {
      // Use productId from intent, or fall back to last product context
      const productId = intent.productId || lastProductId

      if (!productId) {
        payload.notes = 'Please select a product first by searching for it.'
      } else {
        let p = null
        try {
          // Validate ObjectId format before querying
          if (/^[a-f\d]{24}$/i.test(productId)) {
            p = await Product.findById(productId)
          }
        } catch (e) {
          console.warn('Invalid productId for checkout:', productId)
          p = null
        }

        const qty = Number(intent.quantity || 1)
        if (!p) {
          payload.notes = 'Product not found for checkout.'
        } else {
          payload.confirmation = {
            product: normalizeProducts([p])[0],
            quantity: qty,
            total: (p.salePrice || p.price) * qty,
          }
          payload.notes ||= 'Confirm purchase?'
        }
      }
    }

    console.log('Final payload:', JSON.stringify(payload, null, 2))
    return res.json(payload)
  } catch (err) {
    console.error('interactive chat error', err)
    return res.status(500).json({ error: 'Interactive chat failed' })
  }
}

module.exports = { chatInteractive }
