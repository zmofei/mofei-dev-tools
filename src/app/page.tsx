"use client"
import { useState, useEffect } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import StructuredData from '@/components/StructuredData';
import ContributeButton from '@/components/Common/ContributeButton';

interface Tool {
  name: string;
  url: string;
  description: string;
  icon: string;
  category?: string;
}

const getToolsData = (language: string): Tool[] => [
  {
    name: "Base64",
    url: language === 'en' ? '/en/base64' : '/zh/base64', 
    description: "Base64 encode/decode tool for text conversion",
    icon: "🔤",
    category: "text"
  },
  {
    name: "GeoJSON Preview",
    url: language === 'en' ? '/en/geojson' : '/zh/geojson', 
    description: "Generate geojson.io preview links for GeoJSON data",
    icon: "🗺️",
    category: "dev"
  },
  {
    name: "JSON Path Extractor",
    url: language === 'en' ? '/en/json-extract' : '/zh/json-extract', 
    description: "Extract specific values from JSON data using JSONPath syntax",
    icon: "📊",
    category: "dev"
  },
  {
    name: "GIS Coordinate Converter",
    url: language === 'en' ? '/en/coordinate-converter' : '/zh/coordinate-converter', 
    description: "Convert coordinates between different geographic coordinate systems",
    icon: "🗺️",
    category: "dev"
  }
];

export default function Home() {
  const { t, language } = useLanguage();
  
  const titleText = t('title');
  const subtitleText = t('subtitle');

  const categoryTexts = {
    text: t('categories.text'),
    dev: t('categories.dev'),
    design: t('categories.design'), 
    util: t('categories.util'),
    other: t('categories.other')
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toolsData = getToolsData(language);
  const groupedTools = toolsData.reduce((acc, tool) => {
    const category = tool.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData type="website" />
      <main className="flex-1 pt-20">
        <div className='max-w-[2000px] mx-auto'>
          <div className='overflow-hidden font-extrabold px-5 md:px-10 lg:px-16'>
            <motion.h1 
              className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] leading-tight 
                text-3xl mt-8 mb-4
                md:text-5xl md:mt-12 md:mb-6
                lg:text-6xl lg:mt-16 lg:mb-8
                xl:text-7xl xl:mt-20 xl:mb-10
                `}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {titleText}
            </motion.h1>
            
            <motion.p 
              className="text-gray-300/90 text-lg md:text-xl lg:text-2xl font-medium leading-relaxed tracking-wide mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              {subtitleText}
            </motion.p>
            
            <motion.div
              className="flex justify-center pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <ContributeButton variant="primary" size="lg" />
            </motion.div>
          </div>
        </div>

        <div className='max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12'>
        {Object.entries(groupedTools).map(([category, tools], categoryIndex) => (
          <motion.div 
            key={category}
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + categoryIndex * 0.1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-[#a1c4fd] to-[#c2e9fb] rounded-full"></div>
              {categoryTexts[category as keyof typeof categoryTexts]}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {tools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + categoryIndex * 0.1 + index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Link 
                    href={tool.url}
                    className="block h-full"
                  >
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-700 hover:border-[#a1c4fd]/50 h-full flex flex-col relative">
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] flex items-center justify-center flex-shrink-0 text-2xl mb-3">
                          {tool.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-white mb-1">
                            {tool.name === 'Base64' ? t('tools.base64.name') : 
                             tool.name === 'GeoJSON Preview' ? t('tools.geojson.name') : 
                             tool.name === 'JSON Path Extractor' ? t('tools.json-extract.name') :
                             t('tools.coordinate-converter.name')}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {tool.name === 'Base64' ? t('tools.base64.category') : 
                             tool.name === 'GeoJSON Preview' ? t('tools.geojson.category') :
                             tool.name === 'JSON Path Extractor' ? t('tools.json-extract.category') :
                             t('tools.coordinate-converter.category')}
                          </p>
                        </div>
                        
                        <div className="absolute top-4 right-4">
                          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed flex-1 text-center">
                        {tool.name === 'Base64' ? t('tools.base64.description') : 
                         tool.name === 'GeoJSON Preview' ? t('tools.geojson.description') :
                         tool.name === 'JSON Path Extractor' ? t('tools.json-extract.description') :
                         t('tools.coordinate-converter.description')}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Coming Soon section */}
        <motion.div 
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('footer.moreTools')}
                </h3>
                <p className="text-gray-300">
                  {t('footer.moreToolsDesc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}
