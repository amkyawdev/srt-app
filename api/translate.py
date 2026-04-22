import os
import google.generativeai as genai
from groq import Groq
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Custom system prompt for translation output style
CUSTOM_SYSTEM_PROMPT = """You are a YouTube storytime narrator specializing in emotional, first-person POV scripts. Your tone is soft, melancholic, and intimate — like a young adult reflecting on a painful relationship.

When writing a narration script based on song lyrics or a given scene, follow these rules:
1. Use short, fragmented sentences. Breathe between thoughts.
2. Write in first-person ("I", "my", "me").
3. Keep the language simple, poetic, and conversational — not overly formal.
4. Add natural pauses that feel like real spoken voiceover. Use line breaks for dramatic effect.
5. Avoid literal translations. Instead, capture the emotion and subtext of the original lyrics.
6. Start each scene with a quiet observation or a memory. End with an unresolved feeling or a question.
7. Never use words like "subsequently", "nevertheless", or formal writing.
8. Match the emotional arc: longing → frustration → denial → vulnerability → truth.

Format the output with scene breaks (---) and keep each sentence on a new line for easy subtitle placement."""

# Configure APIs
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Initialize clients
gemini_model = None
groq_client = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # 404 error မတက်အောင် model name ကို 'gemini-1.5-flash' ဟု တိကျစွာ ရေးထားပါသည်
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

def translate_with_gemini(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not gemini_model:
        raise Exception("Gemini not configured")
    
    prompt = f"""System: {CUSTOM_SYSTEM_PROMPT}

Translate the following text from {source_lang} to {target_lang}. Follow the style rules in the system prompt above:

{text}"""
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

def translate_with_groq(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not groq_client:
        raise Exception("Groq not configured")
    
    lang_map = {
        'en': 'English', 'my': 'Burmese', 'th': 'Thai', 
        'zh': 'Chinese', 'ja': 'Japanese'
    }
    target = lang_map.get(target_lang, target_lang)
    source = lang_map.get(source_lang, source_lang) if source_lang != 'auto' else 'auto'
    
    # Use custom system prompt for styling
    completion = groq_client.chat.completions.create(
        model="Llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": CUSTOM_SYSTEM_PROMPT},
            {"role": "user", "content": f"Translate from {source} to {target}: {text}"}
        ],
        temperature=0.7
    )
    return completion.choices[0].message.content

def translate_with_fallback(text: str, target_lang: str, source_lang: str = "auto") -> str:
    errors = []
    
    # Try Gemini first
    if gemini_model:
        try:
            return translate_with_gemini(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"Gemini: {str(e)}")
    
    # Try Groq as fallback
    if groq_client:
        try:
            return translate_with_groq(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"Groq: {str(e)}")
    
    raise Exception(f"All translation APIs failed: {' | '.join(errors)}")

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
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
                model="Llama-3.3-70b-versatile", # တောင်းဆိုထားသည့်အတိုင်း qwen3 ကို အသုံးပြုထားသည်
                messages=[{"role": "user", "content": query.get("message", "")}],
                temperature=0.7,
                frequency_penalty=0.6 # စာသားထပ်ခြင်းကို လျှော့ချရန်
            )
            return {"reply": completion.choices[0].message.content}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Groq API failed: {str(e)}")
    
    raise HTTPException(status_code=500, detail="Bot API (Groq) not configured")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY)
    }
    
