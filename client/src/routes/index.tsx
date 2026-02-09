import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { User } from '@/hooks/useWs'
import { useWS } from '@/hooks/useWs'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { messages, users, typingUsers, sendMessage, setTyping } = useWS(
    'ws://localhost:8080',
  )
  const [input, setInput] = useState<string>('')

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTyping = () => {
    setTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 5000)
  }

  // Send message
  const handleSend = (): void => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
    setTyping(false)
  }

  // Handle typing input
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value)
    handleTyping()
  }

  // Handle Enter key
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <h1 className="text-lg font-bold">Group Chat</h1>
        <span className="text-sm">{users.length} online</span>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg: any, idx: number) => (
          <div key={idx} className="flex">
            <div className="bg-red rounded-lg p-2 flex flex-col min-w-[200px] bg-[var(--dark)]">
              <span className="chat-message-user text-[0.7rem]">
                {msg.user?.name}
              </span>
              <span>{msg.message}</span>
              <span className="text-[0.6rem] text-white text-right">
                {new Date(msg.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="chat-typing">
            {typingUsers.map((u: User) => u.name).join(', ')} typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          placeholder="Type a message..."
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}
