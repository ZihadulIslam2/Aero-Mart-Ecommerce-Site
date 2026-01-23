const { GoogleGenerativeAI } = require('google-generativeai')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Address = require('../models/Address')
const Order = require('../models/Order')

// Simple favorites model placeholder (optional)
// If you plan full favorites, create a dedicated model and routes.

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
- If address seems missing, use ensure_address with notes suggesting to add address in account.
- Keep notes concise.
`

async function parseAIIntent(message) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT + '\nUser: ' + message }],
        },
      ],
    })
    const text =
      result?.response?.text?.() ||
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '{}'
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    const raw = jsonStart !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text
    const parsed = JSON.parse(raw)
    return parsed
  } catch (e) {
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
    images: p.images || [],
    stock: p.totalStock,
  }))
}

async function chatInteractive(req, res) {
  try {
    const userId = req.body.userId || req.user?.id // if auth middleware sets req.user
    const message = (req.body.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Message required' })

    const intent = await parseAIIntent(message)

    // Default response payload
    const payload = { notes: intent.notes || '', intent: intent.intent }

    if (intent.intent === 'search_products') {
      const keyword = intent.query || ''
      const filters = {}
      if (intent.params?.category) filters.category = intent.params.category
      if (intent.params?.brand) filters.brand = intent.params.brand
      const regex = keyword ? new RegExp(keyword, 'i') : null
      const q = {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.brand ? { brand: filters.brand } : {}),
        ...(regex
          ? {
              $or: [
                { title: regex },
                { description: regex },
                { brand: regex },
                { category: regex },
              ],
            }
          : {}),
      }
      const products = await Product.find(q).limit(12)
      payload.products = normalizeProducts(products)
    }

    if (intent.intent === 'show_product_details' && intent.productId) {
      const p = await Product.findById(intent.productId)
      if (p) payload.product = normalizeProducts([p])[0]
      else payload.notes = "I couldn't find that product."
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
      // Placeholder: respond success; implement Favorites model later
      payload.favorite = { ok: true, productId: intent.productId }
      payload.notes ||= 'Saved to your favorites.'
    }

    if (intent.intent === 'ensure_address' && userId) {
      const addresses = await Address.find({ userId })
      payload.addressPresent = addresses.length > 0
      if (!payload.addressPresent) {
        payload.notes ||= 'Please add a shipping address in your account.'
      } else {
        payload.notes ||= 'Your address is on file.'
      }
    }

    if (intent.intent === 'confirm_order' && userId && intent.productId) {
      const p = await Product.findById(intent.productId)
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

    return res.json(payload)
  } catch (err) {
    console.error('interactive chat error', err)
    return res.status(500).json({ error: 'Interactive chat failed' })
  }
}

module.exports = { chatInteractive }
