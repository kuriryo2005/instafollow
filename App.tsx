
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppView } from './types';

// Constants
const TARGET_ACCOUNT = 'akari.0106';
const DEFAULT_TIME = 600; // 10 minutes in seconds
const APP_PASSWORD = '20050608'; // User provided password

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SETUP);
  const [seconds, setSeconds] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [persuasiveText, setPersuasiveText] = useState('System ready.');
  
  const timerRef = useRef<number | null>(null);

  const fetchPersuasiveMessage = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Instagramで「${TARGET_ACCOUNT}」をフォローするための10分間のカウントダウンが走っています。
        Apple公式サイトのような、非常に洗練された、短く、心に響く、未来的な日本語のメッセージを1つ生成してください。
        「プライバシー」「時間」「約束」などのキーワードを上品に織り交ぜてください。`,
        config: { temperature: 0.7 }
      });
      setPersuasiveText(response.text || '大切な一歩。時が満ちるのを待つ。');
    } catch (error) {
      console.error('Gemini error:', error);
      setPersuasiveText('時は、静かに、確実に。');
    }
  };

  useEffect(() => {
    if (view === AppView.COUNTDOWN) {
      fetchPersuasiveMessage();
    }
  }, [view]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      setView(AppView.COMPLETE);
      if (timerRef.current) window.clearInterval(timerRef.current);
      handleRedirect();
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isActive, seconds]);

  const startTimer = () => {
    setIsActive(true);
    setView(AppView.COUNTDOWN);
  };

  const handleUnlockAttempt = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsActive(false);
      setView(AppView.SETUP);
      setSeconds(DEFAULT_TIME);
      setPasswordInput('');
      setIsWrongPassword(false);
    } else {
      setIsWrongPassword(true);
      setTimeout(() => setIsWrongPassword(false), 2000);
    }
  };

  const handleRedirect = () => {
    window.location.href = `https://www.instagram.com/${TARGET_ACCOUNT}/`;
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black overflow-hidden">
      
      {/* Global Navigation Bar (Apple Style) */}
      <nav className="fixed top-0 w-full h-12 apple-blur z-50 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <i className="fab fa-instagram text-white/90 text-lg"></i>
          <span className="text-xs font-semibold tracking-wide text-white/90">InstaFollow Pro</span>
        </div>
        <div className="flex gap-6">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Secure</span>
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Automated</span>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-12">
        
        {/* Setup View */}
        {view === AppView.SETUP && (
          <div className="text-center max-w-2xl w-full space-y-12 animate-apple">
            <header className="space-y-4">
              <h2 className="text-[#86868b] text-xl font-semibold tracking-tight">Mission Control</h2>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                時が、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#86868b]">つながりを変える。</span>
              </h1>
              <p className="text-[#a1a1a6] text-lg md:text-xl font-medium max-w-lg mx-auto">
                10分後に @{TARGET_ACCOUNT} へのフォローを開始します。<br />
                これは、あなた自身との約束です。
              </p>
            </header>

            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={startTimer}
                className="px-8 py-3.5 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0077ed] transition-all text-base md:text-lg shadow-lg shadow-[#0071e3]/20 active:scale-95"
              >
                スケジュールを開始
              </button>
              <div className="flex items-center gap-2 text-[#424245] text-xs font-medium">
                <i className="fas fa-lock"></i>
                <span>パスワードによる保護が有効です</span>
              </div>
            </div>
          </div>
        )}

        {/* Countdown & Locked View */}
        {(view === AppView.COUNTDOWN || view === AppView.LOCKED) && (
          <div className="text-center w-full max-w-xl space-y-16 animate-apple">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white/60 uppercase">
                {view === AppView.LOCKED ? 'Security Protocol' : 'Mission in Progress'}
              </span>
              <h2 className="text-[#86868b] text-base font-medium mt-4">Remaining Time</h2>
            </div>

            <div className="relative group">
              <div className="text-[120px] md:text-[180px] font-bold tracking-tighter leading-none text-white transition-all tabular-nums">
                {formatTime(seconds)}
              </div>
              <div className="text-[#86868b] text-xl font-medium tracking-wide">
                until following @{TARGET_ACCOUNT}
              </div>
            </div>

            <div className="max-w-md mx-auto h-16 flex items-center justify-center px-6 border-l border-white/20">
              <p className="text-[#a1a1a6] text-sm md:text-base italic leading-relaxed">
                &ldquo;{persuasiveText}&rdquo;
              </p>
            </div>

            <div className="flex flex-col items-center gap-8">
              {view === AppView.LOCKED ? (
                <div className="w-full max-w-xs space-y-6 animate-apple">
                  <div className="space-y-2">
                    <input 
                      type="password"
                      placeholder="Passcode"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`w-full bg-[#1d1d1f] border ${isWrongPassword ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-6 text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all`}
                      autoFocus
                    />
                    {isWrongPassword && <p className="text-red-500 text-[10px] font-bold tracking-wider uppercase">Incorrect Passcode</p>}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleUnlockAttempt}
                      className="flex-1 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all active:scale-95"
                    >
                      解除
                    </button>
                    <button 
                      onClick={() => setView(AppView.COUNTDOWN)}
                      className="flex-1 py-3 bg-[#1d1d1f] text-white/60 font-semibold rounded-full hover:bg-[#2d2d2f] transition-all active:scale-95"
                    >
                      戻る
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setView(AppView.LOCKED)}
                  className="text-[#0071e3] hover:underline text-sm font-semibold tracking-tight"
                >
                  キャンセルまたは解除
                </button>
              )}
            </div>
          </div>
        )}

        {/* Complete View */}
        {view === AppView.COMPLETE && (
          <div className="text-center space-y-12 animate-apple">
            <header className="space-y-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-white/10">
                <i className="fas fa-check text-black text-3xl"></i>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Mission Accomplished.</h1>
              <p className="text-[#a1a1a6] text-xl">準備は整いました。新しいつながりを楽しみましょう。</p>
            </header>

            <div className="flex flex-col items-center gap-8">
              <button 
                onClick={handleRedirect}
                className="px-10 py-4 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0077ed] transition-all text-lg shadow-xl shadow-[#0071e3]/30 active:scale-95"
              >
                Instagram で表示
              </button>
              <button 
                onClick={() => {
                  setSeconds(DEFAULT_TIME);
                  setView(AppView.SETUP);
                }}
                className="text-[#a1a1a6] hover:text-white text-xs font-medium underline-offset-4 hover:underline transition-all"
              >
                新しいスケジュールを作成
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Product Footer (Apple Style) */}
      <footer className="w-full p-8 flex flex-col items-center gap-4 text-[#424245]">
        <div className="w-full max-w-4xl border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] tracking-wide font-medium">Copyright © 2025 InstaFollow Pro. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] tracking-widest font-bold uppercase">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>

      {/* Global Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#0071e3]/5 rounded-full blur-[160px]"></div>
      </div>
    </div>
  );
};

export default App;
