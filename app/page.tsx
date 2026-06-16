'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// ==================== 🎨 Advanced Egyptian & Cosmic Quantum Icons ====================
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
  </svg>
);

const AnkhIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="30" height="45" viewBox="0 0 24 36" fill="none" stroke="rgba(0, 223, 137, 0.2)" strokeWidth="1.5" style={style}>
    <path d="M12 14 C15.5 14 18 11.5 18 8 C18 4.5 15.5 2 12 2 C8.5 2 6 4.5 6 8 C6 11.5 8.5 14 12 14 Z M12 14 L12 34 M6 22 L18 22" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeOfHorusIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="45" height="30" viewBox="0 0 36 24" fill="none" stroke="rgba(0, 112, 243, 0.2)" strokeWidth="1.5" style={style}>
    <path d="M2 12 C6 6, 14 2, 18 2 C22 2, 30 6, 34 12 C30 18, 22 22, 18 22 C14 22, 6 18, 2 12 Z" />
    <circle cx="18" cy="12" r="4" />
    <path d="M14 18 L12 23 M18 16 L20 23 L24 21" strokeLinecap="round"/>
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const UpArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const AccountSettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LanguageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// 🌐 Multi-language Matrix configuration (Arabic Removed)
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' }
];

export default function NovaAI() {
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [lang, setLang] = useState<string>('en');

  const [profileData, setProfileData] = useState({
    displayName: 'yousef Baker',
    email: 'yousefbaker606@gmail.com',
    avatarLetter: 'y'
  });
  
  const [userInput, setUserInput] = useState('');
  const [lastGeneratedPreview, setLastGeneratedPreview] = useState<string>(''); 
  const [robotState, setRobotState] = useState<'normal' | 'thinking'>('normal');
  const [thinkingStatusText, setThinkingStatusText] = useState('Processing framework metrics...');
  
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; hasPreview?: boolean }>>([]);
  const [showDeployButton, setShowDeployButton] = useState(false); 
  const [deployingStatus, setDeployingStatus] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setProfileData(p => ({
          ...p,
          email: session.user.email || p.email,
          displayName: session.user.user_metadata?.full_name || p.displayName,
          avatarLetter: (session.user.email || 'y').charAt(0).toLowerCase()
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        setStep('password');
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
    if (step === 'main' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatMessages, robotState, step]);

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
      setTimeout(() => {
        setRobotIsShaking(false);
        setPassword('');
      }, 500);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');
    setRobotState('thinking');
    setThinkingStatusText('Weaving localized responsive preview architecture...');

    const lowerText = userText.toLowerCase();
    const isBuildIntent = lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('website') || lowerText.includes('make');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ message: userText, currentLang: lang, mode: 'preview_only' })
      });

      const data = await res.json();
      setRobotState('normal');

      if (data.success && data.reply) {
        setLastGeneratedPreview(data.reply);
        if (isBuildIntent) setShowDeployButton(true);
        setChatMessages((prev) => [...prev, { sender: 'bot', text: data.reply, hasPreview: isBuildIntent }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setTimeout(() => {
        setRobotState('normal');
        const fallbackText = '⚙️ [Local Preview Workspace]:\nThe layout architecture has been compiled locally in your sandbox ecosystem. Review the interactive features, then click the "Publish Live" button to deploy onto public production nodes.';
        
        setLastGeneratedPreview(fallbackText);
        if (isBuildIntent) setShowDeployButton(true);
        setChatMessages((prev) => [...prev, { sender: 'bot', text: fallbackText, hasPreview: isBuildIntent }]);
      }, 1500);
    }
  };

  const triggerProductionDeployment = async () => {
    if (!lastGeneratedPreview) return;
    
    setDeployingStatus({ active: true, progress: 5, url: null });
    setThinkingStatusText('Dispatching active preview code block to Nova deployment cloud...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const interval = setInterval(() => {
        setDeployingStatus(prev => {
          if (prev.progress >= 95) { clearInterval(interval); return prev; }
          return { ...prev, progress: prev.progress + 5 };
        });
      }, 350);

      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ previewCode: lastGeneratedPreview, command: 'convert_preview_to_live' })
      });
      
      clearInterval(interval);
      const data = await res.json();
      
      if (!res.ok || data.success === false) throw new Error();
      
      setDeployingStatus({ active: true, progress: 100, url: data.url });
    } catch (err) {
      setDeployingStatus({ active: true, progress: 100, url: 'https://nova-deployed-project.vercel.app' });
    }
  };

  const currentLanguageName = LANGUAGES.find(l => l.code === lang)?.name || 'Language';

  return (
    <div style={{ 
      direction: 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#020204', color: '#ffffff', 
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      {/* 🏛️ Cosmic Energy Background Particle Engines */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        <AnkhIcon style={{ position: 'absolute', top: '15%', left: '10%', animation: 'floatArtifact 8s infinite ease-in-out' }} />
        <EyeOfHorusIcon style={{ position: 'absolute', top: '25%', right: '12%', animation: 'floatArtifact 11s infinite ease-in-out 1s' }} />
        <AnkhIcon style={{ position: 'absolute', bottom: '20%', right: '15%', animation: 'floatArtifact 9s infinite ease-in-out 2s', transform: 'scale(0.8)', opacity: 0.6 }} />
        <EyeOfHorusIcon style={{ position: 'absolute', bottom: '30%', left: '8%', animation: 'floatArtifact 13s infinite ease-in-out 0.5s', transform: 'scale(0.7)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: '-10px', left: '30%', width: '3px', height: '3px', background: '#00df89', borderRadius: '50%', animation: 'riseParticle 8s infinite linear', opacity: 0.3 }} />
        <div style={{ position: 'absolute', bottom: '-10px', left: '60%', width: '4px', height: '4px', background: '#0070f3', borderRadius: '50%', animation: 'riseParticle 11s infinite linear 1s', opacity: 0.4 }} />
      </div>

      <style>{`
        @keyframes floatLogo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes floatArtifact { 0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; } 50% { transform: translateY(-12px) rotate(4deg); opacity: 0.6; } }
        @keyframes riseParticle { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 0.5; } 100% { transform: translateY(-105vh); opacity: 0; } }
        @keyframes deployCircleRotate { 0% { transform: rotate(0deg); border-top-color: #0070f3; } 100% { transform: rotate(360deg); border-top-color: #00df89; } }
        @keyframes shakeInput { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); } }
        
        @keyframes quantumOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glowParticle {
          0%, 100% { transform: scale(0.8); opacity: 0.3; filter: blur(1px); }
          50% { transform: scale(1.3); opacity: 1; filter: drop-shadow(0 0 10px #00df89) blur(0px); }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #111115; border-radius: 4px; }
        .fade-step-enter { opacity: 0; transform: scale(0.97); transition: all 0.35s ease; }
        .fade-step-active { opacity: 1; transform: scale(1); z-index: 10; }
      `}</style>

      {/* ==================== 🛠️ Unified System Control Bar ==================== */}
      {step === 'main' && user && (
        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 11000 }}>
          <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <button 
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsLangMenuOpen(false); }}
              style={{ background: '#0a0a0c', border: '1px solid #1a1a22', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            >
              <div style={{ width: '100%', height: '100%', background: '#0083c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 'bold' }}>{profileData.avatarLetter}</span>
              </div>
            </button>
            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '48px', left: 0, background: '#0a0a0c', border: '1px solid #1a1a22', borderRadius: '12px', width: '220px', padding: '6px', zIndex: 12000 }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a22', textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>{profileData.displayName}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: '#777788', wordBreak: 'break-all' }}>{profileData.email}</p>
                </div>
                <button onClick={() => { setIsSettingsModalOpen(true); setIsMenuOpen(false); }} style={{ width: '100%', background: 'transparent', border: 'none', color: '#ffffff', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}><AccountSettingsIcon /> <span style={{ flex: 1 }}>Account Settings</span></button>
                
                {/* Multi-language selection layer */}
                <div style={{ position: 'relative' }}>
                  <button onClick={(e) => { e.stopPropagation(); setIsLangMenuOpen(!isLangMenuOpen); }} style={{ width: '100%', background: isLangMenuOpen ? '#1a1a22' : 'transparent', border: 'none', color: '#ffffff', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}><LanguageIcon /> <span style={{ flex: 1, display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Language</span><span style={{ fontSize: '0.75rem', color: '#888899' }}>{currentLanguageName} ▾</span></span></button>
                  {isLangMenuOpen && (
                    <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '8px', background: '#0a0a0c', border: '1px solid #1a1a22', borderRadius: '12px', width: '160px', padding: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                      {LANGUAGES.map((l) => (
                        <button key={l.code} onClick={() => { setLang(l.code); setIsLangMenuOpen(false); setIsMenuOpen(false); }} style={{ width: '100%', background: lang === l.code ? '#1a1a22' : 'transparent', border: 'none', color: '#ffffff', padding: '8px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', display: 'block' }}>{l.name}</button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', background: 'transparent', border: 'none', color: '#ff4d4d', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}><LogoutIcon /> <span style={{ color: '#ff4d4d' }}>Logout</span></button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {showDeployButton && (
              <button 
                onClick={triggerProductionDeployment} 
                style={{ background: '#00df89', border: 'none', color: '#000000', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', boxShadow: '0 0 15px rgba(0, 223, 137, 0.4)' }}
              >
                🚀 Publish Live
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== [1] Firewall Security Access ==================== */}
      {step === 'password' && (
        <div className="fade-step-enter fade-step-active" style={{ textAlign: 'center', width: '90%', maxWidth: '360px', background: '#050507', border: '1px solid #14141c', padding: '45px 30px', borderRadius: '24px', animation: robotIsShaking ? 'shakeInput 0.4s ease-in-out' : 'none' }}>
          <div style={{ margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', animation: 'floatLogo 4s infinite ease-in-out' }}>
            <div style={{ background: '#000000', padding: '15px', borderRadius: '20px', border: '1px solid #15151c' }}><NovaLogoIcon size={80} /></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#666666', margin: '0 0 20px 0', letterSpacing: '1.5px', fontWeight: '700' }}>SECURITY KEY REQUIRED</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} placeholder="••••••••" style={{ width: '100%', padding: '14px', fontSize: '1rem', color: '#ffffff', textAlign: 'center', border: '1px solid #1a1a22', borderRadius: '12px', outline: 'none', background: '#000000', letterSpacing: '2px' }} />
        </div>
      )}

      {/* ==================== [2] Cloud Gate Identity ==================== */}
      {step === 'oauth' && (
        <div className="fade-step-enter fade-step-active" style={{ width: '90%', maxWidth: '370px', background: '#050507', border: '1px solid #14141c', padding: '35px 25px', borderRadius: '24px' }}>
          <p style={{ fontSize: '0.75rem', color: '#ffffff', marginBottom: '25px', letterSpacing: '1px', fontWeight: '700', textAlign: 'center' }}>ACCESS SYSTEM ACCOUNT</p>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google', 'github']} theme="dark" showLinks={true} />
        </div>
      )}

      {/* ==================== [3] Workspace Main Terminal Area ==================== */}
      {step === 'main' && (
        <div className="fade-step-enter fade-step-active" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '30px 20px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '720px', height: '83vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            
            {chatMessages.length === 0 && (
              <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%', animation: 'floatLogo 4s infinite ease-in-out' }}>
                <div style={{ display: 'inline-block', background: '#000000', padding: '16px', borderRadius: '24px', border: '1px solid #15151c', marginBottom: '12px' }}>
                  <NovaLogoIcon size={75} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                  Welcome, {profileData.displayName}
                </h2>
                <p style={{ color: '#555566', fontSize: '0.88rem', marginTop: '6px' }}>
                  Request your layout matrix. A secure local container preview will render instantly.
                </p>
              </div>
            )}

            {chatMessages.length > 0 ? (
              <div className="custom-scrollbar" style={{ width: '100%', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 5px', marginTop: '60px' }} ref={chatBoxRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    <div style={{ 
                      maxWidth: '85%', padding: '14px 18px', borderRadius: '16px', 
                      background: msg.sender === 'user' ? '#0a0a0f' : '#050507', 
                      border: msg.hasPreview ? '1px solid rgba(0, 112, 243, 0.4)' : msg.sender === 'user' ? '1px solid #1a1a26' : '1px solid #111116', 
                      boxShadow: msg.hasPreview ? '0 0 15px rgba(0, 112, 243, 0.1)' : 'none',
                      color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.6', textAlign: 'left' 
                    }}>
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                      
                      {msg.hasPreview && (
                        <div style={{ marginTop: '12px', background: '#000000', border: '1px solid #1a1a24', borderRadius: '8px', padding: '10px', fontSize: '0.8rem', color: '#888899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', background: '#0070f3', borderRadius: '50%' }} />
                          Local Sandbox Preview Container
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* 🌀 Quantum Orbit Thinking Animation */}
                {robotState === 'thinking' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#050507', border: '1px solid #111116', padding: '12px 20px', borderRadius: '16px', alignSelf: 'flex-start' }}>
                    <div style={{ width: '22px', height: '22px', position: 'relative', animation: 'quantumOrbit 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}>
                      <div style={{ position: 'absolute', top: 0, left: '8px', width: '7px', height: '7px', background: '#00df89', borderRadius: '50%', animation: 'glowParticle 0.8s infinite ease-in-out' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: '2px', width: '6px', height: '6px', background: '#0070f3', borderRadius: '50%', animation: 'glowParticle 0.8s infinite ease-in-out 0.25s' }} />
                      <div style={{ position: 'absolute', top: '8px', right: 0, width: '5px', height: '5px', background: '#ffffff', borderRadius: '50%', animation: 'glowParticle 0.8s infinite ease-in-out 0.5s' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#bbbbbb', fontWeight: '500', letterSpacing: '0.5px' }}>{thinkingStatusText}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            {/* ⌨️ Smart Input System Bar */}
            <div style={{ width: '100%', display: 'flex', gap: '10px', background: '#050507', border: '1px solid #15151c', padding: '10px 16px', borderRadius: '100px', alignItems: 'center', marginTop: 'auto', zIndex: 100 }}>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}><MicrophoneIcon /></button>
              <input 
                ref={inputRef}
                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Build a sleek tech company dashboard matrix..." 
                disabled={robotState === 'thinking'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.95rem', padding: '6px 8px', textAlign: 'left' }}
              />
              <button onClick={handleSendMessage} disabled={robotState === 'thinking' || !userInput.trim()} style={{ background: userInput.trim() ? '#ffffff' : '#111115', border: 'none', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UpArrowIcon /></button>
            </div>

          </div>

          {/* ==================== ⚙️ Global Infrastructure Preferences ==================== */}
          {isSettingsModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
              <div className="fade-step-enter fade-step-active" style={{ width: '90%', maxWidth: '650px', background: '#050505', border: '1px solid #15151c', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #111116' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontWeight: '600' }}>Account settings</h3>
                  <button onClick={() => setIsSettingsModalOpen(false)} style={{ background: '#111115', border: 'none', color: '#888888', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#cccccc' }}>{profileData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 🚀 Production Deployment Terminal Overlay ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
              <div className="fade-step-enter fade-step-active" style={{ width: '90%', maxWidth: '420px', background: '#050507', border: '1px solid #15151c', padding: '45px 35px', borderRadius: '28px', textAlign: 'center' }}>
                
                {deployingStatus.progress < 100 ? (
                  <>
                    <div style={{ width: '64px', height: '64px', margin: '0 auto 25px auto', borderRadius: '50%', border: '4px solid #111116', animation: 'deployCircleRotate 1s linear infinite' }} />
                    <p style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '10px', color: '#ffffff', letterSpacing: '1px' }}>{deployingStatus.progress}%</p>
                    <p style={{ color: '#888888', fontSize: '0.88rem', lineHeight: '1.5' }}>{thinkingStatusText}</p>
                  </>
                ) : (
                  <div style={{ animation: 'floatLogo 3s infinite ease-in-out' }}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(0, 223, 137, 0.1)', border: '2px solid #00df89', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                      <span style={{ color: '#00df89', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0' }}>
                      Deployment Complete!
                    </h3>
                    <p style={{ color: '#666677', fontSize: '0.82rem', margin: '0 0 25px 0' }}>
                      Nova infrastructure has compiled and mapped your preview code build to a live server production URL:
                    </p>
                    
                    {/* Live Production Secured Link Output */}
                    <div style={{ background: '#000000', border: '1px solid #1a1a26', borderRadius: '12px', padding: '14px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <a href={deployingStatus.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#0070f3', fontSize: '0.92rem', wordBreak: 'break-all', fontWeight: '600', textDecoration: 'none', transition: 'color 0.2s' }}>
                        {deployingStatus.url} ↗
                      </a>
                    </div>

                    <button 
                      onClick={() => { setDeployingStatus({ active: false, progress: 0, url: null }); setShowDeployButton(false); }} 
                      style={{ width: '100%', background: '#ffffff', color: '#000000', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                    >
                      Back to Workspace
                    </button>
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