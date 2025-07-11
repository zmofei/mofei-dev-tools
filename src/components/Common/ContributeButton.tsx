"use client"
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from "motion/react"
import { useLanguage } from '@/contexts/LanguageContext';

interface ContributeButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDropdown?: boolean;
}

export default function ContributeButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '',
  showDropdown = true 
}: ContributeButtonProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] hover:from-[#8fb3f9] hover:to-[#b8e4f7] text-gray-900 font-semibold',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white font-medium',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 font-medium'
  };

  const contributeOptions = [
    {
      icon: '💡',
      title: language === 'zh' ? '请求新工具' : 'Request New Tool',
      description: language === 'zh' ? '建议新工具想法' : 'Suggest a new tool idea',
      url: 'https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas'
    },
    {
      icon: '✨',
      title: language === 'zh' ? '功能改进' : 'Feature Enhancement',
      description: language === 'zh' ? '改进现有工具' : 'Improve existing tools',
      url: 'https://github.com/zmofei/mofei-dev-tools/issues/new?template=feature_request.yml'
    },
    {
      icon: '🐛',
      title: language === 'zh' ? '报告问题' : 'Report Issue',
      description: language === 'zh' ? '报告bug或问题' : 'Report bugs or issues',
      url: 'https://github.com/zmofei/mofei-dev-tools/issues/new?template=bug_report.yml'
    },
    {
      icon: '🤝',
      title: language === 'zh' ? '参与开发' : 'Contribute Code',
      description: language === 'zh' ? '贡献代码和文档' : 'Contribute code and docs',
      url: 'https://github.com/zmofei/mofei-dev-tools/blob/main/CONTRIBUTING.md'
    }
  ];

  const buttonText = language === 'zh' ? '贡献 & 反馈' : 'Contribute & Feedback';
  // const shortButtonText = language === 'zh' ? '贡献' : 'Contribute';

  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    
    const rect = buttonRef.current.getBoundingClientRect();
    
    // For absolute positioning, we need to add scroll offset
    const dropdownWidth = 320;
    const dropdownHeight = 350;
    let leftPos = rect.right - dropdownWidth + window.scrollX;
    let topPos = rect.bottom + 8 + window.scrollY;
    
    // Ensure dropdown doesn't go off the left edge
    if (leftPos < 20 + window.scrollX) {
      leftPos = rect.left + window.scrollX;
    }
    
    // Ensure dropdown doesn't go off the right edge
    if (leftPos + dropdownWidth > window.innerWidth + window.scrollX) {
      leftPos = window.innerWidth + window.scrollX - dropdownWidth - 20;
    }
    
    // For footer buttons, show dropdown above the button if it would go off screen
    if (topPos + dropdownHeight > window.innerHeight + window.scrollY) {
      // Position dropdown above button with proper spacing
      topPos = rect.top - dropdownHeight - 8 + window.scrollY;
    }
    
    return {
      top: Math.max(10 + window.scrollY, topPos), // Ensure minimum top position
      left: Math.max(10 + window.scrollX, leftPos) // Ensure minimum left position
    };
  };

  if (!showDropdown) {
    return (
      <a
        href="https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          ${className}
          rounded-lg transition-all duration-200 
          inline-flex items-center justify-center gap-2 
          hover:shadow-lg transform hover:scale-105 origin-center
          focus:outline-none focus:ring-2 focus:ring-[#a1c4fd] focus:ring-offset-2 focus:ring-offset-gray-900
        `}
      >
        <span>💡</span>
        {buttonText}
      </a>
    );
  }

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        <motion.button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            rounded-lg transition-all duration-200 
            inline-flex items-center justify-center gap-2 
            hover:shadow-lg transform origin-center
            focus:outline-none focus:ring-2 focus:ring-[#a1c4fd] focus:ring-offset-2 focus:ring-offset-gray-900
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🚀</span>
          {buttonText}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.span>
        </motion.button>
      </div>

      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-[9999] overflow-hidden"
            style={getDropdownPosition()}
          >
            <div className="p-4 bg-gradient-to-r from-[#a1c4fd]/10 to-[#c2e9fb]/10 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">
                {language === 'zh' ? '如何贡献' : 'How to Contribute'}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {language === 'zh' 
                  ? '选择一种方式帮助我们改进工具' 
                  : 'Choose a way to help us improve our tools'
                }
              </p>
            </div>
            
            <div className="p-2">
              {contributeOptions.map((option, index) => (
                <motion.a
                  key={index}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 group"
                  whileHover={{ x: 4 }}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm group-hover:text-[#a1c4fd] transition-colors duration-200">
                      {option.title}
                    </h4>
                    <p className="text-gray-400 text-xs mt-0.5 group-hover:text-gray-300 transition-colors duration-200">
                      {option.description}
                    </p>
                  </div>
                  <span className="text-gray-500 group-hover:text-gray-300 transition-colors duration-200">
                    →
                  </span>
                </motion.a>
              ))}
            </div>
            
            <div className="p-4 bg-gray-700/30 border-t border-gray-700">
              <p className="text-gray-400 text-xs text-center">
                {language === 'zh' 
                  ? '🌟 您的反馈对我们非常重要！' 
                  : '🌟 Your feedback is very important to us!'
                }
              </p>
            </div>
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}