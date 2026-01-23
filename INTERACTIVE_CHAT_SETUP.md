# Interactive AI Chat Feature - Setup & Testing Guide

## Overview

You now have a fully integrated **Interactive Chat Mode** where customers can:

- 🔍 Search for products via natural language (powered by Gemini free preview API)
- 📦 View product details with images, prices, and descriptions
- ❤️ Save favorite products
- 🛒 Add items to cart directly from chat
- 💳 Confirm and checkout via Stripe
- 📧 Receive order confirmation emails
- 📍 Add shipping address when needed

---

## Architecture

### Backend Services

1. **Gemini Free Preview API** - Natural language intent parsing
2. **Stripe Checkout** - Payment processing
3. **Nodemailer** - Order confirmation emails
4. **MongoDB** - Store products, orders, favorites, addresses

### Key Files Created/Modified

**Server (Node.js/Express)**

- `server/controllers/interactive.controller.js` - AI orchestration & intent handling
- `server/controllers/payment/stripe-controller.js` - Stripe sessions & webhooks
- `server/models/Favorite.js` - User favorites model
- `server/controllers/shop/favorites-controller.js` - Favorite CRUD operations
- `server/routes/shop/favorites-routes.js` - Favorite endpoints
- `server/routes/payment/stripe-routes.js` - Stripe endpoints
- `server/routes/chat.route.js` - Updated with interactive chat endpoint

**Client (React)**

- `client/src/pages/shopping-view/interactive-chat.jsx` - Full-screen chat UI
- `client/src/components/ChatBot/ChatBot.jsx` - Updated with "Full Screen" button
- `client/src/App.jsx` - Added `/shop/interactive` route

---

## Environment Configuration

### Server Setup

Create `server/.env`:

```env
# Database
MONGO_URL=mongodb://localhost:27017/aero-mart

# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# Gemini API (Free Preview)
GEMINI_API_KEY=your_gemini_api_key_here

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Optional - for order confirmation)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=no-reply@aeromart.com
```

### How to Get API Keys

**Gemini API Key:**

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key in your Google Cloud project
4. Copy and paste into `GEMINI_API_KEY`

**Stripe Keys:**

1. Create a [Stripe Account](https://stripe.com)
2. Go to Dashboard → Developers → API Keys
3. Copy Publishable & Secret keys
4. For webhooks, set up endpoint at `/api/payment/stripe/webhook`

**Gmail SMTP (Optional):**

1. Enable 2-factor authentication on your Gmail
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the 16-character password in `SMTP_PASS`

---

## Installation & Running

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev
# Output: Server is now running on port 5000
#         MongoDB connected

# Terminal 2: Start frontend
cd client
npm run dev
# Output: VITE v5.4.8 ready in 273 ms
#         ➜  Local:   http://localhost:5173/
```

### 3. Access the App

- **Main Site:** http://localhost:5173
- **Interactive Chat:** http://localhost:5173/shop/interactive
- **Chat Widget:** Bottom-right corner on any page (click "💬" bubble)

---

## Testing End-to-End Flow

### Scenario 1: Search for Products

1. Navigate to `/shop/interactive`
2. Message: `"Show me Nike shoes"`
3. **Expected:** Product cards appear on the right panel with search results
4. Try other queries:
   - `"Find Adidas clothing"`
   - `"Show women's clothes"`
   - `"What do you have in stock?"`

### Scenario 2: Save Favorites

1. In results panel, click "♡ Save" on any product
2. **Expected:** Chat shows "Added to favorites!"
3. Favorites are saved in DB (visit `/api/shop/favorites/list` to verify)

### Scenario 3: Add to Cart

1. Message: `"Add Nike Air Max to my cart"`
2. **Expected:** Chat confirms "Added to your cart."
3. Item is in MongoDB Cart collection

### Scenario 4: Purchase Flow (Full)

1. Ensure you're logged in (or sign up first at `/auth/login`)
2. Message: `"I want to buy the Nike shoes"`
3. **Expected:** Confirmation panel appears with product & price
4. Click "Yes, pay"
5. **Expected:** Redirects to Stripe Checkout test page

**At Stripe Checkout:**

- Use test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/26`)
- CVC: Any 3 digits (e.g., `123`)
- Click "Pay"

**After Payment:**

- ✅ Redirects to `/shop/payment-success`
- ✅ Order created in MongoDB
- ✅ Email sent (if SMTP is configured)

### Scenario 5: Address Collection

1. If you haven't added an address before, during checkout:
2. Chat prompts: `"Please add a shipping address. I can help you save one now."`
3. Address form appears in the results panel
4. Fill in fields:
   - Address: `123 Main St`
   - City: `New York`
   - Pincode: `10001`
   - Phone: `+1-555-0123`
