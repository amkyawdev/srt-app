import os
import google.generativeai as genai
from groq import Groq
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import re

app = FastAPI()

# Configure APIs
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Initialize clients
gemini_model = None
groq_client = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception:
        pass

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        pass

class TranslateRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: Optional[str] = "auto"
    file_name: Optional[str] = ""

def is_valid_srt(text: str) -> bool:
    # SRT format စစ်ဆေးခြင်း (Sequence number နှင့် Timestamps ပါဝင်မှုကို Regex ဖြင့်စစ်သည်)
    srt_pattern = r'^\d+\s*\n\d{2}:\d{2}:\d{2}'
    return bool(re.search(srt_pattern, text.strip()))

# --- Translation Logic (Primarily using Gemini) ---

def translate_with_gemini(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not gemini_model:
        raise Exception("Gemini not configured")
    
    prompt = (
        f"You are a professional SRT translator. Translate the following text from {source_lang} to {target_lang}. "
        f"Maintain the exact SRT structure, sequence numbers, and timestamps. "
        f"Only return the translated SRT content:\n\n{text}"
    )
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    # SRT File Extension နှင့် Format စစ်ဆေးခြင်း
    if (request.file_name and not request.file_name.lower().endswith('.srt')) or not is_valid_srt(request.text):
        raise HTTPException(
            status_code=400, 
            detail="Srt file သာထည့်ပါ ၊ srt file format မှားနေပါတယ်"
        )

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API is not configured")
    
    try:
        # Translation အတွက် Gemini ကို တိုက်ရိုက်သုံးသည်
        result = translate_with_gemini(request.text, request.target_lang, request.source_lang)
        return {"translated_text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# --- Bot Logic (Using Groq Qwen-3) ---

@app.post("/api/bot")
async def bot_response(query: dict):
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API is not configured")
    
    try:
        # Chat Bot အတွက် Qwen 3 (32B) ကို အသုံးပြုသည်
        completion = groq_client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant. Answer concisely and avoid repetition."},
                {"role": "user", "content": query.get("message", "")}
            ],
            temperature=0.7,
            top_p=0.9,
            frequency_penalty=0.6 # စာသားထပ်ခြင်းမှ ကာကွယ်ရန်
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bot Error: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "translation_engine": "Gemini 1.5 Flash",
        "bot_engine": "Qwen 3 32B (Groq)",
        "gemini_ready": bool(GEMINI_API_KEY),
        "groq_ready": bool(GROQ_API_KEY)
    }
