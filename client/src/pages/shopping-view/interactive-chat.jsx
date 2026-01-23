import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'

function InteractiveChatPage() {
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Welcome to Interactive Mode. Ask me to find products or buy.',
    },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [products, setProducts] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    pincode: '',
    phone: '',
  })
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

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
        },
      )
      const data = res.data
      if (data.notes)
        setMessages((m) => [...m, { role: 'bot', content: data.notes }])
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
    <div className="w-screen h-screen bg-white flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-semibold">Interactive Chat</h1>
        <span className="text-sm">
          {isAuthenticated ? 'Signed in' : 'Guest'}
        </span>
      </div>
      <div className="flex-1 grid grid-cols-12">
        <div className="col-span-7 border-r flex flex-col">
          <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={m.role === 'bot' ? 'text-left' : 'text-right'}
              >
                <div
                  className={`inline-block px-3 py-2 rounded ${m.role === 'bot' ? 'bg-gray-100' : 'bg-blue-100'}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="text-left">
                <div className="inline-block px-3 py-2 rounded bg-gray-100">
                  ...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Ask for products, e.g. 'Show Nike shoes'"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Send
            </button>
          </div>
        </div>
        <div className="col-span-5 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Results</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.id} className="border rounded p-2">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-600">
                  {p.brand} · {p.category}
                </div>
                <div className="mt-1">
                  <span className="font-semibold">
                    ${p.salePrice || p.price}
                  </span>
                  {p.salePrice && (
                    <span className="ml-2 line-through text-gray-400">
                      ${p.price}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-700 line-clamp-3">
                  {p.description}
                </div>
                <button
                  onClick={() => addToFavorite(p.id)}
                  className="mt-2 px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                >
                  ♡ Save
                </button>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-gray-500">
                No items yet. Ask me to search.
              </div>
            )}
          </div>
          {confirmation && (
            <div className="p-4 border-t bg-gray-50">
              <div className="font-semibold">Confirm Order</div>
              <div className="text-sm">
                {confirmation.product.title} × {confirmation.quantity}
              </div>
              <div className="mt-1">Total: ${confirmation.total}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={confirmPurchase}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Yes, pay
                </button>
                <button
                  onClick={() => setConfirmation(null)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {showAddressForm && (
            <div className="p-4 border-t bg-yellow-50">
              <div className="font-semibold">Add Shipping Address</div>
              <input
                type="text"
                placeholder="Address"
                value={addressForm.address}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, address: e.target.value })
                }
                className="w-full border rounded px-2 py-1 mt-2 text-sm"
              />
              <input
                type="text"
                placeholder="City"
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
                className="w-full border rounded px-2 py-1 mt-1 text-sm"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={addressForm.pincode}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, pincode: e.target.value })
                }
                className="w-full border rounded px-2 py-1 mt-1 text-sm"
              />
              <input
                type="text"
                placeholder="Phone"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
                className="w-full border rounded px-2 py-1 mt-1 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={saveAddress}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-1 text-sm bg-gray-300 rounded"
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
