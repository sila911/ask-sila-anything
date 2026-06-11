import React, { useEffect, useState } from 'react';
import qrCode from '../assets/qr-code.jpg';

export default function BuyMeCoffeeModal({ isOpen, onClose }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure the initial state is rendered before animating
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Wait for the animation to finish before unmounting
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-500 ease-in-out ${
        isAnimating ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-sm rounded-[2.5rem] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50 text-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
          isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-[100vh] opacity-0 scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-600 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h1 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">Buy me a coffee</h1>
        
        <div className="mb-8 flex p-1 justify-center">
          <div className="relative bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-inner border border-white/20 dark:border-slate-700/30 backdrop-blur-sm">
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="w-42 h-48 p-1 object-cover rounded-xl shadow-sm"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200?text=QR+Code';
                e.target.onerror = null;
              }}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <a
            href="https://acledabank.com.kh/acleda?payment_data=qWY5B2SAUfIhLblxzOtfu45tm4QZydtR8ste17vNItjT3Chxy1uq2e1VifDvybGWoX8Md+nprYtJNaV2/goNF2hYO52Bv9AprFiSGN6OqxO2yg4RP2jReNqNssWZ+QE7O65BbuNH2o6b8t3mBcqXBjIaqihYWpVThtY8hw/mDS1tNqRWNqDUhPee+iISOuavOO6/wAZ16a/Gdnh+ovIdCw==&key=khqr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-50/50 dark:bg-[#005aab]/10 hover:bg-blue-100/50 dark:hover:bg-[#005aab]/20 text-[#005aab] dark:text-blue-400 py-3 font-bold transition-all transform active:scale-95 border border-[#005aab]/20 dark:border-[#005aab]/30 backdrop-blur-md shadow-sm"
          >
            <img src="https://www.acledabank.com.kh/kh/assets/download_material/download-logo-icon.png" alt="" className="w-6 h-6 object-contain" />
            <span>Acleda</span>
          </a>
          <a
            href="https://pay.ababank.com/oRF8/37utlwxa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-50/50 dark:bg-[#ec1c24]/10 hover:bg-red-100/50 dark:hover:bg-[#ec1c24]/20 text-[#ec1c24] dark:text-red-400 py-3 font-bold transition-all transform active:scale-95 border border-[#ec1c24]/20 dark:border-[#ec1c24]/30 backdrop-blur-md shadow-sm"
          >
            <img src="https://informal.digitaleconomy.gov.kh/images/ministry-icon/aba_round.png" alt="" className="w-6 h-6 object-contain" />
            <span>ABA</span>
          </a>
        </div>
        
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Your support means the world to me! 💫
        </p>
      </div>
    </div>
  );
}
