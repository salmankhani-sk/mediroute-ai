'use client';

import { useState, useRef, useEffect } from 'react';
import { medicalChatbot } from '@/app/actions/ai';
import { saveChatMessage, getChatHistory } from '@/app/actions/chat';
import { FaRobot } from 'react-icons/fa6';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am MediBot, your AI medical assistant for Peshawar. I can help you with:\n\n- Understanding common symptoms\n- Health tips and preventive care\n- Guidance on which specialist to see\n- General medical questions\n\nIMPORTANT: I am NOT a doctor. For emergencies, call 1122 or visit the nearest hospital ER.\n\nHow can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history from DB on mount
  useEffect(() => {
    (async () => {
      const history = await getChatHistory();
      if (history.length > 0) setMessages(prev => [...prev, ...history]);
      setHistoryLoaded(true);
    })();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const userMessage: Message = { role: 'user', content: userMsg };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    await saveChatMessage('user', userMsg);

    try {
      const reply = await medicalChatbot(userMsg, messages);
      const assistantMessage: Message = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMessage]);
      await saveChatMessage('assistant', reply);
    } catch {
      const errMsg: Message = { role: 'assistant', content: 'Sorry, I am having trouble. Please try again.' };
      setMessages(prev => [...prev, errMsg]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-130px)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-2"><FaRobot className="inline w-7 h-7 mr-2 text-primary-600" />MediBot AI Assistant</h1>
      <p className="text-gray-500 text-sm mb-6">Ask health questions — our AI responds instantly using Groq.</p>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your health question... (English or Roman Urdu)"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading} />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
