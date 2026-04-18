import { motion } from 'framer-motion';

export const WaveAnimation = () => {
  const bars = [0, 1, 2, 3, 4];
  
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-blue-500 rounded-full"
          animate={{
            height: [12, 32, 12],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};