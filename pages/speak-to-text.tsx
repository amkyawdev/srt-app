'use client';

import { useState, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Speak() {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      setTranscript('');
      setError('');
    }
  }, []);

  // Handle upload and transcription
  const handleTranscribe = useCallback(async () => {
    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      setError('Please select a video file');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create FormData and append video file
      const formData = new FormData();
      formData.append('audio', file);

      // Send to API
      const response = await axios.post('/api/groq-speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.text) {
        setTranscript(response.data.text);
      } else {
        setError('No transcription returned');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.response?.data?.error || err.message || 'Transcription failed');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!transcript) return;
    
    navigator.clipboard.writeText(transcript).then(() => {
      setToastMessage('Copied to clipboard!');
      setShowToast(true);
      
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    });
  }, [transcript]);

  // Clear text
  const handleClear = useCallback(() => {
    setTranscript('');
    setError('');
    setSelectedFile('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Page entrance animations
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <Layout>
      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            'linear-gradient(135deg, #16213e 0%, #0f3460 50%, #1a1a2e 100%)',
            'linear-gradient(135deg, #0f3460 0%, #1a1a2e 50%, #16213e 100%)',
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen flex items-center justify-center px-4 py-12"
      >
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl"
        >
          {/* Page title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-8"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Speak
            </span>
          </motion.h1>

          {/* Glassmorphism card */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8"
          >
            {/* Video upload section */}
            <div className="flex flex-col items-center mb-8 py-8">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 w-full max-w-md">
                <label className="block text-sm font-medium mb-3">Upload Video</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Choose File</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="video/*,audio/*" 
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {/* Show selected file format */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm"
                >
                  Selected: {selectedFile.toUpperCase()}
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTranscribe}
                disabled={!selectedFile || isProcessing}
                className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V4a3 3 0 00-3-3H9m0 3a3 3 0 003 3v4m0-7v7m-4-7a4 4 0 014-4m0 0h4m-4 0a4 4 0 01-4-4m0 0H6m0 0V4m0 0a4 4 0 014 4m-4 4h4" />
                    </svg>
                    Speak
                  </>
                )}
              </motion.button>
            </div>

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400"
              >
                {error}
              </motion.div>
            )}

            {/* Transcript display */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Transcript
              </label>
              <div className="min-h-[160px] bg-gray-900/50 rounded-lg p-4 text-gray-200 whitespace-pre-wrap">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </div>
                ) : transcript ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {transcript}
                  </motion.span>
                ) : (
                  <span className="text-gray-500">
                    Your transcribed text will appear here...
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              {/* Clear button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClear}
                disabled={!transcript || isProcessing}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Clear
              </motion.button>

              {/* Copy button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                disabled={!transcript || isProcessing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}