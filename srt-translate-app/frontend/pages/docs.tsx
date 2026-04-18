import Layout from '../components/Layout';
import { TextAnimation } from '../components/TextAnimation';

export default function Docs() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <TextAnimation text="Documentation & Usage" className="text-4xl font-bold mb-8" />
        
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Purpose of Construction</h2>
            <p className="text-gray-300 mb-4">
              SRT Translate App is built to provide seamless subtitle translation for content creators, 
              video editors, and language learners. The application leverages state-of-the-art AI models 
              (Gemini & Groq) to deliver accurate, context-aware translations.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Usage Guide</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Navigate to the Translate page</li>
              <li>Enter or paste your SRT text content</li>
              <li>Select your target language</li>
              <li>Click Translate and watch the wave animation</li>
              <li>Copy the translated text for your SRT file</li>
              <li>Use the AI bot for assistance with translations</li>
            </ol>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>✨ Smooth text animations for all content</li>
              <li>🤖 AI-powered translation with Gemini API</li>
              <li>💬 Intelligent chatbot using Groq's Mixtral model</li>
              <li>🎨 Elegant gray/black theme with wave animations</li>
              <li>📱 Fully responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}