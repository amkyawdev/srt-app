import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

type ResponseData = {
  text?: string;
  error?: string;
};

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  try {
    // Initialize Groq client
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // Parse the multipart form data
    const form = new IncomingForm({
      multiples: false,
      uploadDir: os.tmpdir(),
      keepExtensions: true,
    });

    const result = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    const audioFile = result.files?.audio;
    
    if (!audioFile || (Array.isArray(audioFile) && audioFile.length === 0)) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Get the file path
    const filePath = Array.isArray(audioFile) ? audioFile[0].filepath : audioFile.filepath;
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Audio file not found' });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Transcribe using Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: new File([fileBuffer], fileName, { type: 'audio/webm' }),
      model: 'whisper-large-v3',
      response_format: 'json',
      language: 'en',
    });

    // Clean up temp file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // Ignore cleanup error
    }

    return res.status(200).json({ text: transcription.text || '' });
  } catch (error) {
    console.error('Speech to text error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Transcription failed' 
    });
  }
}