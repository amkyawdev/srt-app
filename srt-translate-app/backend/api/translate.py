import os
import google.generativeai as genai
from groq import Groq
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Configure APIs
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class TranslateRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: Optional[str] = "auto"

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"Translate the following text from {request.source_lang} to {request.target_lang}. Only return the translated text:\n\n{request.text}"
        response = model.generate_content(prompt)
        return {"translated_text": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bot")
async def bot_response(query: dict):
    try:
        completion = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": query.get("message", "")}],
            temperature=0.7
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))