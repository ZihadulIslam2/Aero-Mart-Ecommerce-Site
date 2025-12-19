import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './ChatBot.css'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'bot',
      content: 'Hello! How can I help you with your order today?',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const chatBodyRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [chatHistory])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const newMessage = { role: 'user', content: message }
    setChatHistory((prevHistory) => [...prevHistory, newMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: message,
      })

      const botReply = { role: 'bot', content: response.data.reply }
      setChatHistory((prevHistory) => [...prevHistory, botReply])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorReply = {
        role: 'bot',
        content:
          'Sorry, I am having trouble connecting. Please try again later.',
      }
      setChatHistory((prevHistory) => [...prevHistory, errorReply])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Support Chat</span>
            <button className="close-btn" onClick={toggleChat}>
              &times;
            </button>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-message ${
                  chat.role === 'bot' ? 'bot-message' : 'user-message'
                }`}
              >
                <p>{chat.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot-message">
                <p>...</p>
              </div>
            )}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Icon Button */}
      <button className="chat-toggle-btn" onClick={toggleChat}>
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default ChatBot