5. Click "Save Address"
6. **Expected:** Confirmed and ready for next checkout

---

## API Endpoints Overview

### Chat Endpoints

- `POST /api/chat` - Original chat (Ollama-based)
- `POST /api/chat/interactive` - **New** Gemini-powered interactive mode

### Favorites Endpoints

- `POST /api/shop/favorites/add` - Add favorite
- `DELETE /api/shop/favorites/remove/:favoriteId` - Remove
- `GET /api/shop/favorites/list` - List user's favorites
- `GET /api/shop/favorites/check/:productId` - Check if product is favorited

### Payment Endpoints

- `POST /api/payment/stripe/create-checkout-session` - Create Stripe session
- `POST /api/payment/stripe/webhook` - Webhook for order finalization

### Existing Shop Endpoints (Integrated)

- `GET /api/shop/products` - List all products
- `GET /api/shop/search/:keyword` - Search products
- `POST /api/shop/cart` - Manage cart
- `POST /api/shop/address/add` - Add address
- `GET /api/shop/address/get/:userId` - Get addresses

---

## Intent Parsing (AI Behavior)

The Gemini API understands these **intents** from user messages:

| Intent                 | Example Message                       | Response                        |
| ---------------------- | ------------------------------------- | ------------------------------- |
| `search_products`      | "Show Nike shoes"                     | Returns product cards           |
| `show_product_details` | "Tell me about the blue shirt"        | Shows single product details    |
| `add_to_cart`          | "Add this to my cart"                 | Adds item, confirms             |
| `add_favorite`         | "Save this" / "I like this"           | Adds to favorites               |
| `confirm_order`        | "I want to buy this" / "Checkout"     | Shows confirmation panel        |
| `ensure_address`       | Automatically checked before checkout | Prompts address form if missing |
| `small_talk`           | "Hello" / "How are you?"              | Friendly response               |

---

## Troubleshooting

### Issue: "EADDRINUSE: address already in use :::5000"

**Solution:** Another process is using port 5000

```bash
# Kill the process
pkill -f "node server.js"

# Or specify a different port
PORT=5001 npm run dev
```

### Issue: "Gemini API key not found"

**Solution:** Make sure `GEMINI_API_KEY` is set in `server/.env`

```bash
# Test if env loads
grep GEMINI_API_KEY server/.env
```

### Issue: "Cannot find module '@google/generative-ai'"

**Solution:** Reinstall dependencies

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Stripe session creation failed"

**Solution:** Check `STRIPE_SECRET_KEY` is set correctly

```bash
# Verify it starts with sk_test_
grep STRIPE_SECRET_KEY server/.env
```

### Issue: Chat returns "Sorry, something went wrong"

**Solution:** Check server logs for errors

```bash
# Look for "interactive chat error" in server output
tail -f /tmp/server.log
```

---

## Performance & Security Notes

✅ **What's Implemented:**

- Intent-based architecture reduces AI inference cost
- Favorites indexed for fast queries
- Orders persist with payment status
- Webhook verification for Stripe events

⚠️ **Next Steps (Optional Enhancements):**

- Add rate limiting on chat endpoint
- Implement request/response caching
- Add user input validation & sanitization
- Enable HTTPS for production
- Set up error monitoring (Sentry, etc.)
- Implement SSE for streaming chat responses
- Add rich HTML email templates

---

## File Structure Summary

```
Aero-Mart-Ecommerce-Site/
├── server/
│   ├── controllers/
│   │   ├── interactive.controller.js (NEW)
│   │   └── payment/
│   │       └── stripe-controller.js (NEW)
│   │   └── shop/
│   │       └── favorites-controller.js (NEW)
│   ├── models/
│   │   └── Favorite.js (NEW)
│   ├── routes/
│   │   ├── chat.route.js (UPDATED)
│   │   ├── payment/
│   │   │   └── stripe-routes.js (NEW)
│   │   └── shop/
│   │       └── favorites-routes.js (NEW)
│   ├── server.js (UPDATED)
│   └── package.json (UPDATED)
│
└── client/
    └── src/
        ├── pages/shopping-view/
        │   └── interactive-chat.jsx (NEW)
        ├── components/ChatBot/
        │   └── ChatBot.jsx (UPDATED)
        └── App.jsx (UPDATED)
```

---

## Summary

🎉 **Your interactive AI chat is ready!**

The system now supports:

- ✅ Natural language product search via Gemini
- ✅ Real-time product rendering in chat
- ✅ Save favorites with heart button
- ✅ Stripe Checkout integration
- ✅ Automatic address collection prompts
- ✅ Order confirmation workflow
- ✅ Email notifications (when SMTP configured)

**Start testing:** Navigate to http://localhost:5173/shop/interactive and try asking for products!

---

For questions or issues, check the troubleshooting section or review server logs.
