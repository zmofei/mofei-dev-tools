"use client";

import { motion, useAnimate, stagger, AnimationSequence } from "motion/react"
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

// Global state to track if nav animations have been played
let navAnimationsPlayed = false;

function useMenuAnimation(isOpen: boolean) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        const menuAnimations: AnimationSequence = isOpen
            ? [
                [
                    "nav",
                    { transform: "translateX(0%)" },
                    { ease: [0.08, 0.65, 0.53, 0.96], duration: 0.4 }
                ],
                [
                    "li",
                    { transform: "scale(1)", opacity: 1, filter: "blur(0px)" },
                    { delay: stagger(0.05), at: "-0.1" }
                ]
            ]
            : [
                ["nav", { transform: "translateX(100%)" }, { at: "-0.1" }],
                [
                    "li",
                    { transform: "scale(0.5)", opacity: 0, filter: "blur(10px)" },
                    { delay: stagger(0.05, { from: "last" }), at: "<" }
                ],

            ];

        animate(menuAnimations);
    }, [isOpen, animate]);
    return scope;
}

function Nav() {
    const [show, setShow] = useState(false);
    const scope = useMenuAnimation(show);
    const pathname = usePathname();
    const hasAnimated = useRef(navAnimationsPlayed);
    const { language, setLanguage } = useLanguage();

    // Function to check if current path matches the nav item
    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        } else if (path === '/base64') {
            return pathname === '/base64';
        }
        return false;
    };

    useEffect(() => {
        // Mark animations as played after first render
        if (!navAnimationsPlayed) {
            navAnimationsPlayed = true;
            hasAnimated.current = true;
        }
    }, [])

    return (
        <div ref={scope} >
            <div className="fixed w-full h-20 2xl:h-22 top-0 backdrop-blur-sm z-50 bg-gray-900/80 border-b border-gray-800" />
            <motion.div
                className="fixed z-60
                    left-5 top-5
                    2xl:left-10  2xl:top-5"
                initial={hasAnimated.current ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: hasAnimated.current ? { duration: 0 } : { type: "spring", damping: 10, stiffness: 200 } }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", }}
            >
                <Link className="flex items-center gap-2" href={language === 'en' ? '/' : '/zh'}>
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                    </svg>
                    <span className="text-white font-bold text-lg">Mofei Dev Tools</span>
                </Link>
            </motion.div>

            {/* Desktop Menu - Hidden on mobile */}
            <motion.div
                className="fixed right-5 top-3 z-60 hidden lg:flex items-center gap-6 text-white text-lg
                    2xl:right-10 2xl:top-5 2xl:text-xl"
                initial={hasAnimated.current ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: hasAnimated.current ? { duration: 0 } : { type: "spring", damping: 10, stiffness: 200 } }}
            >
                <motion.a 
                    className={`transition-colors duration-200 flex items-center gap-1 ${
                        isActive('/') 
                            ? 'text-[#a1c4fd] font-medium' 
                            : 'hover:text-[#a1c4fd]'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={language === 'en' ? '/' : '/zh'}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                    </svg>
                    Tools
                </motion.a>
                <motion.a 
                    className="hover:text-[#a1c4fd] transition-colors duration-200 flex items-center gap-1" 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://github.com/zmofei/mofei-dev-tools/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </motion.a>
                
                {/* Language Toggle */}
                <div className="flex items-center bg-gray-800/70 backdrop-blur-sm rounded-full p-1 border border-gray-700/50 ml-2">
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

            {/* Mobile Menu Button - Only visible on mobile */}
            <motion.button
                layout
                initial={hasAnimated.current ? 
                    { backgroundColor: show ? "#a1c4fd" : '', scale: 1, opacity: 1 } : 
                    { backgroundColor: show ? "#a1c4fd" : '', scale: 0.5, opacity: 0 }
                }
                animate={{ scale: 1, opacity: 1, transition: hasAnimated.current ? { duration: 0 } : { type: "spring", damping: 10, stiffness: 200 } }}
                whileHover={{ scale: 1.2, backgroundColor: "#a1c4fd", rotate: 3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", damping: 17, stiffness: 200 }}
                className={`fixed rounded-full p-2 px-4 z-60 lg:hidden
                    ${(show ? "bg-[#a1c4fd]" : "")}
                    right-5 top-3 text-xl  -mr-4 
                    2xl:right-10 2xl:top-5 md:text-2xl md:-mr-2 
                `}
                onClick={() => {
                    setShow(!show)
                }}
            >
                <svg viewBox="0 0 1024 1024" className="inline-block align-middle" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8282" width="23" height="23">
                    <path d="M867.995 459.647h-711.99c-27.921 0-52.353 24.434-52.353 52.353s24.434 52.353 52.353 52.353h711.99c27.921 0 52.353-24.434 52.353-52.353s-24.434-52.353-52.353-52.353z" p-id="8283" fill="#ffffff"></path><path d="M867.995 763.291h-711.99c-27.921 0-52.353 24.434-52.353 52.353s24.434 52.353 52.353 52.353h711.99c27.921 0 52.353-24.434 52.353-52.353s-24.434-52.353-52.353-52.353z" p-id="8284" fill="#ffffff"></path><path d="M156.005 260.709h711.99c27.921 0 52.353-24.434 52.353-52.353s-24.434-52.353-52.353-52.353h-711.99c-27.921 0-52.353 24.434-52.353 52.353s24.434 52.353 52.353 52.353z" p-id="8285" fill="#ffffff" />
                </svg>
                <span className="inline-block align-middle ml-2">
                    {show ? "Close" : "Menu"}
                </span>
            </motion.button>

            <nav className="fixed top-0 right-0 bottom-0 will-change-transform z-55" style={{
                transform: "translateX(100%)"
            }}>
                <ul className=" bg-[#a1c4fd] h-full text-right pl-20 
                text-2xl pt-12 pr-5
                md:text-4xl md:pt-20 md:pr-10
                ">
                    <li className="py-3 md:py-4" style={{ "transformOrigin": "top right" }}>
                        <motion.a 
                            className={`flex items-center gap-2 ${
                                isActive('/') 
                                    ? 'font-bold text-gray-900 drop-shadow-lg' 
                                    : 'text-gray-900/90'
                            }`}
                            whileHover={{ scale: 1.2, rotate: 3 }} 
                            href={language === 'en' ? '/' : '/zh'}
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                            </svg>
                            Tools
                        </motion.a>
                    </li>
                    <li className="py-3 md:py-4" style={{ "transformOrigin": "top right" }}>
                        <motion.a 
                            className="flex items-center gap-2 text-gray-900/90" 
                            whileHover={{ scale: 1.2, rotate: 3 }} 
                            href="https://github.com/zmofei/mofei-dev-tools/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </motion.a>
                    </li>
                    <li className="py-3 md:py-4" style={{ "transformOrigin": "top right" }}>
                        <div className="flex items-center gap-2">
                            <svg className="w-7 h-7 text-gray-900/90" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.51-6.67-.91-1.22-2.49-1.94-4.2-1.94-.65 0-1.29.14-1.88.38l3.3 3.32-2.42 2.42-3.32-3.3c-.24.59-.38 1.23-.38 1.88 0 1.71.72 3.29 1.94 4.2 2.02 1.5 4.73 1.23 6.67-.51l.03.03 2.51 2.54 2.42-2.42zM21.04 2.96L18.58.5l-5.66 5.66 2.46 2.46 5.66-5.66z"/>
                            </svg>
                            <div className="flex bg-white/20 rounded-full p-1">
                                <button
                                    onClick={() => setLanguage('zh')}
                                    className={`px-3 py-1 rounded-full text-lg font-medium transition-all duration-300 ${
                                        language === 'zh'
                                            ? 'bg-white text-gray-900 shadow-lg'
                                            : 'text-gray-900/70 hover:text-gray-900'
                                    }`}
                                >
                                    中文
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-1 rounded-full text-lg font-medium transition-all duration-300 ${
                                        language === 'en'
                                            ? 'bg-white text-gray-900 shadow-lg'
                                            : 'text-gray-900/70 hover:text-gray-900'
                                    }`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        </div >
    )
}

export default Nav;