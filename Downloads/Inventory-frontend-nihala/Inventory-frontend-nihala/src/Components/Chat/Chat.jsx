import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

// --- UPDATED: Added unreadCount to user data ---
const usersSample = [
  { id: 1, name: 'Alice', online: true, unreadCount: 2 },
  { id: 2, name: 'Bob', online: false, unreadCount: 0 },
  { id: 3, name: 'Charlie', online: true, unreadCount: 5 },
  { id: 4, name: 'Diana', online: true, unreadCount: 0 },
];

const messagesSample = [
  { id: 1, userId: 1, text: 'Hi there!', time: '10:00 AM' },
  { id: 2, userId: 1, text: 'How are you?', time: '10:02 AM' },
];

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(usersSample[0]);
  const [messages, setMessages] = useState(messagesSample);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        userId: selectedUser.id,
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex min-h-screen bg-[#236a80]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px]">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <div className="flex flex-1 min-h-0 bg-gradient-to-br from-white to-[#f0f7fa] rounded-tl-[50px] overflow-hidden">
          
          {/* Users list */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 text-xl font-bold text-[#236a80]">
              Users
            </div>
            <ul className="flex-1 overflow-y-auto">
              {usersSample.map((user) => (
                <li
                  key={user.id}
                  // --- UPDATED: Added justify-between for badge positioning ---
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#e0f7fa] transition ${
                    selectedUser.id === user.id ? 'bg-[#d1f0fa]' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        user.online ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></span>
                    <span className="font-medium text-[#236a80]">{user.name}</span>
                  </div>

                  {/* --- NEW: Unread message count badge --- */}
                  {user.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {user.unreadCount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
              <span className="font-semibold text-lg text-[#236a80]">{selectedUser.name}</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  selectedUser.online ? 'bg-green-400' : 'bg-gray-400'
                }`}
              ></span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-white to-[#f0f7fa]">
              {messages
                .filter((msg) => msg.userId === selectedUser.id)
                .map((msg) => (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="bg-[#236a80] text-white px-4 py-2 rounded-2xl rounded-br-none max-w-xs shadow-md">
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
                  </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#236a80] bg-gradient-to-r from-white to-[#f0f7fa] shadow-sm"
              />
              <button
                type="submit"
                className="bg-[#236a80] text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-[#1d5566] transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;