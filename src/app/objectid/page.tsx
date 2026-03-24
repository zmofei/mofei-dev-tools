"use client"
import { useState, useEffect, Suspense } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';
import { event } from '@/components/GoogleAnalytics';
import StructuredData from '@/components/StructuredData';
import ContributeButton from '@/components/Common/ContributeButton';

function ObjectIdToolPageContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [generatedId, setGeneratedId] = useState('');
  const [customTimestamp, setCustomTimestamp] = useState('');
  const [useCustomTimestamp, setUseCustomTimestamp] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [history, setHistory] = useState<Array<{
    id: string;
    objectId: string;
    timestamp: number;
    readable: string;
  }>>([]);

  const titleText = "ObjectID Generator";
  const subtitleText = "Generate MongoDB ObjectID with optional custom timestamp";

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem('objectid-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore invalid history data
      }
    }

    // Parse URL parameters for shared content
    const sharedId = searchParams.get('id');
    if (sharedId) {
      setGeneratedId(sharedId);
    }
  }, [searchParams]);

  const generateObjectId = (timestamp?: number) => {
    const now = timestamp || Date.now();
    const timestampHex = Math.floor(now / 1000).toString(16).padStart(8, '0');
    
    // Generate 5 random bytes for machine/process identifier
    const randomBytes = Array.from({ length: 5 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    // Generate 3-byte counter (simulate incrementing counter)
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    
    return timestampHex + randomBytes + counter;
  };

  const extractTimestamp = (objectId: string): number | null => {
    if (objectId.length !== 24) return null;
    try {
      const timestampHex = objectId.substring(0, 8);
      return parseInt(timestampHex, 16) * 1000;
    } catch {
      return null;
    }
  };

  const handleGenerate = () => {
    let timestamp: number | undefined;
    
    if (useCustomTimestamp && customTimestamp) {
      const customDate = new Date(customTimestamp);
      if (!isNaN(customDate.getTime())) {
        timestamp = customDate.getTime();
      }
    }
    
    const newId = generateObjectId(timestamp);
    setGeneratedId(newId);
    
    // Add to history
    const newHistoryItem = {
      id: Date.now().toString(),
      objectId: newId,
      timestamp: Date.now(),
      readable: new Date(extractTimestamp(newId) || Date.now()).toISOString()
    };

    setHistory(prev => {
      const newHistory = [newHistoryItem, ...prev.slice(0, 9)]; // Keep last 10
      localStorage.setItem('objectid-history', JSON.stringify(newHistory));
      return newHistory;
    });

    // Track event
    event('objectid_generate', 'Tool Usage', 'ObjectID Generate', 1);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      event('copy_result', 'Tool Usage', 'Copy ObjectID Result', text.length);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      event('copy_result_fallback', 'Tool Usage', 'Copy ObjectID Result Fallback', text.length);
    }
  };

  const handleShare = async () => {
    if (!generatedId) return;
    
    try {
      const currentPath = language === 'en' ? '/en/objectid' : '/zh/objectid';
      const shareUrl = `${window.location.origin}${currentPath}?id=${generatedId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Share URL copied to clipboard!");
      
      event('share_result', 'Tool Usage', 'Share ObjectID', generatedId.length);
      
      setTimeout(() => setShareMessage(''), 3000);
    } catch {
      // Fallback
      const currentPath = language === 'en' ? '/en/objectid' : '/zh/objectid';
      const shareUrl = `${window.location.origin}${currentPath}?id=${generatedId}`;
      
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      setShareMessage("Share URL copied to clipboard!");
      event('share_result_fallback', 'Tool Usage', 'Share ObjectID Fallback', generatedId.length);
      
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('objectid-history');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getObjectIdInfo = (objectId: string) => {
    if (objectId.length !== 24) return null;
    
    const timestamp = extractTimestamp(objectId);
    if (!timestamp) return null;
    
    return {
      timestamp: new Date(timestamp).toISOString(),
      timestampHex: objectId.substring(0, 8),
      machineProcess: objectId.substring(8, 18),
      counter: objectId.substring(18, 24),
      age: formatTime(timestamp)
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData 
        type="tool" 
        toolName="MongoDB ObjectID Generator" 
        toolDescription="Free online tool to generate MongoDB ObjectIDs with custom timestamp support. Extract timestamps, analyze structure, and create unique database identifiers for MongoDB development."
        url="https://tools.mofei.life/objectid"
      />
      
      {/* Enhanced JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebApplication", "SoftwareApplication"],
            "name": "MongoDB ObjectID Generator",
            "description": "Free online tool to generate MongoDB ObjectIDs with custom timestamp support. Extract timestamps, analyze structure, and create unique database identifiers for MongoDB development.",
            "url": "https://tools.mofei.life/objectid",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "permissions": "browser",
            "isAccessibleForFree": true,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "Mofei Dev Tools",
              "url": "https://tools.mofei.life"
            },
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "ObjectID Generator",
              "applicationCategory": "Database Tool",
              "downloadUrl": "https://tools.mofei.life/objectid",
              "featureList": [
                "Generate MongoDB ObjectID",
                "Custom timestamp support",
                "ObjectID structure analysis",
                "Timestamp extraction",
                "Copy and share functionality",
                "Generation history tracking"
              ],
              "browserRequirements": "Requires JavaScript enabled"
            },
            "potentialAction": {
              "@type": "UseAction",
              "target": "https://tools.mofei.life/objectid",
              "name": "Generate ObjectID"
            }
          })
        }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Mofei Dev Tools",
                "item": "https://tools.mofei.life/"
              },
              {
                "@type": "ListItem", 
                "position": 2,
                "name": "Developer Tools",
                "item": "https://tools.mofei.life/#dev-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "ObjectID Generator",
                "item": "https://tools.mofei.life/objectid"
              }
            ]
          })
        }}
      />
      <main className="flex-1 pt-20 2xl:pt-22">
        <div className='max-w-[2000px] mx-auto'>
        <div className='overflow-hidden font-extrabold px-5 md:px-10 lg:px-16'>
          {/* Breadcrumb */}
          <motion.div 
            className="mt-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              href={language === 'en' ? '/' : '/zh'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-[#a1c4fd]/50 rounded-lg text-gray-300 hover:text-[#a1c4fd] transition-all duration-200 backdrop-blur-sm text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Tools
            </Link>
          </motion.div>

          <motion.h1 
            className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] leading-tight text-center
              text-2xl mb-4
              md:text-4xl md:mb-6
              lg:text-5xl lg:mb-8
              `}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {titleText}
          </motion.h1>
          
          <motion.p 
            className="text-gray-300/90 text-base md:text-lg lg:text-xl font-medium leading-relaxed tracking-wide text-center mb-6"
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
            <ContributeButton variant="ghost" size="sm" />
          </motion.div>
        </div>
      </div>

      <div className='max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12'>
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Custom timestamp option */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomTimestamp}
                onChange={(e) => setUseCustomTimestamp(e.target.checked)}
                className="w-4 h-4 text-[#a1c4fd] bg-gray-800 border-gray-600 rounded focus:ring-[#a1c4fd]"
              />
              <span className="text-white font-medium">Use custom timestamp</span>
            </label>
            
            {useCustomTimestamp && (
              <motion.div 
                className="mt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="datetime-local"
                  value={customTimestamp}
                  onChange={(e) => setCustomTimestamp(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a1c4fd]"
                />
              </motion.div>
            )}
          </div>

          {/* Share success message */}
          {shareMessage && (
            <motion.div 
              className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {shareMessage}
            </motion.div>
          )}

          {/* Generate button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleGenerate}
              className="px-8 py-4 bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] text-gray-900 font-medium rounded-lg hover:from-[#8fb3fc] hover:to-[#b1e1fa] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Generate ObjectID
            </button>
          </div>

          {/* Generated result */}
          {generatedId && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium text-lg">Generated ObjectID</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(generatedId)}
                      className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] hover:from-[#8fb3fc] hover:to-[#b1e1fa] text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                  <code className="text-[#a1c4fd] text-lg font-mono break-all">{generatedId}</code>
                </div>
                
                {/* ObjectID breakdown */}
                {(() => {
                  const info = getObjectIdInfo(generatedId);
                  return info && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">ObjectID Breakdown:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Timestamp:</span>
                          <div className="text-white font-mono">{info.timestampHex}</div>
                          <div className="text-gray-300 text-xs">{info.timestamp}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Machine/Process:</span>
                          <div className="text-white font-mono">{info.machineProcess}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Counter:</span>
                          <div className="text-white font-mono">{info.counter}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Created:</span>
                          <div className="text-white">{info.age}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* History */}
          {history.length > 0 && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"/>
                  </svg>
                  Generation History
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-gray-400 hover:text-red-400 text-xs transition-colors duration-200"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setGeneratedId(item.objectId)}
                    className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-[#a1c4fd]/50 transition-all duration-200 hover:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-[#a1c4fd] font-mono text-sm break-all">{item.objectId}</code>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Created: {item.readable}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SEO-Enhanced About Section */}
          <motion.article 
            className="bg-gray-800/30 rounded-lg p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <header>
              <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                What is MongoDB ObjectID?
              </h2>
            </header>
            
            <section className="space-y-4">
              <div>
                <h3 className="text-[#a1c4fd] font-semibold mb-2">ObjectID Fundamentals</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  MongoDB ObjectID is a 12-byte unique identifier that serves as the default primary key for documents in MongoDB databases. This powerful identifier not only ensures global uniqueness but also embeds timestamp information, allowing developers to easily track document creation times.
                </p>
                <ul className="text-gray-300 text-sm space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>12-byte structure:</strong> Timestamp (4 bytes) + Random value (5 bytes) + Counter (3 bytes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>Global uniqueness:</strong> Ensures identifier uniqueness across distributed systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>Embedded timestamp:</strong> Document creation time can be extracted directly from ObjectID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>Hexadecimal representation:</strong> Displayed as 24-character hexadecimal string</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#a1c4fd] font-semibold mb-2">Use Cases</h3>
                <ul className="text-gray-300 text-sm space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>MongoDB Development:</strong> Generate unique primary key identifiers for new documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>Data Migration:</strong> Create test data during database migration processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>API Development:</strong> Generate unique resource identifiers for RESTful APIs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a1c4fd] mt-1">•</span>
                    <span><strong>Temporal Analysis:</strong> Extract and analyze creation timestamps from existing ObjectIDs</span>
                  </li>
                </ul>
              </div>
            </section>
          </motion.article>

          {/* FAQ Section for SEO */}
          <motion.section
            className="bg-gray-800/30 rounded-lg p-6 border border-gray-700 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-white font-bold text-xl mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <details className="group">
                <summary className="cursor-pointer text-[#a1c4fd] font-medium list-none flex items-center justify-between">
                  <span>How does ObjectID ensure uniqueness?</span>
                  <svg className="w-5 h-5 transform transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </summary>
                <div className="mt-2 text-gray-300 text-sm pl-4">
                  ObjectID ensures uniqueness by combining timestamp, machine identifier, process ID, and an incrementing counter. Even if multiple ObjectIDs are generated on the same machine within the same millisecond, the incrementing counter ensures their uniqueness.
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-[#a1c4fd] font-medium list-none flex items-center justify-between">
                  <span>What information can be extracted from an ObjectID?</span>
                  <svg className="w-5 h-5 transform transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </summary>
                <div className="mt-2 text-gray-300 text-sm pl-4">
                  Primarily, you can extract the document&apos;s creation timestamp. The first 8 characters of an ObjectID represent the Unix timestamp (in seconds) when it was created. Other parts contain machine/process identifiers and counter information, but these are typically not used for direct analysis.
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-[#a1c4fd] font-medium list-none flex items-center justify-between">
                  <span>Why use custom timestamps?</span>
                  <svg className="w-5 h-5 transform transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </summary>
                <div className="mt-2 text-gray-300 text-sm pl-4">
                  Custom timestamps are useful for data migration, test data generation, or when you need to simulate documents created at specific times. This allows developers to create ObjectIDs that appear to have been created at past or future time points.
                </div>
              </details>
            </div>
          </motion.section>

          {/* Related Tools Section */}
          <motion.section
            className="bg-gray-800/30 rounded-lg p-6 border border-gray-700 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-white font-bold text-xl mb-4">Related Developer Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/json-extract"
                className="group p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-[#a1c4fd]/50 transition-all duration-300 hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-white font-medium group-hover:text-[#a1c4fd] transition-colors">
                    JSON Path Extractor
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Extract specific values from JSON data, perfect for processing MongoDB documents with ObjectIDs
                </p>
              </Link>

              <Link 
                href="/base64"
                className="group p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-[#a1c4fd]/50 transition-all duration-300 hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔤</span>
                  <h3 className="text-white font-medium group-hover:text-[#a1c4fd] transition-colors">
                    Base64 Encoder/Decoder
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Encode and decode Base64 strings, commonly used with ObjectIDs in API development and data transmission
                </p>
              </Link>
            </div>

            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Pro Tip
              </h3>
              <p className="text-blue-200 text-sm">
                In MongoDB queries, you can use the timestamp portion of ObjectID for time-range queries, which is more efficient than using a separate creation time field.
              </p>
            </div>
          </motion.section>
        </motion.div>
        </div>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}

function ObjectIdToolPageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <main className="flex-1 pt-20 2xl:pt-22">
        <div className="max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ObjectIdToolPage() {
  return (
    <Suspense fallback={<ObjectIdToolPageFallback />}>
      <ObjectIdToolPageContent />
    </Suspense>
  );
}