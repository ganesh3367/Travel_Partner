import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ChatBox({ messages, onSend, selfId, isTyping, onTyping }) { 
  const [message, setMessage] = useState(''); 
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='flex flex-col h-full bg-white/50 backdrop-blur-sm'>
      <div className='flex-1 overflow-x-hidden overflow-y-auto p-4 space-y-4 pt-6'>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300" />
            <p>Say hello! Start the conversation.</p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble 
              key={m._id || m.timestamp} 
              self={m.senderId === selfId} 
              message={m.message} 
              timestamp={m.timestamp} 
            />
          ))
        )}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl rounded-bl-none w-max shadow-sm border border-gray-100 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] relative z-10">
        <form 
          className='flex gap-3 max-w-4xl mx-auto items-end' 
          onSubmit={(e) => {
            e.preventDefault(); 
            if (!message.trim()) return; 
            onSend(message); 
            setMessage('');
            if (onTyping) onTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          }}
        >
          <div className="relative flex-1">
            <input 
              className='input w-full pr-12 py-3.5 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors' 
              value={message} 
              onChange={(e) => {
                setMessage(e.target.value);
                if (onTyping) {
                  onTyping(true);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
                }
              }} 
              placeholder='Type your message...' 
              autoComplete="off"
            />
          </div>
          <button 
            type="submit"
            disabled={!message.trim()}
            className='btn-primary shrink-0 w-12 h-12 !p-0 flex items-center justify-center rounded-2xl shadow-primary-500/20 shadow-lg disabled:opacity-50 disabled:shadow-none transition-all'
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -mr-1">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  ); 
}
