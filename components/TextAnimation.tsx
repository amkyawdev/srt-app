import { motion } from 'framer-motion';

export const TextAnimation = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(' ');
  
  return (
    <div className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};