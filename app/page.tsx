'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// ==================== 🎨 الأيقونات والـ SVG ====================
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ==================== 🚀 المكون الرئيسي للواجهة ====================
export default function NovaAI() {
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const [profileData, setProfileData] = useState({
    displayName: 'Nova User',
    avatarUrl: '',
    bio: 'Software Engineer & Designer',
    location: 'Kuwait'
  });
  
  const [userInput, setUserInput] = useState('');
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking'>('normal');
  const [thinkingStatusText, setThinkingStatusText] = useState('جاري المعالجة...');
  
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: "مرحباً، أنا NOVA AI. كيف يمكنني مساعدتك اليوم؟" }
  ]);

  const [currentProjectState, setCurrentProjectState] = useState<'idle' | 'asking_details' | 'ready_to_build'>('idle');
  const [showWorkspaceButtons, setShowWorkspaceButtons] = useState(false); 
  const [deployingStatus, setDeployingStatus] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // مراقبة جلسة تسجيل الدخول مع Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        if (session.user.user_metadata?.full_name) {
          setProfileData(p => ({ ...p, displayName: session.user.user_metadata.full_name }));
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        setStep('password'); // إعادة القفل الأمني عند الخروج
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // إغلاق القائمة المنسدلة عند الضغط في أي مكان خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // عمل سكرول تلقائي لأسفل الشات عند وصول رسائل جديدة
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages, robotState]);

  // فحص حائط الحماية الأول (Password Wall)
  const checkPassword = async () => {
    if (password === 'yousefyousefbaker505') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStep('main');
      } else {
        setStep('oauth');
      }
    } else {
      setRobotIsShaking(true);
      // الاهتزاز العنيف ممتد لـ 500ms متوافق مع الـ CSS Keyframes
      setTimeout(() => {
        setRobotIsShaking(false);
        setPassword('');
      }, 500);
    }
  };

  // إرسال الرسائل للذكاء الاصطناعي ومعالجة نوايا البناء (Deployment Intent)
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLastUserPrompt(userText);
    setUserInput('');
    setRobotState('thinking');
    setThinkingStatusText(lang === 'ar' ? 'جاري التفكير...' : 'Thinking...');

    const lowerText = userText.toLowerCase();
    const isBuildIntent = lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('website') || lowerText.includes('make') || lowerText.includes('موقع') || lowerText.includes('انشاء') || lowerText.includes('صمم') || lowerText.includes('ابني');

    if (isBuildIntent || currentProjectState === 'asking_details') {
      setTimeout(() => {
        if (currentProjectState === 'asking_details') {
          setRobotState('normal');
          setCurrentProjectState('ready_to_build');
          setChatMessages((prev) => [
            ...prev,
            { sender: 'bot', text: lang === 'ar' ? `🎯 تم تحميل المواصفات بنجاح! خيار الـ Deploy نشط الآن في الشريط العلوي.` : `🎯 Specifications loaded successfully! Deploy button is now active.` }
          ]);
        } else {
          setRobotState('normal');
          setCurrentProjectState('asking_details');
          setShowWorkspaceButtons(true);
          setChatMessages((prev) => [
            ...prev,
            { sender: 'bot', text: lang === 'ar' ? `💡 لقد لاحظت أنك تريد إنشاء منصة ويب جديدة. هل هناك تفاصيل معينة تريد إضافتها؟` : `💡 I noticed you want to build a new web platform. Any specific details to add?` }
          ]);
        }
      }, 1500);
    } else {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({ message: userText, currentLang: lang })
        });

        const data = await res.json();
        setRobotState('normal');

        if (data.success && data.reply) {
          setChatMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
        } else {
          throw new Error();
        }
      } catch (err) {
        setRobotState('normal');
        setChatMessages((prev) => [
          ...prev,
          { sender: 'bot', text: lang === 'ar' ? "عذراً، واجهت مشكلة في معالجة الطلب." : "Sorry, I faced an issue processing the request." }
        ]);
      }
    }
  };

  // تفعيل رفع المشروع السحابي (Deployment Process)
  const triggerDeployment = async () => {
    if (!lastUserPrompt) return;
    setDeployingStatus({ active: true, progress: 5, url: null });
    setThinkingStatusText(lang === 'ar' ? 'جاري بدء الاتصال السحابي...' : 'Initializing cloud connection...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const interval = setInterval(() => {
        setDeployingStatus(prev => {
          if (prev.progress >= 95) { clearInterval(interval); return prev; }
          return { ...prev, progress: prev.progress + 4 };
        });
      }, 700);

      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: lastUserPrompt })
      });

      clearInterval(interval);
      const data = await res.json();

      if (!res.ok || data.success === false) throw new Error(data.error || 'Failed cloud deployment.');
      setDeployingStatus({ active: true, progress: 100, url: data.url });
    } catch (err: any) {
      setDeployingStatus({ active: true, progress: 0, url: null });
      setThinkingStatusText(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ 
      direction: lang === 'ar' ? 'rtl' : 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#050508', color: '#ffffff',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      {/* 🎇 جميع أنميشنات الواجهة الأصلية والحركة الاهتزازية المصلحة */}
      <style>{`
        @keyframes floatLogo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes subtlePulseGlow { 0% { transform: scale(1); opacity: 0.4; filter: blur(4px); } 50% { transform: scale(1.08); opacity: 0.9; filter: blur(1px); } 100% { transform: scale(1); opacity: 0.4; filter: blur(4px); } }
        @keyframes deployCircleRotate { 0% { transform: rotate(0deg); border-top-color: #0070f3; } 100% { transform: rotate(360deg); border-top-color: #00df89; } }
        @keyframes visualNutritionAnimation { 0% { transform: scale(1.1) rotate(0deg); opacity: 0.15; } 50% { transform: scale(1.18) rotate(2deg); opacity: 0.25; } 100% { transform: scale(1.1) rotate(0deg); opacity: 0.15; } }
        
        /* 🚨 الأنميشن المسؤول عن الاهتزاز عند إدخال الباسورد بشكل خاطئ */
        @keyframes shakeInput {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .animated-visual-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: url('image_eeda94.png'); background-position: center; background-size: cover; z-index: -2; animation: visualNutritionAnimation 20s ease-in-out infinite; pointer-events: none; }
        .bg-vignette-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(5,5,8,0.2) 0%, rgba(5,5,8,0.97) 85%); z-index: -1; pointer-events: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1c1c24; border-radius: 4px; }
        
        /* ✨ كلاس الانتقالات الشفافة الذكية للحوائط الأمنية */
        .fade-step-enter {
          opacity: 0;
          transform: scale(0.96);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-step-active {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      <div className="animated-visual-bg"></div>
      <div className="bg-vignette-overlay"></div>

      {/* ==================== 🛠️ شريط التحكم العلوي المميز ==================== */}
      {step === 'main' && user && (
        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 11000 }}>
          
          <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', order: lang === 'ar' ? 1 : 2 }}>
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              style={{ background: '#111116', border: '1px solid #22222b', color: '#888899', fontSize: '0.75rem', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ background: '#111116', border: '1px solid #22222b', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 'bold' }}>{profileData.displayName.charAt(0).toUpperCase()}</span>
              )}
            </button>

            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '48px', right: lang === 'ar' ? 0 : 'auto', left: lang === 'en' ? 0 : 'auto', background: '#111116', border: '1px solid #22222b', borderRadius: '14px', width: '220px', padding: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 12000 }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #1c1c24', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>{profileData.displayName}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#777788' }}>{user.email}</p>
                </div>
                
                <button 
                  onClick={() => { setIsSettingsModalOpen(true); setIsMenuOpen(false); }}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#ffffff', padding: '10px 12px', textAlign: lang === 'ar' ? 'right' : 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexDirection: lang === 'ar' ? 'row' : 'row-reverse' }}
                >
                  <SettingsIcon /> <span>{lang === 'ar' ? 'إعدادات الحساب' : 'Settings'}</span>
                </button>

                <button 
                  onClick={() => supabase.auth.signOut()}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#ff4d4d', padding: '10px 12px', textAlign: lang === 'ar' ? 'right' : 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: lang === 'ar' ? 'row' : 'row-reverse' }}
                >
                  <LogoutIcon /> <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', direction: 'ltr', order: lang === 'ar' ? 2 : 1 }}>
            {showWorkspaceButtons && (
              <button 
                onClick={triggerDeployment}
                disabled={!lastUserPrompt}
                style={{ background: '#0070f3', border: 'none', color: '#ffffff', padding: '10px 26px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 4px 20px rgba(0, 112, 243, 0.4)' }}
              >
                Production Deploy
              </button>
            )}
          </div>

        </div>
      )}

      {/* ==================== [1] حائط حماية الباسورد (مع تأثير الاهتزاز العنيف) ==================== */}
      {step === 'password' && (
        <div 
          className="fade-step-enter fade-step-active"
          style={{ 
            textAlign: 'center', width: '90%', maxWidth: '360px', background: 'rgba(17, 17, 22, 0.75)', 
            backdropFilter: 'blur(20px)', border: '1px solid #22222b', padding: '45px 30px', borderRadius: '24px', zIndex: 10,
            animation: robotIsShaking ? 'shakeInput 0.4s ease-in-out' : 'none' // يطلق أنميشن الاهتزاز عند الخطأ
          }}
        >
          <div style={{ margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', animation: 'floatLogo 4s infinite ease-in-out' }}>
            <div style={{ background: '#000000', padding: '15px', borderRadius: '20px', border: '1px solid #22222b' }}>
              <NovaLogoIcon size={80} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#888888', margin: '0 0 20px 0', letterSpacing: '1.5px', fontWeight: '700' }}>SECURITY KEY REQUIRED</p>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem', color: '#ffffff', textAlign: 'center', border: '1px solid #22222b', borderRadius: '12px', outline: 'none', background: '#0a0a0f', letterSpacing: '2px', transition: 'border-color 0.2s' }} 
          />
        </div>
      )}

      {/* ==================== [2] حائط تسجيل الدخول السحابي السلس ==================== */}
      {step === 'oauth' && (
        <div className="fade-step-enter fade-step-active" style={{ width: '90%', maxWidth: '370px', background: 'rgba(17, 17, 22, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid #22222b', padding: '35px 25px', borderRadius: '24px', zIndex: 10 }}>
          <p style={{ fontSize: '0.75rem', color: '#ffffff', marginBottom: '25px', letterSpacing: '1px', fontWeight: '700', textAlign: 'center' }}>ACCESS SYSTEM ACCOUNT</p>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google', 'github']} theme="dark" showLinks={true} />
        </div>
      )}

      {/* ==================== [3] شاشة الشات ومساحة الذكاء الاصطناعي ==================== */}
      {step === 'main' && (
        <div className="fade-step-enter fade-step-active" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '30px 20px', boxSizing: 'border-box', zIndex: 10 }}>
          <div style={{ width: '100%', maxWidth: '720px', height: '83vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <div style={{ transform: 'scale(0.55)', animation: 'floatLogo 4s infinite ease-in-out', flexShrink: 0 }}>
              <div style={{ background: '#000000', padding: '16px', borderRadius: '24px', border: '1px solid #22222b' }}>
                <NovaLogoIcon size={80} />
              </div>
            </div>

            <div className="custom-scrollbar" style={{ width: '100%', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 5px' }} ref={chatBoxRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ maxWidth: '85%', padding: '14px 18px', borderRadius: '16px', background: msg.sender === 'user' ? '#111116' : 'rgba(20, 20, 27, 0.65)', border: msg.sender === 'user' ? '1px solid #22222b' : '1px solid #1a1a24', backdropFilter: 'blur(8px)', color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.6', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                    <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  </div>
                </div>
              ))}

              {robotState === 'thinking' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 15, 20, 0.65)', border: '1px solid #222233', padding: '10px 18px', borderRadius: '14px', alignSelf: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', background: '#0070f3', borderRadius: '50%', animation: 'subtlePulseGlow 1.2s infinite ease-in-out' }} />
                  <span style={{ fontSize: '0.82rem', color: '#aaaaaa' }}>{thinkingStatusText}</span>
                </div>
              )}
            </div>

            <div style={{ width: '100%', display: 'flex', gap: '12px', background: 'rgba(15, 15, 22, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid #22222b', padding: '10px 16px', borderRadius: '100px', alignItems: 'center', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
              <input 
                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={lang === 'ar' ? 'تحدث معي في أي موضوع، أو اطلب بناء موقع...' : 'Ask anything, or build a website...'} 
                disabled={robotState === 'thinking'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.95rem', padding: '6px 8px', textAlign: lang === 'ar' ? 'right' : 'left' }}
              />
              <button onClick={handleSendMessage} disabled={robotState === 'thinking' || !userInput.trim()} style={{ background: userInput.trim() ? '#0070f3' : '#1c1c24', color: userInput.trim() ? '#ffffff' : '#555555', border: 'none', width: '56px', height: '38px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SendIcon /></button>
            </div>

          </div>

          {/* ==================== ⚙️ نافذة إعدادات الحساب والانتقال الحركي ==================== */}
          {isSettingsModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
              <div className="fade-step-enter fade-step-active" style={{ width: '90%', maxWidth: '440px', background: '#0f0f14', border: '1px solid #22222b', padding: '30px', borderRadius: '24px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#ffffff', borderBottom: '1px solid #1c1c24', paddingBottom: '12px' }}>{lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#888899', display: 'block', marginBottom: '6px' }}>{lang === 'ar' ? 'اسم العرض' : 'Display Name'}</label>
                    <input type="text" value={profileData.displayName} onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} style={{ width: '100%', background: '#07070a', border: '1px solid #22222b', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#888899', display: 'block', marginBottom: '6px' }}>{lang === 'ar' ? 'رابط الصورة الشخصية' : 'Avatar URL'}</label>
                    <input type="text" value={profileData.avatarUrl} onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})} style={{ width: '100%', background: '#07070a', border: '1px solid #22222b', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', outline: 'none', direction: 'ltr' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '25px', direction: 'ltr' }}>
                  <button onClick={() => setIsSettingsModalOpen(false)} style={{ flex: 1, background: '#0070f3', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>{lang === 'ar' ? 'حفظ' : 'Save'}</button>
                  <button onClick={() => setIsSettingsModalOpen(false)} style={{ background: '#1c1c24', color: '#aaaaaa', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 🚀 شاشة الـ Production Deploy ومؤشر المعالجة ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 5, 8, 0.96)', backdropFilter: 'blur(16px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
              <div className="fade-step-enter fade-step-active" style={{ width: '90%', maxWidth: '400px', background: '#0f0f14', border: '1px solid #22222b', padding: '45px 35px', borderRadius: '28px', textAlign: 'center' }}>
                {!deployingStatus.url && <div style={{ width: '64px', height: '64px', margin: '0 auto 25px auto', borderRadius: '50%', border: '4px solid #1c1c24', animation: 'deployCircleRotate 1s linear infinite' }} />}
                <p style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px', color: '#ffffff' }}>{deployingStatus.progress}%</p>
                <p style={{ color: '#888899', fontSize: '0.85rem' }}>{thinkingStatusText}</p>
                {deployingStatus.url && (
                  <div style={{ marginTop: '20px' }}>
                    <a href={deployingStatus.url} target="_blank" rel="noreferrer" style={{ color: '#0070f3', fontSize: '0.92rem', wordBreak: 'break-all', fontWeight: '600' }}>{deployingStatus.url}</a>
                    <button onClick={() => setDeployingStatus({ active: false, progress: 0, url: null })} style={{ width: '100%', background: '#ffffff', color: '#000000', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', marginTop: '20px', fontWeight: '700' }}>العودة لمساحة العمل</button>
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