import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MicrophoneButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function MicrophoneButton({ 
  isRecording, 
  onClick, 
  disabled = false 
}: MicrophoneButtonProps) {
  const [pulseScale, setPulseScale] = useState(1);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.1 : 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setPulseScale(1);
    }
  }, [isRecording]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple effect when recording */}
      {isRecording && (
        <motion.div
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ 
            scale: 2, 
            opacity: 0 
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute w-24 h-24 rounded-full bg-red-500/30"
        />
      )}
      
      {/* Second ripple */}
      {isRecording && (
        <motion.div
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ 
            scale: 2.2, 
            opacity: 0 
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.5,
          }}
          className="absolute w-24 h-24 rounded-full bg-red-500/20"
        />
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isRecording ? pulseScale : 1,
        }}
        className={`
          relative z-10 w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${disabled 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50 shadow-lg' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/50 shadow-lg'
          }
        `}
      >
        {/* Microphone icon */}
        <svg
          className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-white'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isRecording ? (
            // Stop icon (square)
            <motion.path
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1v4a1 1 0 01-2 0v-4a1 1 0 011-1z"
            />
          ) : (
            // Mic icon
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V4a3 3 0 00-3-3H9m0 3a3 3 0 003 3v4m0-7v7m-4-7a4 4 0 014-4m0 0h4m-4 0a4 4 0 01-4-4m0 0H6m0 0V4m0 0a4 4 0 014 4m-4 4h4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 1a2 2 0 012 2v5a2 2 0 01-4 0V3a2 2 0 012-2z"
              />
            </>
          )}
        </svg>
      </motion.button>

      {/* Recording indicator text */}
      {isRecording && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 text-red-400 text-sm font-medium"
        >
          Recording...
        </motion.p>
      )}
    </div>
  );
}