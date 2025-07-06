"use client"
import React from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/contexts/LanguageContext";

function Foot() {
    const { t } = useLanguage();
    
    return (
        <div className="w-full bg-gradient-to-br from-[#a1c4fd] via-[#8fb3fc] to-[#7aa6fa] snap-start overflow-hidden relative" >
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-20" 
                style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}>
            </div>
            
            <div className="w-full relative z-10">
                <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row leading-loose justify-between items-start md:items-center
                    text-sm pt-4 px-5 gap-3 md:gap-0
                    md:text-base md:pt-6 md:px-10
                    lg:text-lg lg:pt-7 lg:px-16
                    xl:text-xl xl:pt-8 xl:px-20
                    2xl:text-2xl 2xl:pt-9 2xl:px-24">
                    
                    <motion.div
                        className="bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20
                            md:px-3 md:py-1.5 lg:px-4 lg:py-1.5 xl:px-5 xl:py-2 2xl:px-6 2xl:py-2"
                        initial={{ opacity: 0, translateY: -50 }}
                        whileInView={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    >
                        <span className="text-slate-800 font-medium">{t('footer.copyright')}</span>
                    </motion.div>
                    
                    <motion.div
                        className="flex-1 text-left md:text-center md:mx-8"
                        initial={{ opacity: 0, translateY: -50 }}
                        whileInView={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed">
                            {t('footer.description')}
                        </p>
                    </motion.div>
                    
                    <motion.div
                        className="flex flex-row md:flex-col gap-1.5 md:gap-1 lg:gap-1.5 xl:gap-1.5 2xl:gap-2"
                        initial={{ opacity: 0, translateY: -50 }}
                        whileInView={{ opacity: 1, translateY: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    >
                        <a href="https://github.com/zmofei/" target="_blank" 
                            className="text-slate-700 hover:text-slate-900 hover:bg-white/20 px-1.5 py-0.5 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1
                                md:px-2 md:py-1 lg:px-2.5 lg:py-1 xl:px-3 xl:py-1.5 2xl:px-4 2xl:py-1.5">
                            <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            {t('nav.github')}
                        </a>
                        <a href="https://www.mofei.life/" target="_blank" 
                            className="text-slate-700 hover:text-slate-900 hover:bg-white/20 px-1.5 py-0.5 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1
                                md:px-2 md:py-1 lg:px-2.5 lg:py-1 xl:px-3 xl:py-1.5 2xl:px-4 2xl:py-1.5">
                            <svg className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            {t('nav.blog')}
                        </a>
                    </motion.div>
                </div>
            </div>
                
            <motion.div
                className="w-full mt-4 md:mt-6 lg:mt-7 xl:mt-8 2xl:mt-9"
                initial={{ opacity: 0, translateY: 30 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
                <svg
                    className="outline-none mt-10 hidden md:flex" viewBox="0 0 2318 135"
                >
                    <foreignObject width="100%" height="100%">
                        <p className="text-[135px] text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900" style={{
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
                        <p className="text-[200px] text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900" style={{
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
                        <p className="text-[200px] text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900" style={{
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