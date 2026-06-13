'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// 🌟 شعار Nova الهندسي الفخم مدمج كـ SVG ومتوافق مع الهوية البصرية
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
  </svg>
);

// 🌐 أيقونة اللغة المحدثة والمطابقة للصورة
const LanguageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// 🎙️ أيقونة الميكروفون المحدثة طبق الأصل من المرفقات للزر الدائري السفلي
const MicrophoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

// ↗️ أيقونة سهم الإرسال العلوي المحدثة والمطابقة للصورة للزر البيضاوي السفلي
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

// 🚪 أيقونة الخروج المحدثة والمطابقة للصورة بدلاً من الإيموجي القديم
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// قاموس الترجمة الكامل (تمت إزالة اللغة العربية ليصبح النظام متكاملاً باللغات المتبقية)
const translations = {
  en: {
    securityKey: "SECURITY KEY REQUIRED",
    accessAccount: "ACCESS SYSTEM ACCOUNT",
    processing: "Processing build architecture...",
    placeholder: "Ask anything or describe your landing page...",
    livePreview: "Live Preview",
    prodDeploy: "Production Deploy",
    previewWin: "PREVIEW WINDOW (SANDBOX)",
    close: "Close",
    deployProgress: "PRODUCTION DEPLOYMENT IN PROGRESS",
    envLive: "✓ Environment Live at:",
    returnWorkspace: "Return to Workspace",
    syncing: "Synchronizing repository to cloud grid...",
    signOut: "Logout",
    language: "Language",
    profile: "Profile",
    dir: "ltr"
  },
  es: {
    securityKey: "CLAVE DE SEGURIDAD REQUERIDA",
    accessAccount: "ACCEDER A LA CUENTA DEL SISTEMA",
    processing: "Procesando arquitectura de compilación...",
    placeholder: "Pregunta cualquier cosa o describe tu página...",
    livePreview: "Vista previa en vivo",
    prodDeploy: "Despliegue de producción",
    previewWin: "VENTANA DE VISTA PREVIA (SANDBOX)",
    close: "Cerrar",
    deployProgress: "DESPLIEGUE DE PRODUCCIÓN EN PROGRESO",
    envLive: "✓ Entorno en vivo en:",
    returnWorkspace: "Volver al espacio de trabajo",
    syncing: "Sincronizando repositorio con la nube...",
    signOut: "Logout",
    language: "Language",
    profile: "Perfil",
    dir: "ltr"
  },
  fr: {
    securityKey: "CLÉ DE SÉCURITÉ REQUISE",
    accessAccount: "ACCÉDER AU COMPTE SYSTÈME",
    processing: "Traitement de l'architecture de build...",
    placeholder: "Demandez n'importe quoi ou décrivez votre page...",
    livePreview: "Aperçu en direct",
    prodDeploy: "Déploiement Production",
    previewWin: "FENÊTRE D'APERÇU (SANDBOX)",
    close: "Fermer",
    deployProgress: "DÉPLOIEMENT PRODUCTION EN COURS",
    envLive: "✓ Environnement en direct sur:",
    returnWorkspace: "Retour à l'espace de travail",
    syncing: "Synchronisation du dépôt vers le cloud...",
    signOut: "Logout",
    language: "Language",
    profile: "Profil",
    dir: "ltr"
  },
  de: {
    securityKey: "SICHERHEITSSCHLÜSSEL ERFORDERLICH",
    accessAccount: "SYSTEMKONTO ZUGREIFEN",
    processing: "Build-Architektur wird verarbeitet...",
    placeholder: "Fragen Sie alles oder beschreiben Sie Ihre Seite...",
    livePreview: "Live-Vorschau",
    prodDeploy: "Produktions-Deploy",
    previewWin: "VORSCHAU-FENSTER (SANDBOX)",
    close: "Schließen",
    deployProgress: "PRODUKTIONS-DEPLOYMENT REGE REGE",
    envLive: "✓ Umgebung Live unter:",
    returnWorkspace: "Zurück zum Arbeitsbereich",
    syncing: "Repository mit Cloud-Grid synchronisieren...",
    signOut: "Logout",
    language: "Language",
    profile: "Profil",
    dir: "ltr"
  },
  tr: {
    securityKey: "GÜVENLİK ANAHTARI GEREKLİ",
    accessAccount: "SİSTEM HESABINA ERİŞİM",
    processing: "Derleme mimarisi işleniyor...",
    placeholder: "Herhangi bir şey sorun veya sayfanızı tanımlayın...",
    livePreview: "Canlı Önizleme",
    prodDeploy: "Üretim Dağıtımı",
    previewWin: "ÖNİZLEME PENCERESİ (SANDBOX)",
    close: "Kapat",
    deployProgress: "ÜRETİM DAĞITIMI DEVAM EDİYOR",
    envLive: "✓ Canlı Ortam Adresi:",
    returnWorkspace: "Çalışma Alanına Dön",
    syncing: "Depo bulut sunucularıyla senkronize ediliyor...",
    signOut: "Logout",
    language: "Language",
    profile: "Profil",
    dir: "ltr"
  }
};

