import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check } from 'iconsax-react';

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
      icon: <img src="https://img.icons8.com/3d-fluency/94/telegram.png" alt="Telegram" className="w-8 h-8 object-contain" />,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(questionText)}`,
    }
  ];

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div 
        className={`glass-shell relative w-full max-w-2xl rounded-t-3xl p-5 sm:p-6 shadow-2xl text-center transition-transform duration-300 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >

        
        <h1 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Share Question</h1>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-subpane flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 font-semibold transition-all transform active:scale-95 hover:bg-white/40 dark:hover:bg-white/5 shadow-sm"
            >
              {link.icon}
              <span className="text-xs text-slate-700 dark:text-slate-200">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#fcfcfd] dark:bg-[#131b2b] text-slate-500 dark:text-slate-400 rounded-full">Or copy link</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="glass-subpane flex-1 truncate rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 text-left">
            {url}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-colors border border-cyan-400/20 shadow-sm"
            title="Copy link"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}