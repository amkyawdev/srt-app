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
    file_name: Optional[str] = "" # ဖိုင်အမည် စစ်ရန် ထည့်ထားသည်

def is_valid_srt(text: str) -> bool:
    # SRT format ဟုတ်မဟုတ် အခြေခံ စစ်ဆေးခြင်း (Sequence number ပါသလား စစ်သည်)
    srt_pattern = r'^\d+\s*\n\d{2}:\d{2}:\d{2}'
    return bool(re.search(srt_pattern, text.strip()))

def translate_with_gemini(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not gemini_model:
        raise Exception("Gemini not configured")
    
    prompt = f"Translate the following SRT content from {source_lang} to {target_lang}. Keep the SRT timestamps and numbers exactly as they are:\n\n{text}"
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

def translate_with_groq(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not groq_client:
        raise Exception("Groq not configured")
    
    lang_map = {'en': 'English', 'my': 'Burmese', 'th': 'Thai', 'zh': 'Chinese', 'ja': 'Japanese'}
    target = lang_map.get(target_lang, target_lang)
    source = lang_map.get(source_lang, source_lang) if source_lang != 'auto' else 'auto'
    
    prompt = f"Translate this SRT content to {target}. Keep timestamps and formatting:\n\n{text}"
    completion = groq_client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b", # စာမထပ်အောင် ဒီ model ပြောင်းထားပေးသည်
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3, # SRT အတွက် တိကျအောင် temp လျှော့ထားသည်
        frequency_penalty=0.5
    )
    return completion.choices[0].message.content

def translate_with_fallback(text: str, target_lang: str, source_lang: str = "auto") -> str:
    errors = []
    
    if gemini_model:
        try:
            return translate_with_gemini(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"Gemini: {str(e)}")
    
    if groq_client:
        try:
            return translate_with_groq(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"Groq: {str(e)}")
    
    raise Exception(f"All translation APIs failed: {' | '.join(errors)}")

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    # ၁။ ဖိုင်အမျိုးအစား စစ်ဆေးခြင်း
    if request.file_name and not request.file_name.lower().endswith('.srt'):
        raise HTTPException(status_code=400, detail="Srt file သာထည့်ပါ ၊ srt file format မှားနေပါတယ်")
    
    # ၂။ SRT Content ဟုတ်မဟုတ် format စစ်ဆေးခြင်း
    if not is_valid_srt(request.text):
        raise HTTPException(status_code=400, detail="Srt file သာထည့်ပါ ၊ srt file format မှားနေပါတယ်")

    if not any([GEMINI_API_KEY, GROQ_API_KEY]):
        raise HTTPException(status_code=500, detail="No translation API configured")
    
    try:
        result = translate_with_fallback(request.text, request.target_lang, request.source_lang)
        return {"translated_text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.post("/api/bot")
async def bot_response(query: dict):
    if groq_client:
        try:
            completion = groq_client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": query.get("message", "")}],
                temperature=0.7
            )
            return {"reply": completion.choices[0].message.content}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Bot API failed: {str(e)}")
    
    raise HTTPException(status_code=500, detail="No bot API configured")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY)
    }
    
