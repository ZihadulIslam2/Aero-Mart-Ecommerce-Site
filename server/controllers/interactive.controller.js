const { GoogleGenerativeAI } = require('@google/generative-ai')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Address = require('../models/Address')
const Order = require('../models/Order')
const Favorite = require('../models/Favorite')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// In-memory session storage for context (userId -> last product)
const userContext = new Map()

// System instruction for tool-like JSON responses
const SYSTEM_PROMPT = `
You are Aero Mart's shopping assistant. Respond with a single JSON object only, no prose.
Schema:
{
  "intent": "search_products|show_product_details|add_to_cart|add_favorite|ensure_address|confirm_order|small_talk",
  "query": "optional search text",
  "productId": "optional product id",
  "quantity": number,
  "notes": "short natural language answer for the user (<= 40 words)",
  "params": { "category": "optional", "brand": "optional" }
}
Rules:
- Always fill intent.
- If user is browsing products, use intent=search_products and include query keywords.
- If user asks details for one product, set intent=show_product_details, include productId when possible.
- For cart add, use intent=add_to_cart with productId and quantity (default 1).
- For favorites, use intent=add_favorite with productId.
- If user wants to buy now, use intent=confirm_order with productId and quantity.
- If user says "order it" or "buy this" or "purchase this", they mean the LAST product shown. Use that productId.
- If address seems missing, use ensure_address with notes suggesting to add address in account.
- Keep notes concise.
`

async function parseAIIntent(message, userId, lastProductId) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Add context about last product if available
    let contextStr = SYSTEM_PROMPT
    if (lastProductId) {
      contextStr += `\n\nIMPORTANT: The user was just shown a product with ID: ${lastProductId}. If they say "order it", "buy this", "purchase this", use this productId.`
    }

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: contextStr + '\nUser: ' + message }],
        },
      ],
    })
    const text =
      result?.response?.text?.() ||
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '{}'

    console.log('Gemini raw response:', text)

    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    const raw = jsonStart !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text
    const parsed = JSON.parse(raw)

    console.log('Parsed intent:', parsed)
    return parsed
  } catch (e) {
    console.error('parseAIIntent error:', e.message)
    console.error('Full error:', e)
    return {
      intent: 'small_talk',
      notes: 'I can help you search and order products.',
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
    const userId = req.body.userId || req.user?.id // if auth middleware sets req.user
    const message = (req.body.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Message required' })

    console.log('User message:', message)

    // Get last product context for this user
    const lastProductId = userId ? userContext.get(userId) : null
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

      // Update notes if no products found
      if (products.length === 0) {
        payload.notes =
          "I couldn't find any matching products. Try searching with different keywords."
      }
    }

    if (intent.intent === 'show_product_details' && intent.productId) {
      const p = await Product.findById(intent.productId)
      if (p) {
        payload.product = normalizeProducts([p])[0]
        if (userId) userContext.set(userId, intent.productId)
      } else payload.notes = "I couldn't find that product."
    }

    if (intent.intent === 'add_to_cart' && intent.productId && userId) {
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
    }

    if (intent.intent === 'add_favorite' && userId && intent.productId) {
      const fav = await Favorite.findOneAndUpdate(
        { userId, productId: intent.productId },
        { userId, productId: intent.productId },
        { upsert: true, new: true },
      )
      payload.favorite = { ok: true, productId: intent.productId }
      payload.notes ||= 'Saved to your favorites.'
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
        const p = await Product.findById(productId)
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
