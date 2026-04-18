import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { WaveAnimation } from '../components/WaveAnimation';

export default function Home() {
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Translation",
      desc: "Powered by Gemini AI for accurate translations"
    },
    {
      icon: "⚡",
      title: "Fast Processing",
      desc: "Quick and efficient subtitle translation"
    },
    {
      icon: "🎨",
      title: "Smooth Animations",
      desc: "Beautiful UI with Framer Motion"
    },
    {
      icon: "💬",
      title: "AI Chat Bot",
      desc: "Get help from our AI assistant anytime"
    }
  ];

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            SRT Translate
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-4"
          >
            AI-Powered Subtitle Translation App
          </motion.p>

          <div className="flex justify-center mb-8">
            <WaveAnimation />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/translate">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105">
                Start Translating →
              </button>
            </Link>
            <Link href="/docs">
              <button className="bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition border border-gray-700">
                Learn More
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 mb-4">Supported Languages</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['English', 'Myanmar', 'Thai', 'Chinese', 'Japanese'].map((lang) => (
              <span key={lang} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">
                {lang}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}