'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// 🌟 شعار Nova الهندسي الفخم (ثابت ولا يتأثر بالأنيميشن الخاص بالـ Thinking)
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
  </svg>
);

const LanguageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const translations = {
  en: {
    securityKey: "SECURITY KEY REQUIRED",
    accessAccount: "ACCESS SYSTEM ACCOUNT",
    processing: "Analyzing context...",
    placeholder: "Ask a question or describe the website you want to build...",
    livePreview: "Live Preview Workspace",
    prodDeploy: "Production Deploy",
    previewWin: "PREVIEW WINDOW (SANDBOX)",
    close: "Close Preview",
    deployProgress: "COMPILING PRODUCTION BUILD",
    envLive: "✓ Production Environment Live at:",
    returnWorkspace: "Return to Workspace",
    syncing: "Optimizing cloud assets & linking domain...",
    signOut: "Logout",
    language: "Language",
    profile: "Profile",
    dir: "ltr"
  }
};

export default function NovaAI() {
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [isExitingPassword, setIsExitingPassword] = useState(false);
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  const [lang] = useState<'en'>('en');
  const t = translations[lang];

  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [thinkingStatusText, setThinkingStatusText] = useState('Thinking...');
  const [isListening, setIsListening] = useState(false);
  
  // شات تفاعلي يبدأ بترحيب احترافي ونظيف
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: "Hello! I am NOVA AI. I can answer your technical questions with elite precision, or architect custom web environments. What are we exploring today?" }
  ]);
  const [isChatActive, setIsChatActive] = useState(true); 

  // إدارة حالات بناء الموقع الذكي (مرحلة جمع المعلومات والتطوير التدريجي)
  const [currentProjectState, setCurrentProjectState] = useState<'idle' | 'asking_details' | 'ready_to_build'>('idle');
  const [collectedDetails, setCollectedDetails] = useState('');
  const [activePreviewCode, setActivePreviewCode] = useState<string | null>(null);
  
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deployingStatus, setDeployingStatus] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStep('main');
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setStep('main');
        setUser(session.user);
      } else {
        setStep('password');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages, robotState]);

  const checkPassword = () => {
    if (password === 'yousefyousefbaker505') {
      setIsExitingPassword(true);
      setTimeout(() => {
        setStep('oauth');
        setIsExitingPassword(false);
      }, 500);
    } else {
      setRobotIsShaking(true);
      setTimeout(() => {
        setRobotIsShaking(false);
        setPassword('');
      }, 800);
    }
  };

  // معالج النصوص والذكاء الاصطناعي التفاعلي
  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');
    setRobotState('thinking');
    setThinkingStatusText('Analyzing input request...');

    // محاكاة تأخير منطقي ومراحل تفكير واقعية تدريجية
    setTimeout(() => {
      setThinkingStatusText('Processing logical solution...');
      
      setTimeout(() => {
        // 1. التحقق إذا كان المستخدم يتكلم في سياق تجميع تفاصيل مشروع موقع معين
        if (currentProjectState === 'asking_details') {
          setRobotState('normal');
          setCurrentProjectState('ready_to_build');
          setCollectedDetails(userText);
          
          // الكود المبدئي بناءً على مواصفات العميل يوضع في الـ Preview
          setActivePreviewCode(`<!DOCTYPE html><html><head><style>body { background: #050505; color: #fff; font-family: sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; } .box { border: 1px dashed #333; padding: 40px; border-radius: 12px; text-align:center; box-shadow: 0 4px 30px rgba(0,0,0,0.5); }</style></head><body><div class="box"><h1>Custom Workspace Preview</h1><p>Architected perfectly around your custom prompt: "${userText}"</p><p style="color:#888; font-size:0.9rem;">This workspace is fully scalable. You can request changes or click Production Deploy anytime.</p></div></body></html>`);
          
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `🎯 Dynamic specifications loaded successfully!\n\nI have structured a comprehensive Live Preview according to your details. You can view it via the "Live Preview Workspace" button at the top left. If you need any code iterations, just let me know here. If it's perfect, click "Production Deploy" to publish it live.`
            }
          ]);
          return;
        }

        // 2. التحقق من نية بناء موقع جديد (Trigger Project Initialization)
        const lowerText = userText.toLowerCase();
        const isBuildIntent = lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('website') || lowerText.includes('make') || lowerText.includes('موقع') || lowerText.includes('انشاء');
        
        if (isBuildIntent) {
          setRobotState('normal');
          setCurrentProjectState('asking_details');
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `💡 I detected that you want to engineer a new web platform. Before we compile the architecture, are there any custom details or technical requirements you want included? (e.g., Specific color schemes, UI sections, responsive layouts, or branding style)`
            }
          ]);
        } else {
          // 3. الإجابة على الأسئلة العادية بكل احترافية دون المساس بنظام البناء
          setRobotState('normal');
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `🛡️ Elite Solution:\n\nThat is an excellent conceptual question. To address this efficiently, we must look at it from a pure structural standpoint. In computing and system engineering, maintaining modularity ensures that components operate independently without causing regression errors. Let me know if you want me to expand deeper on any technical aspect of this topic!`
            }
          ]);
        }
      }, 1000);
    }, 1200);
  };

  // تفعيل عملية النشر الإنتاجي الحقيقي للرابط النهائي
  const triggerDeployment = () => {
    if (!activePreviewCode) {
      alert("Please initiate a website design workspace inside the chat before deploying to production.");
      return;
    }
    
    setDeployingStatus({ active: true, progress: 0, url: null });
    
    // محاكاة خطوات الـ Build الحقيقية بصورة متدرجة فخمة
    const steps = [
      { p: 20, t: 'Parsing source code elements...' },
      { p: 45, t: 'Bundling distribution assets...' },
      { p: 70, t: 'Provisioning secure cloud infrastructure...' },
      { p: 90, t: 'Binding dynamic URL endpoints...' },
      { p: 100, t: 'Production site online!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const current = steps[currentStepIdx];
        setDeployingStatus(prev => ({
          ...prev,
          progress: current.p
        }));
        setThinkingStatusText(current.t);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setDeployingStatus(prev => ({
          ...prev,
          progress: 100,
          url: `https://nova-production-grid-${Math.floor(1000 + Math.random() * 9000)}.vercel.app`
        }));
      }
    }, 900);
  };

  const toggleVoice = () => {
    alert('Voice input interface ready.');
  };

  return (
    <div style={{ 
      direction: t.dir as 'rtl' | 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#000000', color: '#ffffff',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      {/* الأنيميشن والتنسيقات المخصصة لخلفية الجرونج وهيكل المحادثة */}
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 4px rgba(255,255,255,0.02)); }
          50% { transform: translateY(-4px); filter: drop-shadow(0 0 10px rgba(255,255,255,0.1)); }
        }
        @keyframes shakeLogo {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        @keyframes thinkingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes fadeInMessages {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes grungeVisualNutrition {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.06) rotate(2deg); }
        }

        .animated-grunge-bg {
          position: fixed;
          top: -10%; left: -10%; width: 120%; height: 120%;
          background-image: url('image_efdcc5.png');
          background-position: center; background-size: cover;
          opacity: 0.28; filter: contrast(140%) brightness(55%) grayscale(30%);
          z-index: -2; animation: grungeVisualNutrition 30s ease-in-out infinite alternate;
          pointer-events: none; will-change: transform;
        }

        .bg-vignette-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,0,0,0.92) 90%);
          z-index: -1; pointer-events: none;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>

      <div className="animated-grunge-bg"></div>
      <div className="bg-vignette-overlay"></div>

      {/* ==================== 🛠️ شريط التحكم العلوي المتطور والأنيق ==================== */}
      {step === 'main' && user && (
        <div style={{ 
          position: 'absolute', top: '24px', left: '24px', right: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 11000, pointerEvents: 'none'
        }}>
          
          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', direction: 'ltr' }}>
            <button 
              onClick={() => {
                if(!activePreviewCode) {
                  alert("No active workspace found. Ask Nova to initialize a website to access preview mode!");
                  return;
                }
                setPreviewModalOpen(true);
              }}
              style={{ background: activePreviewCode ? '#0a0a0a' : '#030303', border: activePreviewCode ? '1px solid #222' : '1px solid #111', color: activePreviewCode ? '#ffffff' : '#555555', padding: '8px 16px', borderRadius: '8px', cursor: activePreviewCode ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s' }}
            >
              {t.livePreview} {activePreviewCode && '⚡'}
            </button>
            <button 
              onClick={triggerDeployment}
              disabled={!activePreviewCode}
              style={{ background: activePreviewCode ? '#ffffff' : '#111111', border: 'none', color: activePreviewCode ? '#000000' : '#444444', padding: '8px 16px', borderRadius: '8px', cursor: activePreviewCode ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: '600', transition: 'opacity 0.2s' }}
            >
              {t.prodDeploy}
            </button>
          </div>

          <div ref={menuRef} style={{ pointerEvents: 'auto', position: 'relative' }}>
            <button 
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsLangMenuOpen(false); }}
              style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            >
              <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 'bold' }}>{user.email?.charAt(0).toUpperCase()}</span>
            </button>

            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '48px', right: 0, background: '#050505', border: '1px solid #1f1f1f', borderRadius: '12px', width: '200px', padding: '6px', boxSizing: 'border-box' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #141414' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#666666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#ff6b6b', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}
                >
                  <LogoutIcon />
                  <span>{t.signOut}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================== [1] شاشة بوابة فحص كلمة المرور الفاخرة ==================== */}
      {step === 'password' && (
        <div style={{ 
          animation: isExitingPassword ? 'screenFadeOut 0.5s ease forwards' : 'none', 
          textAlign: 'center', width: '90%', maxWidth: '360px', background: 'rgba(0, 0, 0, 0.6)', 
          backdropFilter: 'blur(10px)', border: '1px solid #141414', padding: '45px 30px', borderRadius: '16px', zIndex: 10
        }}>
          <div style={{ margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', animation: robotIsShaking ? 'shakeLogo 0.15s infinite' : 'floatLogo 4s infinite ease-in-out' }}>
            <NovaLogoIcon size={110} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#555555', margin: '0 0 20px 0', letterSpacing: '1.5px', fontWeight: '600' }}>{t.securityKey}</p>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '12px', fontSize: '1rem', color: '#ffffff', textAlign: 'center', border: '1px solid #1f1f1f', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', background: '#000000', letterSpacing: '2px' }} 
          />
        </div>
      )}

      {/* ==================== [2] بوابة التحقق وبوابات الحساب الذكية ==================== */}
      {step === 'oauth' && (
        <div style={{ width: '90%', maxWidth: '370px', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid #141414', padding: '35px 25px', borderRadius: '16px', boxSizing: 'border-box', zIndex: 10 }}>
          <div style={{ margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center', animation: 'floatLogo 4s infinite ease-in-out' }}>
            <NovaLogoIcon size={85} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#ffffff', marginBottom: '25px', letterSpacing: '1px', fontWeight: '600', textAlign: 'center' }}>{t.accessAccount}</p>
          <div className="supabase-auth-container" style={{ direction: 'ltr' }}>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google', 'github']} theme="dark" showLinks={true} />
          </div>
        </div>
      )}

      {/* ==================== [3] شاشة محرك الشات المتمحور الذكي ==================== */}
      {step === 'main' && (
        <div style={{ 
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', padding: '30px 20px', boxSizing: 'border-box', zIndex: 10
        }}>
          
          <div style={{
            width: '100%', maxWidth: '720px',
            height: '83vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', alignItems: 'center'
          }}>

            {/* الشعار ثابت وفخم ولا يهتز أو يتأثر بالـ Thinking */}
            <div style={{
              transform: 'scale(0.65)', marginBottom: '5px',
              animation: 'floatLogo 4s infinite ease-in-out',
              flexShrink: 0
            }}>
              <NovaLogoIcon size={95} />
            </div>

            {/* منطقة رسائل الشات الاحترافية */}
            <div className="custom-scrollbar" style={{ 
              width: '100%', flex: 1, overflowY: 'auto', 
              display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 5px',
              margin: '10px 0', animation: 'fadeInMessages 0.4s ease'
            }} ref={chatBoxRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ 
                    maxWidth: '85%', padding: '14px 18px', borderRadius: '12px', 
                    background: msg.sender === 'user' ? '#0a0a0a' : '#030303', 
                    border: msg.sender === 'user' ? '1px solid #141414' : '1px solid #131313', 
                    fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'left', direction: 'ltr'
                  }}>
                    <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  </div>
                </div>
              ))}

              {/* ⚙️ تأثير الـ Thinking الاحترافي والمنفصل كلياً عن الشعار في أسفل الشات */}
              {robotState === 'thinking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: 'fit-content', background: '#050505', border: '1px dashed #222', padding: '12px 20px', borderRadius: '10px', animation: 'fadeInMessages 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#ffffff', borderRadius: '50%', animation: 'shakeLogo 0.5s infinite alternate' }} />
                    <span style={{ fontSize: '0.8rem', color: '#888888', letterSpacing: '0.5px' }}>{thinkingStatusText}</span>
                  </div>
                  <div style={{ width: '120px', height: '2px', background: '#111', position: 'relative', overflow: 'hidden', borderRadius: '1px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: '#ffffff', animation: 'thinkingBar 1.5s infinite ease-in-out' }} />
                  </div>
                </div>
              )}
            </div>

            {/* صندوق المدخلات البيضاوي الفاخر */}
            <div style={{ 
              width: '100%', display: 'flex', gap: '12px', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', 
              padding: '12px 16px', borderRadius: '100px', alignItems: 'center', boxSizing: 'border-box', flexShrink: 0
            }}>
              <input 
                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={robotState === 'thinking' ? t.processing : t.placeholder} 
                disabled={robotState === 'thinking'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.95rem', padding: '4px 8px', textAlign: 'left' }}
              />

              <button 
                onClick={toggleVoice} 
                disabled={robotState === 'thinking'} 
                style={{ background: '#1a1a1a', color: '#aaaaaa', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MicrophoneIcon />
              </button>
              
              <button 
                onClick={handleSendMessage} 
                disabled={robotState === 'thinking' || !userInput.trim()} 
                style={{ background: userInput.trim() ? '#ffffff' : '#1a1a1a', color: userInput.trim() ? '#000000' : '#444444', border: 'none', width: '56px', height: '38px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <SendIcon />
              </button>
            </div>

          </div>

          {/* ==================== نافذة الـ Live Preview الهيكلية القابلة للتطوير ==================== */}
          {previewModalOpen && activePreviewCode && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000, padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: '1000px', height: '85vh', background: '#000000', border: '1px solid #1f1f1f', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', background: '#030303' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', letterSpacing: '1px', color: '#ffffff', fontWeight: 'bold' }}>{t.previewWin}</span>
                    <span style={{ fontSize: '0.75rem', background: '#111', color: '#888', padding: '2px 8px', borderRadius: '4px' }}>Development Build</span>
                  </div>
                  <button onClick={() => setPreviewModalOpen(false)} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>{t.close}</button>
                </div>
                <iframe srcDoc={activePreviewCode} title="Nova Scalable Workspace" style={{ flex: 1, width: '100%', border: 'none', background: '#ffffff' }} />
              </div>
            </div>
          )}

          {/* ==================== شاشة معالجة الـ Production Deploy النهائية والمستقلة ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
              <div style={{ width: '90%', maxWidth: '420px', background: '#050505', border: '1px solid #1f1f1f', padding: '40px 35px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
                <p style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#555555', marginBottom: '20px', fontWeight: 'bold' }}>{t.deployProgress}</p>
                
                <div style={{ width: '100%', height: '2px', background: '#111', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ width: `${deployingStatus.progress}%`, height: '100%', background: '#ffffff', transition: 'width 0.4s ease' }} />
                </div>
                
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>{deployingStatus.progress}%</p>
                <p style={{ color: '#888888', fontSize: '0.8rem', marginBottom: '25px', fontStyle: 'italic' }}>{thinkingStatusText}</p>
                
                {deployingStatus.url && (
                  <div style={{ animation: 'fadeInMessages 0.4s ease' }}>
                    <div style={{ background: '#0a0a0a', border: '1px solid #141414', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
                      <p style={{ color: '#666666', fontSize: '0.8rem', margin: '0 0 8px 0' }}>{t.envLive}</p>
                      <a href={deployingStatus.url} target="_blank" rel="noreferrer" style={{ color: '#ffffff', fontSize: '0.85rem', wordBreak: 'break-all', fontWeight: '500', textDecoration: 'underline' }}>{deployingStatus.url}</a>
                    </div>
                    <button onClick={() => setDeployingStatus({ active: false, progress: 0, url: null })} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>{t.returnWorkspace}</button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}