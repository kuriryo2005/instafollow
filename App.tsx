
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppView } from './types';

// Constants
const TARGET_ACCOUNT = 'akari.0102';
const DISPLAY_NAME = 'あかり';
const STATS = {
  posts: '0',
  followers: '495',
  following: '509'
};
const DEFAULT_TIME = 600; // 10 minutes in seconds
const APP_PASSWORD = '20050608';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [seconds, setSeconds] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);
  
  // App-specific password state (for unlocking/cancelling)
  const [passwordInput, setPasswordInput] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  
  // Simulated Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [persuasiveText, setPersuasiveText] = useState('System ready.');
  
  const timerRef = useRef<number | null>(null);

  const fetchPersuasiveMessage = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Instagramで「${TARGET_ACCOUNT}」(${DISPLAY_NAME})をフォローするためのカウントダウンが走っています。
        Apple公式サイトのような、非常に洗練された、短く、心に響く、未来的な日本語のメッセージを1つ生成してください。
        「つながり」「時間」「新しい世界」などのキーワードを上品に織り交ぜてください。`,
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    setIsLoggingIn(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoggingIn(false);
      setView(AppView.SETUP);
    }, 1200);
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

  const ProfilePreview = () => (
    <div className="flex flex-col items-center gap-6 py-6 px-8 rounded-[2rem] bg-white/5 border border-white/10 apple-blur animate-apple">
      <div className="flex items-center gap-6 w-full max-w-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b8c6db] to-[#f5f7fa] border border-white/10 shadow-inner overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-400/10 blur-xl"></div>
        </div>
        <div className="flex flex-col text-left">
          <h3 className="text-xl font-bold tracking-tight text-white">{TARGET_ACCOUNT}</h3>
          <p className="text-[#86868b] font-medium">{DISPLAY_NAME}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 w-full border-t border-white/10 pt-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-white">{STATS.posts}</span>
          <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-bold">posts</span>
        </div>
        <div className="flex flex-col items-center border-x border-white/10">
          <span className="text-lg font-bold text-white">{STATS.followers}</span>
          <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-bold">followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-white">{STATS.following}</span>
          <span className="text-[10px] text-[#86868b] uppercase tracking-widest font-bold">following</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black overflow-hidden">
      
      {/* Global Navigation Bar */}
      <nav className="fixed top-0 w-full h-12 apple-blur z-50 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <i className="fab fa-instagram text-white/90 text-lg"></i>
          <span className="text-xs font-semibold tracking-wide text-white/90">InstaFollow Pro</span>
        </div>
        <div className="flex gap-6">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Secure Terminal</span>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-16 pb-12 overflow-y-auto">
        
        {/* Login View */}
        {view === AppView.LOGIN && (
          <div className="w-full max-w-sm space-y-12 animate-apple">
            <header className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/10">
                <i className="fab fa-instagram text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Sign In</h1>
              <p className="text-[#86868b] text-sm">Instagramアカウントでログインして、<br />自動フォロー機能を開始します。</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="ユーザーネーム、電話番号、またはメールアドレス"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#1d1d1f] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-[#424245]"
                  required
                />
                <input 
                  type="password"
                  placeholder="パスワード"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#1d1d1f] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-[#424245]"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-3.5 ${isLoggingIn ? 'bg-[#0071e3]/50' : 'bg-[#0071e3]'} text-white font-semibold rounded-xl hover:bg-[#0077ed] transition-all text-sm active:scale-[0.98] flex items-center justify-center gap-2`}
              >
                {isLoggingIn ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  'ログイン'
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <div className="h-[1px] bg-white/10 flex-grow"></div>
                <span className="px-4 text-[10px] text-[#424245] uppercase font-bold tracking-widest">or</span>
                <div className="h-[1px] bg-white/10 flex-grow"></div>
              </div>

              <button 
                type="button"
                className="w-full py-3 text-[#0071e3] font-semibold text-sm hover:underline"
              >
                パスワードを忘れた場合
              </button>
            </form>

            <footer className="text-center">
              <p className="text-[#424245] text-[10px] leading-relaxed">
                ログインすることで、プライバシー規約および<br />
                セキュリティプロトコルに同意したことになります。
              </p>
            </footer>
          </div>
        )}

        {/* Setup View */}
        {view === AppView.SETUP && (
          <div className="text-center max-w-2xl w-full space-y-10 animate-apple">
            <header className="space-y-4">
              <h2 className="text-[#86868b] text-lg font-semibold tracking-tight">Login Successful</h2>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                新しい、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#86868b]">つながりのデザイン。</span>
              </h1>
            </header>

            <ProfilePreview />

            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={startTimer}
                className="px-10 py-4 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0077ed] transition-all text-lg shadow-lg shadow-[#0071e3]/20 active:scale-95"
              >
                10分間のスケジュールを開始
              </button>
              <div className="flex items-center gap-2 text-[#424245] text-xs font-medium">
                <i className="fas fa-lock"></i>
                <span>プロトコル 20050608 により保護されています</span>
              </div>
            </div>
          </div>
        )}

        {/* Countdown & Locked View */}
        {(view === AppView.COUNTDOWN || view === AppView.LOCKED) && (
          <div className="text-center w-full max-w-xl space-y-12 animate-apple">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest text-white/60 uppercase">
                {view === AppView.LOCKED ? 'Authentication Required' : 'Active Engagement'}
              </span>
            </div>

            <div className="relative group">
              <div className="text-[100px] md:text-[140px] font-bold tracking-tighter leading-none text-white tabular-nums drop-shadow-2xl">
                {formatTime(seconds)}
              </div>
              <div className="text-[#86868b] text-lg font-medium tracking-tight mt-2 flex items-center justify-center gap-2">
                <i className="fab fa-instagram"></i>
                <span>following @{TARGET_ACCOUNT}</span>
              </div>
            </div>

            <ProfilePreview />

            <div className="max-w-md mx-auto min-h-[4rem] flex items-center justify-center px-6 border-l border-white/20">
              <p className="text-[#a1a1a6] text-sm md:text-base italic leading-relaxed animate-pulse">
                &ldquo;{persuasiveText}&rdquo;
              </p>
            </div>

            <div className="flex flex-col items-center gap-8">
              {view === AppView.LOCKED ? (
                <div className="w-full max-w-xs space-y-6 animate-apple">
                  <div className="space-y-2">
                    <input 
                      type="password"
                      placeholder="Enter Passcode"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`w-full bg-[#1d1d1f] border ${isWrongPassword ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-6 text-center text-xl tracking-[0.5em] focus:outline-none transition-all placeholder:tracking-normal placeholder:text-sm`}
                      autoFocus
                    />
                    {isWrongPassword && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Invalid Passcode</p>}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleUnlockAttempt}
                      className="flex-1 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all active:scale-95"
                    >
                      解除
                    </button>
                    <button 
                      onClick={() => setView(AppView.COUNTDOWN)}
                      className="flex-1 py-3.5 bg-[#1d1d1f] text-white/60 font-semibold rounded-full hover:bg-[#2d2d2f] transition-all active:scale-95"
                    >
                      戻る
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setView(AppView.LOCKED)}
                  className="text-[#0071e3] hover:underline text-sm font-semibold"
                >
                  キャンセルまたは設定変更
                </button>
              )}
            </div>
          </div>
        )}

        {/* Complete View */}
        {view === AppView.COMPLETE && (
          <div className="text-center space-y-12 animate-apple">
            <header className="space-y-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-white/20">
                <i className="fas fa-check text-black text-3xl"></i>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Mission Accomplished.</h1>
              <p className="text-[#a1a1a6] text-xl">@{TARGET_ACCOUNT} への扉が開かれました。</p>
            </header>

            <ProfilePreview />

            <div className="flex flex-col items-center gap-8 pt-4">
              <button 
                onClick={handleRedirect}
                className="px-12 py-4 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0077ed] transition-all text-lg shadow-xl shadow-[#0071e3]/30 active:scale-95"
              >
                Instagram を開く
              </button>
              <button 
                onClick={() => {
                  setSeconds(DEFAULT_TIME);
                  setView(AppView.SETUP);
                }}
                className="text-[#a1a1a6] hover:text-white text-xs font-medium underline-offset-4 hover:underline transition-all"
              >
                別のスケジュールを構成
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="w-full p-8 flex flex-col items-center gap-4 text-[#424245]">
        <div className="w-full max-w-4xl border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] tracking-wide font-medium">Copyright © 2025 InstaFollow Pro. Apple-inspired Interface.</p>
          <div className="flex gap-6 text-[10px] tracking-widest font-bold uppercase">
            <span>Security</span>
            <span>Compliance</span>
          </div>
        </div>
      </footer>

      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] bg-[#0071e3]/5 rounded-full blur-[180px]"></div>
      </div>
    </div>
  );
};

export default App;
