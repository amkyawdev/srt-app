import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export const FloatingBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/bot', { message: input });
      const botMessage = { role: 'assistant', content: response.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Bot error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-2xl z-50 border border-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>

      {/* Dialog Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-gray-900 rounded-xl shadow-2xl z-50 border border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
              <h3 className="font-semibold">🤖 AI Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-gray-400">Typing...</div>}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button onClick={sendMessage} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};