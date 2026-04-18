import { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { WaveAnimation } from '../components/WaveAnimation';
import { motion } from 'framer-motion';
import axios from 'axios';

interface SRTEntry {
  index: number;
  timecode: string;
  text: string;
}

export default function Translate() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [fileName, setFileName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseSRT = (content: string): SRTEntry[] => {
    const entries: SRTEntry[] = [];
    const blocks = content.trim().split(/\n\n+/);
    
    blocks.forEach((block) => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const index = parseInt(lines[0]);
        const timecode = lines[1];
        const text = lines.slice(2).join('\n');
        entries.push({ index, timecode, text });
      }
    });
    return entries;
  };

  const generateSRT = (entries: SRTEntry[]): string => {
    return entries.map(entry => 
      `${entry.index}\n${entry.timecode}\n${entry.text}\n`
    ).join('\n');
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSourceText(content);
    };
    reader.readAsText(file);
  }, []);

  const handleDownload = () => {
    if (!translatedText) return;
    
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const outputFileName = fileName.replace('.srt', '') + '_translated.srt';
    a.download = outputFileName || 'translated.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testAPI = async () => {
    setError('');
    try {
      const response = await axios.post('/api/translate', {
        text: 'Hello',
        target_lang: 'my',
        source_lang: 'en'
      });
      alert(`API Working! Response: ${response.data.translated_text}`);
    } catch (err: any) {
      setError(`API Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setLoading(true);
    setIsTranslating(true);
    setElapsedTime(0);
    setProgress(0);
    setError('');
    setTranslatedText('');
    
    try {
      const isSRT = sourceText.includes('\n\n') && /^\d+$/.test(sourceText.trim().split('\n')[0]);
      
      if (isSRT) {
        const entries = parseSRT(sourceText);
        const translatedEntries: SRTEntry[] = [];
        const total = entries.length;
        
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          try {
            const response = await axios.post('/api/translate', {
              text: entry.text,
              target_lang: targetLang,
              source_lang: 'auto'
            });
            translatedEntries.push({
              ...entry,
              text: response.data.translated_text
            });
          } catch (err) {
            translatedEntries.push(entry);
          }
          // Update progress
          setProgress(Math.round(((i + 1) / total) * 100));
        }
        
        setTranslatedText(generateSRT(translatedEntries));
      } else {
        const response = await axios.post('/api/translate', {
          text: sourceText,
          target_lang: targetLang,
          source_lang: 'auto'
        });
        
        const words = response.data.translated_text.split(' ');
        for (let i = 0; i <= words.length; i++) {
          setTimeout(() => {
            setTranslatedText(words.slice(0, i).join(' '));
          }, i * 50);
        }
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(`Translation Error: ${err.response?.data?.detail || err.message}`);
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
          {/* API Test Button */}
          <div className="flex justify-end">
            <button
              onClick={testAPI}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test API
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          {/* File Upload Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <label className="block text-sm font-medium mb-3">Upload SRT File</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Choose File</span>
                <input 
                  type="file" 
                  accept=".srt" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <span className="text-gray-400 text-sm">{fileName}</span>
              )}
            </div>
          </div>

          {/* Source Text Area */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <label className="block text-sm font-medium mb-2">Source Text</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter text to translate or upload SRT file..."
            />
          </div>

          {/* Language Selector */}
          <div className="flex flex-wrap gap-4 items-center">
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
              disabled={loading || !sourceText.trim()}
              className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Translating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Translate
                </>
              )}
            </button>
          </div>

          {/* Timer & Progress */}
          {loading && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-gray-400">{formatTime(elapsedTime)}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-center">
                <WaveAnimation />
              </div>
            </div>
          )}

          {/* Translated Text */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Translated Text</label>
              {translatedText && (
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded-lg text-sm flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              )}
            </div>
            <div className="min-h-[160px] bg-gray-900 rounded-lg p-3 text-gray-200 whitespace-pre-wrap">
              {translatedText || (loading ? <WaveAnimation /> : 'Translation will appear here...')}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}