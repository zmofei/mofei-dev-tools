"use client"
import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.div
      className="fixed top-16 right-4 z-50 lg:top-16 lg:right-5 2xl:top-20 2xl:right-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center bg-gray-800/70 backdrop-blur-sm rounded-full p-1 border border-gray-700/50">
        <button
          onClick={() => setLanguage('zh')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            language === 'zh'
              ? 'bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] text-gray-800 shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            language === 'en'
              ? 'bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] text-gray-800 shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          EN
        </button>
      </div>
    </motion.div>
  );
}