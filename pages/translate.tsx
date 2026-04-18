import { useState } from 'react';
import Layout from '../components/Layout';
import { WaveAnimation } from '../components/WaveAnimation';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Translate() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setLoading(true);
    setIsTranslating(true);
    
    try {
      const response = await axios.post('/api/translate', {
        text: sourceText,
        target_lang: targetLang,
        source_lang: 'auto'
      });
      
      // Animate the translated text word by word
      const words = response.data.translated_text.split(' ');
      for (let i = 0; i <= words.length; i++) {
        setTimeout(() => {
          setTranslatedText(words.slice(0, i).join(' '));
        }, i * 50);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsTranslating(false), 1000);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          SRT Translator
        </motion.h1>

        <div className="space-y-6">
          {/* Source Text Area */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <label className="block text-sm font-medium mb-2">Source Text</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter text to translate..."
            />
          </div>

          {/* Language Selector */}
          <div className="flex gap-4 items-center">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="my">Myanmar</option>
              <option value="th">Thai</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
            
            <button
              onClick={handleTranslate}
              disabled={loading}
              className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Translating...' : 'Translate'}
            </button>
          </div>

          {/* Wave Animation while translating */}
          {isTranslating && (
            <div className="flex justify-center py-8">
              <WaveAnimation />
            </div>
          )}

          {/* Translated Text */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <label className="block text-sm font-medium mb-2">Translated Text</label>
            <div className="min-h-[160px] bg-gray-900 rounded-lg p-3 text-gray-200">
              {translatedText || (loading ? <WaveAnimation /> : 'Translation will appear here...')}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}