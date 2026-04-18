import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function About() {
  const admin = {
    name: "Aung Myo Kyaw",
    role: "Full Stack Developer",
    email: "amk.kyaw92@gmail.com",
    tiktok: "@amkyaw.dev",
    github: "amkyawDev",
    huggingface: "AmkyawDev",
    webpage: ""
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          About App & Developer
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* App Info */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">📱 App Information</h2>
            <p className="text-gray-300">Version 1.0.0</p>
            <p className="text-gray-300 mt-2">Built with Next.js, Python, Gemini AI & Groq</p>
            <p className="text-gray-300 mt-2">Specialized in SRT subtitle translation with smooth animations</p>
          </div>

          {/* Developer Info */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">👨‍💻 Developer</h2>
            <div className="space-y-3">
              <p><strong>Name:</strong> {admin.name}</p>
              <p><strong>Role:</strong> {admin.role}</p>
              <p><strong>Email:</strong> <a href={`mailto:${admin.email}`} className="text-blue-400 hover:underline">{admin.email}</a></p>
              <p><strong>TikTok:</strong> <a href={`https://tiktok.com/@${admin.tiktok.substring(1)}`} className="text-blue-400 hover:underline">{admin.tiktok}</a></p>
              <p><strong>GitHub:</strong> <a href={`https://github.com/${admin.github}`} className="text-blue-400 hover:underline">{admin.github}</a></p>
              <p><strong>Hugging Face:</strong> <a href={`https://huggingface.co/${admin.huggingface}`} className="text-blue-400 hover:underline">{admin.huggingface}</a></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}