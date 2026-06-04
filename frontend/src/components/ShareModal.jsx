import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';

export default function ShareModal({ isOpen, onClose, url, questionText }) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow the DOM element to mount before adding transition classes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for the slide-out animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <img src="https://img.icons8.com/3d-fluency/94/facebook-logo.png" alt="Facebook" className="w-8 h-8 object-contain" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Messenger',
      icon: <img src="https://img.icons8.com/fluency/96/facebook-messenger--v2.png" alt="Messenger" className="w-8 h-8 object-contain" />,
      href: `fb-messenger://share/?link=${encodeURIComponent(url)}`,
    },
    {
      name: 'Instagram',
      icon: <img src="https://img.icons8.com/3d-fluency/94/instagram-logo.png" alt="Instagram" className="w-8 h-8 object-contain" />,
      href: `https://instagram.com/`, 
    },
    {
      name: 'Telegram',
      icon: <img src="https://img.icons8.com/external-flat-icons-inmotus-design/67/external-blue-telegram-flat-icons-inmotus-design.png" alt="Telegram" className="w-8 h-8 object-contain" />,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(questionText)}`,
    }
  ];

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-sm rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-800/50 text-center transition-transform duration-300 ease-out transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-[150%] sm:translate-y-12 sm:scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>
        
        <h1 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Share Question</h1>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition-all transform active:scale-95 border bg-white/60 hover:bg-white border-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-slate-700 shadow-sm"
            >
              {link.icon}
              <span className="text-sm text-slate-700 dark:text-slate-200">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#fcfcfd] dark:bg-[#131b2b] text-slate-500 dark:text-slate-400 rounded-full">Or copy link</span>
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
    </div>,
    document.body
  );
}