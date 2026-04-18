import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const translateText = async (text: string, targetLang: string, sourceLang: string = 'auto') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/translate`, {
      text,
      target_lang: targetLang,
      source_lang: sourceLang
    });
    return response.data;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

export const getBotResponse = async (message: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bot`, { message });
    return response.data;
  } catch (error) {
    console.error('Bot error:', error);
    throw error;
  }
};