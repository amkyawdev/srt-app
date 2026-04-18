# SRT Translate App

AI-powered SRT subtitle translation application with smooth animations, floating bot assistant, and modern dark UI.

## Features

✅ Smooth Animations - Framer Motion for all transitions  
✅ Text Animation System - Word-by-word animated text  
✅ 5 Pages - Home, Translate, Docs, About  
✅ Floating Bot - Animated dialog box with Groq AI  
✅ Python Backend - Serverless functions on Vercel  
✅ Gemini + Groq APIs - Translation and chatbot  
✅ Wave Animation - While translation is processing  
✅ Gray/Black Theme - Modern dark UI  
✅ Responsive Design - Mobile-friendly  

## Tech Stack

- **Frontend**: Next.js 14, React 18, Framer Motion, Tailwind CSS
- **Backend**: Python, FastAPI, Vercel Serverless Functions
- **AI**: Gemini API (Translation), Groq API (Chatbot)

## Project Structure

```
srt-translate-app/
├── frontend/                 (Next.js - deployed to Vercel)
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── FloatingBot.tsx
│   │   ├── WaveAnimation.tsx
│   │   └── TextAnimation.tsx
│   ├── pages/
│   │   ├── index.tsx        (Home)
│   │   ├── translate.tsx    (Translate)
│   │   ├── docs.tsx        (Documentation)
│   │   └── about.tsx       (About)
│   ├── styles/globals.css
│   └── utils/api.ts
│
├── backend/                  (Python - serverless functions)
│   ├── api/translate.py     (Translation API)
│   ├── bot.py               (Chatbot module)
│   └── requirements.txt
│
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Gemini API Key
- Groq API Key

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn api.translate:app --reload --port 8000
```

## Environment Variables

Required environment variables for deployment:

- `GEMINI_API_KEY` - Google Gemini API key
- `GROQ_API_KEY` - Groq API key

## Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Developer

**Aung Myo Kyaw** - Full Stack Developer  
- Email: amk.kyaw92@gmail.com  
- GitHub: amkyawDev  
- TikTok: @amkyaw.dev  
- Hugging Face: AmkyawDev

## License

MIT License