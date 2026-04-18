import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { WaveAnimation } from '../components/WaveAnimation';

export default function Home() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent"
          >
            Translate SRT Files with AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-8"
          >
            Fast, accurate subtitle translation powered by Gemini AI
          </motion.p>

          <div className="flex justify-center mb-12">
            <WaveAnimation />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/translate">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105">
                Start Translating →
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}