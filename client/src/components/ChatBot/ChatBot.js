import { useState } from 'react'
import './ChatBot.css'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
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
          <div className="chat-body">
            <p className="bot-message">
              Hello! How can I help you with your order today?
            </p>
            {/* Chat messages would go here */}
          </div>
          <div className="chat-footer">
            <input type="text" placeholder="Type a message..." />
            <button>Send</button>
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
