import React, { useState } from 'react';
import { FiCopy, FiCheck, FiFacebook, FiTwitter, FiSend, FiX } from 'react-icons/fi';

export default function ShareModal({ isOpen, onClose, url, questionText }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <FiFacebook size={20} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      colorClass: 'text-[#1877F2] bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/20 dark:text-[#4267B2] dark:bg-[#4267B2]/20 dark:border-[#4267B2]/30',
    },
    {
      name: 'X (Twitter)',
      icon: <FiTwitter size={20} />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this question: "' + questionText + '"')}`,
      colorClass: 'text-slate-900 bg-slate-200/50 hover:bg-slate-300/50 border-slate-300/50 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20',
    },
    {
      name: 'Telegram',
      icon: <FiSend size={20} />,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(questionText)}`,
      colorClass: 'text-[#0088cc] bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border-[#0088cc]/20 dark:text-[#3390ec] dark:bg-[#3390ec]/20 dark:border-[#3390ec]/30',
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-800/50 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-colors"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>
        
        <h1 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Share Question</h1>
        
        <div className="flex flex-col gap-3 mb-6">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 rounded-2xl py-3 font-bold transition-all transform active:scale-95 border backdrop-blur-md shadow-sm ${link.colorClass}`}
            >
              {link.icon}
              <span>Share to {link.name}</span>
            </a>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400">Or copy link</span>
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 truncate bg-white/50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm text-left">
            {url}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-colors border border-cyan-400/20 shadow-sm"
            title="Copy link"
          >
            {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
          </button>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
