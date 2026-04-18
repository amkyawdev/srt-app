import os
import google.generativeai as genai
from groq import Groq
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Configure APIs
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Initialize clients
gemini_model = None
groq_client = None
openai_client = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
    except Exception:
        pass

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        pass

# Try importing openai
try:
    if OPENAI_API_KEY:
        import openai
        openai.api_key = OPENAI_API_KEY
        openai_client = openai
except Exception:
    pass

class TranslateRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: Optional[str] = "auto"

def translate_with_gemini(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not gemini_model:
        raise Exception("Gemini not configured")
    
    prompt = f"Translate the following text from {source_lang} to {target_lang}. Only return the translated text:\n\n{text}"
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

def translate_with_groq(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not groq_client:
        raise Exception("Groq not configured")
    
    # Map language codes for Groq
    lang_map = {
        'en': 'English', 'my': 'Burmese', 'th': 'Thai', 
        'zh': 'Chinese', 'ja': 'Japanese'
    }
    target = lang_map.get(target_lang, target_lang)
    source = lang_map.get(source_lang, source_lang) if source_lang != 'auto' else 'auto'
    
    prompt = f"Translate from {source} to {target}: {text}"
    completion = groq_client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return completion.choices[0].message.content

def translate_with_openai(text: str, target_lang: str, source_lang: str = "auto") -> str:
    if not openai_client:
        raise Exception("OpenAI not configured")
    
    lang_map = {
        'en': 'English', 'my': 'Burmese', 'th': 'Thai', 
        'zh': 'Chinese', 'ja': 'Japanese'
    }
    target = lang_map.get(target_lang, target_lang)
    source = lang_map.get(source_lang, source_lang) if source_lang != 'auto' else 'auto'
    
    prompt = f"Translate from {source} to {target}: {text}"
    response = openai_client.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def translate_with_fallback(text: str, target_lang: str, source_lang: str = "auto") -> str:
    errors = []
    
    # Try Gemini first
    if gemini_model:
        try:
            return translate_with_gemini(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"Gemini: {str(e)}")
    
    # Try Groq
    if groq_client:
        try:
            return translate_with_groq(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"Groq: {str(e)}")
    
    # Try OpenAI
    if openai_client:
        try:
            return translate_with_openai(text, target_lang, source_lang)
        except Exception as e:
            errors.append(f"OpenAI: {str(e)}")
    
    raise Exception(f"All translation APIs failed: {' | '.join(errors)}")

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    if not any([GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY]):
        raise HTTPException(status_code=500, detail="No translation API configured")
    
    try:
        result = translate_with_fallback(request.text, request.target_lang, request.source_lang)
        return {"translated_text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.post("/api/bot")
async def bot_response(query: dict):
    errors = []
    
    # Try Groq first (using llama model)
    if groq_client:
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=[{"role": "user", "content": query.get("message", "")}],
                temperature=0.7
            )
            return {"reply": completion.choices[0].message.content}
        except Exception as e:
            errors.append(f"Groq: {str(e)}")
    
    # Try OpenAI as fallback
    if openai_client:
        try:
            response = openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": query.get("message", "")}]
            )
            return {"reply": response.choices[0].message.content}
        except Exception as e:
            errors.append(f"OpenAI: {str(e)}")
    
    raise HTTPException(status_code=500, detail=f"Bot APIs failed: {' | '.join(errors)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY)
    }