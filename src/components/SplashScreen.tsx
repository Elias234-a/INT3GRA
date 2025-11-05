import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logoImage from '../assets/Rerso 9.png';

interface SplashScreenProps {
  onComplete: () => void;
  colors: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, colors }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${colors.accent3}, ${colors.accent4})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px 32px',
          borderRadius: '24px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <motion.img
          src={logoImage}
          alt="INT3GRA Logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            height: '80px',
            width: 'auto',
            display: 'block'
          }}
        />
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{
          margin: '0 0 48px',
          fontSize: '20px',
          color: '#FFFFFF',
          fontWeight: 600,
          letterSpacing: '1px'
        }}
      >
        Integrales Triples Aplicadas
      </motion.p>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        style={{
          width: '300px',
          height: '6px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <motion.div
          style={{
            height: '100%',
            backgroundColor: colors.accent1,
            borderRadius: '10px',
            width: `${progress}%`,
            transition: 'width 0.1s ease-out'
          }}
        />
      </motion.div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.3 }}
        style={{
          marginTop: '16px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 500
        }}
      >
        Cargando... {Math.round(progress)}%
      </motion.p>

      {/* Floating Symbols */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 100 }}
          animate={{
            opacity: [0, 0.3, 0],
            y: [-100, -500],
            x: [0, (i % 2 === 0 ? 1 : -1) * 100]
          }}
          transition={{
            delay: 1.5 + i * 0.3,
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            fontSize: '32px',
            color: colors.accent1,
            fontWeight: 700,
            pointerEvents: 'none'
          }}
        >
          ∫
        </motion.div>
      ))}
    </div>
  );
};

export default SplashScreen;