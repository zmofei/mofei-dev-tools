"use client"
import { useState } from 'react';
import { motion } from "motion/react"
import { Modal, PrimaryPillButton, PrimaryPillLink, SecondaryButton } from '@mofei-dev/ui';
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

  const sizeClasses = {
    sm: 'min-h-9 gap-2 px-4 text-sm',
    md: 'min-h-10 gap-2 px-5 text-sm',
    lg: 'min-h-11 gap-2 px-6 text-base'
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

  if (!showDropdown) {
    return (
      <PrimaryPillLink
        href="https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas"
        className={`${sizeClasses[size]} transform-none hover:translate-x-0 hover:translate-y-0 ${className}`.trim()}
      >
        <span>💡</span>
        {buttonText}
      </PrimaryPillLink>
    );
  }

  const ButtonComponent = variant === 'primary' ? PrimaryPillButton : SecondaryButton;

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        <ButtonComponent
          onClick={() => setIsOpen(!isOpen)}
          className={`${sizeClasses[size]} transform-none hover:translate-x-0 hover:translate-y-0`}
        >
          <span>🚀</span>
          {buttonText}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.span>
        </ButtonComponent>
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={language === 'zh' ? '贡献与反馈' : 'Contribute and Feedback'}
        description={
          language === 'zh'
            ? '选择一种方式帮助我们改进这些开发工具。'
            : 'Choose a way to help improve these development tools.'
        }
        footer={
          <p className="text-center text-xs text-white/46">
            {language === 'zh'
              ? '您的反馈对我们非常重要'
              : 'Your feedback is very important to us'
            }
          </p>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {contributeOptions.map((option, index) => (
            <a
              key={index}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-28 items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07]"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-white transition-colors duration-200 group-hover:text-cyan-50">
                  {option.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-white/52">
                  {option.description}
                </span>
              </span>
              <span className="text-white/34 transition-colors duration-200 group-hover:text-white/72">
                →
              </span>
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}
