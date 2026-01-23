import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Send, Heart, X, ArrowLeft } from 'lucide-react'

function InteractiveChatPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        '👋 Welcome! I can help you find products, add to cart, and complete purchases. What are you looking for today?',
    },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [products, setProducts] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  )
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    pincode: '',
    phone: '',
  })
  const chatBodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function sendMessage() {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages((m) => [...m, userMsg])
    setPending(true)
    try {
      const res = await axios.post(
        'http://localhost:5000/api/chat/interactive',
        {
          message: input,
          userId: user?._id,
          sessionId: sessionId,
        },
      )
      const data = res.data
      // Add bot response (use notes, or provide default if empty)
      const botResponse =
        data.notes || 'Processing your request. Let me search for that.'
      setMessages((m) => [...m, { role: 'bot', content: botResponse }])
      setProducts(data.products || [])
      setConfirmation(data.confirmation || null)
      if (data.promptAddress) {
        setShowAddressForm(true)
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'bot', content: 'Sorry, something went wrong.' },
      ])
    } finally {
      setPending(false)
      setInput('')
    }
  }

  async function confirmPurchase() {
    if (!confirmation) return
    const item = confirmation.product
    try {
      const res = await axios.post(
        'http://localhost:5000/api/payment/stripe/create-checkout-session',
        {
          items: [
            {
              name: item.title,
              price: item.salePrice || item.price,
              quantity: confirmation.quantity,
            },
          ],
          user: { id: user?._id },
        },
      )
      if (res.data?.url) {
        globalThis.location.href = res.data.url
      }
    } catch (err) {
      console.error(err)
      setMessages((m) => [
        ...m,
        { role: 'bot', content: 'Could not start checkout.' },
      ])
    }
  }

  async function saveAddress() {
    if (
      !addressForm.address ||
      !addressForm.city ||
      !addressForm.pincode ||
      !addressForm.phone
    ) {
      setMessages((m) => [
        ...m,
        { role: 'bot', content: 'Please fill all address fields.' },
      ])
      return
    }

    try {
      await axios.post('http://localhost:5000/api/shop/address/add', {
        ...addressForm,
        userId: user?._id,
      })
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          content: 'Address saved! Now you can proceed with checkout.',
        },
      ])
      setShowAddressForm(false)
      setAddressForm({ address: '', city: '', pincode: '', phone: '' })
    } catch (err) {
      console.error(err)
      setMessages((m) => [
        ...m,
        { role: 'bot', content: 'Failed to save address.' },
      ])
    }
  }

  async function addToFavorite(productId) {
    try {
      await axios.post('http://localhost:5000/api/shop/favorites/add', {
        productId,
        userId: user?._id,
      })
      setMessages((m) => [
        ...m,
        { role: 'bot', content: 'Added to favorites!' },
      ])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/shop/home')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Shopping Assistant
              </h1>
              <p className="text-sm text-gray-500">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                {isAuthenticated
                  ? `👤 ${user?.userName || 'User'}`
                  : '👤 Guest'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="w-[55%] flex flex-col bg-white border-r">
          {/* Messages */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((m, idx) => (
              <div
                key={`msg-${idx}`}
                className={`flex ${m.role === 'bot' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                    m.role === 'bot'
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 rounded-tl-sm'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="bg-blue-50 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={pending}
                className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Ask me anything... e.g., 'Show Nike shoes' or 'I want to buy'"
              />
              <button
                onClick={sendMessage}
                disabled={pending || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="font-medium">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-[45%] flex flex-col bg-gray-50">
          {/* Results Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  <ShoppingBag className="w-5 h-5 inline mr-2" />
                  Products
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {products.length} {products.length === 1 ? 'item' : 'items'}{' '}
                  found
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden group"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      {(p.image || (p.images && p.images[0])) && (
                        <div className="w-28 h-28 flex-shrink-0">
                          <img
                            src={p.image || p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
                          {p.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.brand} • {p.category}
                        </p>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${p.salePrice || p.price}
                          </span>
                          {p.salePrice && (
                            <span className="text-sm line-through text-gray-400">
                              ${p.price}
                            </span>
                          )}
                          {p.salePrice && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                              Save ${(p.price - p.salePrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {p.description}
                        </p>

                        <button
                          onClick={() => addToFavorite(p.id)}
                          className="mt-3 px-3 py-1.5 text-xs font-medium bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition flex items-center gap-1"
                        >
                          <Heart className="w-3 h-3" />
                          Save to Favorites
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No products yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Start by asking me to search for products
                </p>
              </div>
            )}
          </div>
          {/* Confirmation Panel */}
          {confirmation && (
            <div className="border-t bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Confirm Purchase
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Review your order before payment
                  </p>
                </div>
                <button
                  onClick={() => setConfirmation(null)}
                  className="p-1 hover:bg-white rounded-full transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">
                    {confirmation.product.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    ×{confirmation.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${confirmation.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmPurchase}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition shadow-md hover:shadow-lg"
                >
                  ✓ Proceed to Payment
                </button>
                <button
                  onClick={() => setConfirmation(null)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Address Form */}
          {showAddressForm && (
            <div className="border-t bg-gradient-to-br from-yellow-50 to-amber-50 p-6 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Shipping Address
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    We need your address to deliver
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="p-1 hover:bg-white rounded-full transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressForm.address}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={saveAddress}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InteractiveChatPage
