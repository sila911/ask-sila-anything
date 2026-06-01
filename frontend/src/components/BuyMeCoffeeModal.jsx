import React from 'react';

export default function BuyMeCoffeeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl border border-white/20 dark:border-slate-800/50 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/50 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Buy me a coffee</h1>
        
        <div className="mb-8 flex justify-center">
          <div className="relative p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-inner border border-white/20 dark:border-slate-700/30 backdrop-blur-sm">
            <img 
              src="/qr-code.jpg" 
              alt="QR Code" 
              className="w-42 h-48 object-cover rounded-xl shadow-sm"
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
        
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Thank you for your support! ❤️
        </p>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