export default function NovaAI() {
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [isExitingPassword, setIsExitingPassword] = useState(false);
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  // جعل اللغة الإنجليزية هي الافتراضية بعد حذف العربية
  const [lang, setLang] = useState<'en' | 'es' | 'fr' | 'de' | 'tr'>('en');
  const t = translations[lang];

  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; codeBlock?: string }>>([]);
  const [isChatActive, setIsChatActive] = useState(false); 

  const defaultCode = `<!DOCTYPE html><html><head><style>body { background: #000; color: #fff; font-family: sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }</style></head><body><div><h1>Nova AI Workspace</h1></div></body></html>`;
  const [previewContent, setPreviewContent] = useState<string | null>(null);
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
        setIsChatActive(false);
        setChatMessages([]);
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
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
          setRobotState('listening');
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setUserInput((prev) => (prev.trim() !== '' ? prev + ' ' + resultText : resultText));
        };

        rec.onerror = () => stopVoice();
        rec.onend = () => stopVoice();

        recognitionRef.current = rec;
      }
    }
  }, [lang]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

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

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const textToSend = userInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setUserInput('');
    setRobotState('thinking');

    if (!isChatActive) {
      setIsChatActive(true); 
    }

    setTimeout(() => {
      setRobotState('normal');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚡ NOVA COMPILER:\nGenerated complete responsive interface architecture based on your specification. Click Preview or Deploy on the top corner to view your live app.`,
          codeBlock: `<!DOCTYPE html>\n<html>\n<head>\n<style>\nbody { background: #000; color: #fff; font-family: sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }\n.card { border: 1px solid #222; padding: 40px; border-radius: 12px; text-align: center; }\n</style>\n</head>\n<body>\n<div class="card">\n<h1>Nova Deployed App</h1>\n<p>Production environment successfully running on localized server grid.</p>\n</div>\n</body>\n</html>`
        }
      ]);
    }, 1500);
  };

  const triggerDeployment = () => {
    setDeployingStatus({ active: true, progress: 0, url: null });
    const interval = setInterval(() => {
      setDeployingStatus((prev) => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return { ...prev, progress: 100, url: `https://nova-project-build-${Math.floor(1000 + Math.random() * 9000)}.vercel.app` };
        }
        return { ...prev, progress: prev.progress + 20 };
      });
    }, 400);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported.');
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const stopVoice = () => {
    setIsListening(false);
    setRobotState('normal');
  };

  const getLatestCodeBlock = () => {
    const codeMsgs = chatMessages.filter(m => m.codeBlock);
    if (codeMsgs.length > 0) {
      return codeMsgs[codeMsgs.length - 1].codeBlock || defaultCode;
    }
    return defaultCode;
  };

  return (
    <div style={{ 
      direction: t.dir as 'rtl' | 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#000000', color: '#ffffff',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      {/* ==================== 🧠 تأثير الخلفية الجرونج المتحركة والأنيميشن عبر الـ CSS ==================== */}
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 4px rgba(255,255,255,0.05)); }
          50% { transform: translateY(-6px); filter: drop-shadow(0 0 12px rgba(255,255,255,0.15)); }
        }
        @keyframes shakeLogo {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        @keyframes pulseLogoThinking {
          0%, 100% { opacity: 0.5; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 0 20px rgba(255,255,255,0.3)); }
        }
        @keyframes wavePulse {
          0%, 100% { height: 6px; }
          50% { height: 20px; }
        }
        @keyframes fadeInMessages {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* حركة الخلفية المحدثة للسديم والدخان */
        @keyframes grungeVisualNutrition {
          0% { transform: scale(1) rotate(0deg) translate(0, 0); }
          50% { transform: scale(1.12) rotate(4deg) translate(-2%, 2%); }
          100% { transform: scale(1.05) rotate(-3deg) translate(2%, -2%); }
        }

        .animated-grunge-bg {
          position: fixed;
          top: -30%;
          left: -30%;
          width: 160%;
          height: 160%;
          background-image: url('image_efdcc5.png'); /* اسم ملف الخلفية الخاصة بك */
          background-position: center;
          background-size: cover;
          background-repeat: repeat;
          opacity: 0.35;
          filter: contrast(135%) brightness(60%) grayscale(20%);
          z-index: -2;
          animation: grungeVisualNutrition 40s ease-in-out infinite alternate;
          transform-origin: center;
          pointer-events: none;
          will-change: transform;
        }

        .bg-vignette-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 85%);
          z-index: -1;
          pointer-events: none;
        }

        .supabase-auth-container { background: #000000 !important; padding: 5px; }
        .supabase-auth-container button {
          border-radius: 8px !important; font-weight: 600 !important;
          background: #ffffff !important; color: #000000 !important;
          border: 1px solid #ffffff !important; padding: 10px !important;
          transition: all 0.2s ease !important;
        }
        .supabase-auth-container button:hover { opacity: 0.9; }
        .supabase-auth-container input {
          border-radius: 8px !important; text-align: center !important;
          background-color: #000000 !important; color: #ffffff !important;
          border: 1px solid #1f1f1f !important; padding: 12px !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 4px; }
      `}</style>

      {/* 🌌 دمج الخلفية وطبقة التظليل السينمائي داخل الـ DOM */}
      <div className="animated-grunge-bg"></div>
      <div className="bg-vignette-overlay"></div>

      {/* ==================== 🛠️ شريط الأدوات العلوي الأحادي ==================== */}
      {step === 'main' && user && (
        <div style={{ 
          position: 'absolute', top: '24px', 
          left: '24px', right: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 11000, pointerEvents: 'none'
        }}>
          
          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', direction: 'ltr' }}>
            <button 
              onClick={() => setPreviewContent(getLatestCodeBlock())}
              style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#141414'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}
            >
              {t.livePreview}
            </button>
            <button 
              onClick={triggerDeployment}
              style={{ background: '#ffffff', border: 'none', color: '#000000', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t.prodDeploy}
            </button>
          </div>

          <div ref={menuRef} style={{ pointerEvents: 'auto', position: 'relative' }}>
            <button 
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsLangMenuOpen(false); }}
              style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }}
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 'bold' }}>{user.email?.charAt(0).toUpperCase()}</span>
              )}
            </button>

            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '48px', [t.dir === 'rtl' ? 'left' : 'right']: 0, background: '#050505', border: '1px solid #1f1f1f', borderRadius: '12px', width: '220px', padding: '6px', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.7)' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #141414', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#666666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>

                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#ffffff', padding: '10px 12px', textAlign: t.dir === 'rtl' ? 'right' : 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0d0d0d'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <LanguageIcon />
                    <span>{t.language}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#444444' }}>{lang.toUpperCase()} ❯</span>
                </button>

                {isLangMenuOpen && (
                  <div style={{ background: '#000000', border: '1px solid #1f1f1f', borderRadius: '8px', marginTop: '4px', padding: '4px' }}>
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'es', label: 'Español' },
                      { code: 'fr', label: 'Français' },
                      { code: 'de', label: 'Deutsch' },
                      { code: 'tr', label: 'Türkçe' }
                    ].map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLang(language.code as any);
                          setIsLangMenuOpen(false);
                          setIsMenuOpen(false);
                        }}
                        style={{ width: '100%', background: lang === language.code ? '#141414' : 'transparent', border: 'none', color: '#ffffff', padding: '8px 12px', textAlign: t.dir === 'rtl' ? 'right' : 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8rem' }}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid #141414', margin: '4px 0' }} />

                <button 
                  onClick={() => supabase.auth.signOut()}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#ff4444', padding: '10px 12px', textAlign: t.dir === 'rtl' ? 'right' : 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#140505'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogoutIcon />
                  <span style={{ color: '#ff6b6b', letterSpacing: '0.5px' }}>{t.signOut}</span>
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
            height: isChatActive ? '83vh' : 'auto',
            display: 'flex', flexDirection: 'column',
            justifyContent: isChatActive ? 'space-between' : 'center',
            alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>

            <div style={{
              transform: isChatActive ? 'scale(0.6)' : 'scale(1)',
              marginBottom: isChatActive ? '5px' : '25px',
              animation: robotState === 'thinking' ? 'pulseLogoThinking 0.4s infinite ease-in-out' : 'floatLogo 4s infinite ease-in-out',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              flexShrink: 0
            }}>
              <NovaLogoIcon size={isChatActive ? 90 : 140} />
            </div>

            {isChatActive && (
              <div className="custom-scrollbar" style={{ 
                width: '100%', flex: 1, overflowY: 'auto', 
                display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 5px',
                margin: '10px 0', animation: 'fadeInMessages 0.4s ease'
              }} ref={chatBoxRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    <div style={{ 
                      maxWidth: '85%', padding: '14px 18px', borderRadius: '12px', 
                      background: msg.sender === 'user' ? '#0a0a0a' : '#000000', 
                      border: msg.sender === 'user' ? '1px solid #141414' : '1px solid #1f1f1f', 
                      fontSize: '0.9rem', lineHeight: '1.5', textAlign: 'left', direction: 'ltr'
                    }}>
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* صندوق مدخلات ومحرك معالجة الأكواد الأحادي الفخم */}
            <div style={{ 
              width: '100%', display: 'flex', gap: '12px', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', 
              padding: '12px 16px', borderRadius: '100px', alignItems: 'center', boxSizing: 'border-box',
              flexShrink: 0
            }}>
              {isListening ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, paddingLeft: '8px' }}>
                  <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'wavePulse 0.4s infinite ease-in-out' }} />
                  <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'wavePulse 0.6s infinite ease-in-out', animationDelay: '0.1s' }} />
                  <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'wavePulse 0.3s infinite ease-in-out', animationDelay: '0.2s' }} />
                </div>
              ) : (
                <input 
                  type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={robotState === 'thinking' ? t.processing : t.placeholder} 
                  disabled={robotState === 'thinking'}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.95rem', padding: '4px 8px', textAlign: t.dir === 'rtl' ? 'right' : 'left' }}
                />
              )}

              {/* 🎙️ زر المايك الهندسي المحدث المماثل للمرفقات بدلاً من الإيموجي القديم */}
              <button 
                onClick={toggleVoice} 
                disabled={robotState === 'thinking'} 
                style={{ background: '#1a1a1a', color: isListening ? '#ffffff' : '#aaaaaa', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#242424'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                <MicrophoneIcon />
              </button>
              
              {/* ↗️ زر السهم العلوي المحدث والمطابق للتغذية البصرية للمرفقات بدلاً من الإيموجي القديم */}
              <button 
                onClick={handleSendMessage} 
                disabled={robotState === 'thinking' || !userInput.trim()} 
                style={{ background: userInput.trim() ? '#ffffff' : '#1a1a1a', color: userInput.trim() ? '#000000' : '#444444', border: 'none', width: '56px', height: '38px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <SendIcon />
              </button>
            </div>

          </div>

          {/* ==================== نافذة منبثقة معزولة الـ Sandbox للمعاينة الحية ==================== */}
          {previewContent && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000, padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: '940px', height: '82vh', background: '#000000', border: '1px solid #1f1f1f', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', background: '#030303', direction: t.dir as 'rtl' | 'ltr' }}>
                  <span style={{ fontSize: '0.8rem', letterSpacing: '1px', color: '#666666' }}>{t.previewWin}</span>
                  <button onClick={() => setPreviewContent(null)} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '5px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>{t.close}</button>
                </div>
                <iframe srcDoc={previewContent} title="Nova Preview" style={{ flex: 1, width: '100%', border: 'none', background: '#ffffff' }} />
              </div>
            </div>
          )}

          {/* ==================== محاكاة بيئة خوادم النشر الإنتاجي ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.94)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000 }}>
              <div style={{ width: '90%', maxWidth: '400px', background: '#030303', border: '1px solid #1f1f1f', padding: '35px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', letterSpacing: '1px', color: '#555555', marginBottom: '20px' }}>{t.deployProgress}</p>
                <div style={{ width: '100%', height: '3px', background: '#141414', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ width: `${deployingStatus.progress}%`, height: '100%', background: '#ffffff', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '25px' }}>{deployingStatus.progress}%</p>
                {deployingStatus.url ? (
                  <div>
                    <p style={{ color: '#666666', fontSize: '0.8rem', marginBottom: '10px' }}>{t.envLive}</p>
                    <a href={deployingStatus.url} target="_blank" rel="noreferrer" style={{ color: '#ffffff', fontSize: '0.85rem', wordBreak: 'break-all', display: 'block', marginBottom: '25px', textDecoration: 'underline' }}>{deployingStatus.url}</a>
                    <button onClick={() => setDeployingStatus({ active: false, progress: 0, url: null })} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '8px 22px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>{t.returnWorkspace}</button>
                  </div>
                ) : (
                  <p style={{ color: '#666666', fontSize: '0.8rem', key: 'sync-text' }}>{t.syncing}</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}