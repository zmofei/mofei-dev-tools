"use client"
import React from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/contexts/LanguageContext";
import ContributeButton from "./ContributeButton";

function Foot() {
    const { t, language } = useLanguage();
    
    return (
        <div className="w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 snap-start overflow-hidden relative" >
            {/* Soft gradient border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" 
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(161, 196, 253, 0.8) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}>
            </div>
            
            <div className="w-full relative z-10">
                <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row leading-loose justify-between items-center
                    text-sm pt-4 px-5 gap-3 md:gap-0
                    md:text-base md:pt-6 md:px-10
                    lg:text-lg lg:pt-7 lg:px-16
                    xl:text-xl xl:pt-8 xl:px-20
                    2xl:text-2xl 2xl:pt-9 2xl:px-24">
                    
                    <motion.div
                        className="bg-black/5 backdrop-blur-sm rounded-full border border-gray-400/15 shadow-2xl
                            px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-1.5 xl:px-5 xl:py-2 2xl:px-6 2xl:py-2"
                        initial={{ opacity: 0, translateY: -50 }}
                        whileInView={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    >
                        <span className="text-white font-medium">{t('footer.copyright')}</span>
                    </motion.div>
                    
                    <motion.div
                        className="flex-1 text-left md:text-center md:mx-8"
                        initial={{ opacity: 0, translateY: -50 }}
                        whileInView={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed">
                            {t('footer.descriptionBefore')}
                            <a 
                                href="https://www.mofei.life" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#a1c4fd] hover:text-[#c2e9fb] underline underline-offset-2 hover:underline-offset-4 transition-all duration-300"
                            >
                                https://www.mofei.life
                            </a>
                            {t('footer.descriptionAfter')}
                        </p>
                    </motion.div>
                    
                    <motion.div
                        className="flex flex-col items-center gap-2 md:items-end md:gap-1 lg:gap-1.5 xl:gap-1.5 2xl:gap-2 w-full md:w-auto"
                        initial={{ opacity: 0, translateY: -50 }}
                        whileInView={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    >
                        <a 
                            href="https://www.mofei.life/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-center justify-center text-sm"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            {language === 'zh' ? '作者博客' : 'Author Blog'}
                        </a>
                        <a
                            href="https://github.com/zmofei/mofei-dev-tools"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-center justify-center text-sm"
                        >
                            <span>⭐</span>
                            {language === 'zh' ? 'GitHub Star' : 'Star on GitHub'}
                        </a>
                        <ContributeButton variant="ghost" size="sm" className="text-sm" />
                    </motion.div>
                </div>
            </div>
                
                
            <motion.div
                className="w-full mt-4 md:mt-6 lg:mt-7 xl:mt-8 2xl:mt-9"
                initial={{ opacity: 0, translateY: 30 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
                <svg
                    className="outline-none mt-10 hidden md:flex" viewBox="0 0 2318 135"
                >
                    <foreignObject width="100%" height="100%">
                        <p className="text-[135px] text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500" style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 700,
                            letterSpacing: "-0px",
                            lineHeight: "1em",
                        }}>{t('footer.bigText.desktop')}</p>
                    </foreignObject>
                </svg>

                <svg
                    className="outline-none flex md:hidden mt-10" viewBox="0 0 2318 200"
                >
                    <foreignObject width="100%" height="100%">
                        <p className="text-[200px] text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500" style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 700,
                            letterSpacing: "-0px",
                            lineHeight: "1em",
                        }}>{t('footer.bigText.mobile1')}</p>
                    </foreignObject>
                </svg>
                <svg
                    className="outline-none flex md:hidden mb-0" viewBox="0 0 2318 200"
                >
                    <foreignObject width="100%" height="100%">
                        <p className="text-[200px] text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500" style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 700,
                            letterSpacing: "-0px",
                            lineHeight: "1em",
                        }}>{t('footer.bigText.mobile2')}</p>
                    </foreignObject>
                </svg>
            </motion.div>
        </div>
    );
};

export default Foot;