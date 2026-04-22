import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Translate', path: '/translate' },
  { name: 'Speak', path: '/speak-to-text' },
  { name: 'Docs', path: '/docs' },
  { name: 'About', path: '/about' },
];

export default function Navigation() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-md border-b border-gray-800 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            SRT Translate
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition ${
                    router.pathname === item.path 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}