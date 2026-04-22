import Groq from 'groq-sdk';

// Initialize Groq client with API key from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Create Groq client instance
export const groqClient = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Check if Groq is configured
export const isGroqConfigured = (): boolean => {
  return !!GROQ_API_KEY && !!groqClient;
};

// Get API key (for display purposes)
export const getGroqStatus = (): { configured: boolean; hasKey: boolean } => {
  return {
    configured: isGroqConfigured(),
    hasKey: !!GROQ_API_KEY,
  };
};