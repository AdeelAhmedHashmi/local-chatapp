"use client"

import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { User } from '@/hooks/useWs'
import { useWS } from '@/hooks/useWs'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    connected,
    setTyping,
    connect,
    username,
  } = useWS()

  const [input, setInput] = useState<string>('')
  const [open, setOpen] = useState<boolean>(true)
  const host = new URL(window.location.href).hostname;
  const url = host.replace(/\./g, " ");
  const [serverUrl, setServerUrl] = useState(url)

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

  const handleSave = () => {
    connect(serverUrl)
    setOpen(false)
  }

  return (
    <div className="chat-container">
      {/* Setting PopUp  */}
      {open && (
        <div className="h-full w-full absolute flex align-center justify-center">
          <div className="right-5 w-72 inline-block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white rounded-xl shadow-2xl border border-[var(--secondary-color)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--secondary-color)]">
              <span className="font-semibold tracking-wide">WellCome</span>
              <button
                className="text-zinc-400 hover:text-white transition"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-400">Server Host </span>
                <input
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="192 168 1 17"
                  className="bg-zinc-800 border border-[var(--secondary-color)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </label>

              <button
                onClick={handleSave}
                className="w-full bg-[var(--primary-color)] hover:bg-[var(--secondary-color)]/80 transition rounded-md py-2 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="chat-header">
        <div className="flex flex-col">
          <span className="text-lg font-bold">Localia</span>
          <span className="text-xs">{username}</span>
          <div
            className={`absolute bg-[var(--bg-color)] left-22 h-2 rounded-full w-2 translate-y-2 -translate-x-2 ${connected ? 'bg-blue-900' : 'bg-red-900'} uppercase font-bold`}
          ></div>
        </div>
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
          <svg
            stroke="currentColor"
            fill="none"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            height="20px"
            width="20px"
            xmlns="http://www.w3.org/2000/svg"
            data-darkreader-inline-stroke=""
          >
            <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z"></path>
            <path d="M6.5 12h14.5"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
