ر'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// 🌟 شعارك النجمي الهندسي الفخم مدمج كـ SVG
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
  </svg>
);

// قاموس الترجمة للغات المختلفة لتغيير الموقع بالكامل
const translations = {
  ar: {
    securityKey: "مطلوب مفتاح الأمان",
    accessAccount: "الدخول إلى حساب النظام",
    processing: "جاري معالجة بنية البناء...",
    placeholder: "اسأل عن أي شيء أو صف صفحتك...",
    livePreview: "💻 معاينة مباشرة",
    prodDeploy: "🚀 نشر الإنتاج",
    previewWin: "نافذة المعاينة (بيئة معزولة)",
    close: "إغلاق",
    deployProgress: "جاري نشر الإنتاج في السحابة",
    envLive: "✓ البيئة الحية في:",
    returnWorkspace: "العودة إلى مساحة العمل",
    syncing: "جاري المزامنة مع خوادم السحاب...",
    signOut: "تسجيل الخروج",
    language: "🌐 اللغة",
    profile: "👤 الحساب",
    dir: "rtl"
  },
  en: {
    securityKey: "SECURITY KEY REQUIRED",
    accessAccount: "ACCESS SYSTEM ACCOUNT",
    processing: "Processing build architecture...",
    placeholder: "Ask anything or describe your landing page...",
    livePreview: "💻 Live Preview",
    prodDeploy: "🚀 Production Deploy",
    previewWin: "PREVIEW WINDOW (SANDBOX)",
    close: "Close",
    deployProgress: "PRODUCTION DEPLOYMENT IN PROGRESS",
    envLive: "✓ Environment Live at:",
    returnWorkspace: "Return to Workspace",
    syncing: "Synchronizing repository to cloud grid...",
    signOut: "Sign Out",
    language: "🌐 Language",
    profile: "👤 Profile",
    dir: "ltr"
  },
  es: {
    securityKey: "CLAVE DE SEGURIDAD REQUERIDA",
    accessAccount: "ACCEDER A LA CUENTA DEL SISTEMA",
    processing: "Procesando arquitectura de compilación...",
    placeholder: "Pregunta cualquier cosa o describe tu página...",
    livePreview: "💻 Vista previa en vivo",
    prodDeploy: "🚀 Despliegue de producción",
    previewWin: "VENTANA DE VISTA PREVIA (SANDBOX)",
    close: "Cerrar",
    deployProgress: "DESPLIEGUE DE PRODUCCIÓN EN PROGRESO",
    envLive: "✓ Entorno en vivo en:",
    returnWorkspace: "Volver al espacio de trabajo",
    syncing: "Sincronizando repositorio con la nube...",
    signOut: "Cerrar sesión",
    language: "🌐 Idioma",
    profile: "👤 Perfil",
    dir: "ltr"
  },
  fr: {
    securityKey: "CLÉ DE SÉCURITÉ REQUISE",
    accessAccount: "ACCÉDER AU COMPTE SYSTÈME",
    processing: "Traitement de l'architecture de build...",
    placeholder: "Demandez n'importe quoi ou décrivez votre page...",
    livePreview: "💻 Aperçu en direct",
    prodDeploy: "🚀 Déploiement Production",
    previewWin: "FENÊTRE D'APERÇU (SANDBOX)",
    close: "Fermer",
    deployProgress: "DÉPLOIEMENT PRODUCTION EN COURS",
    envLive: "✓ Environnement en direct sur:",
    returnWorkspace: "Retour à l'espace de travail",
    syncing: "Synchronisation du dépôt vers le cloud...",
    signOut: "Se déconnecter",
    language: "🌐 Langue",
    profile: "👤 Profil",
    dir: "ltr"
  },
  de: {
    securityKey: "SICHERHEITSSCHLÜSSEL ERFORDERLICH",
    accessAccount: "SYSTEMKONTO ZUGREIFEN",
    processing: "Build-Architektur wird verarbeitet...",
    placeholder: "Fragen Sie alles oder beschreiben Sie Ihre Seite...",
    livePreview: "💻 Live-Vorschau",
    prodDeploy: "🚀 Produktions-Deploy",
    previewWin: "VORSCHAU-FENSTER (SANDBOX)",
    close: "Schließen",
    deployProgress: "PRODUKTIONS-DEPLOYMENT REGE REGE",
    envLive: "✓ Umgebung Live unter:",
    returnWorkspace: "Zurück zum Arbeitsbereich",
    syncing: "Repository mit Cloud-Grid synchronisieren...",
    signOut: "Abmelden",
    language: "🌐 Sprache",
    profile: "👤 Profil",
    dir: "ltr"
  },
  tr: {
    securityKey: "GÜVENLİK ANAHTARI GEREKLİ",
    accessAccount: "SİSTEM HESABINA ERİŞİM",
    processing: "Derleme mimarisi işleniyor...",
    placeholder: "Herhangi bir şey sorun veya sayfanızı tanımlayın...",
    livePreview: "💻 Canlı Önizleme",
    prodDeploy: "🚀 Üretim Dağıtımı",
    previewWin: "ÖNİZLEME PENCERESİ (SANDBOX)",
    close: "Kapat",
    deployProgress: "ÜRETİM DAĞITIMI DEVAM EDİYOR",
    envLive: "✓ Canlı Ortam Adresi:",
    returnWorkspace: "Çalışma Alanına Dön",
    syncing: "Depo bulut sunucularıyla senkronize ediliyor...",
    signOut: "Çıkış Yap",
    language: "🌐 Dil",
    profile: "👤 Profil",
    dir: "ltr"
  }
};

export default function NovaAI() {
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [isExitingPassword, setIsExitingPassword] = useState(false);
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  // نظام اللغات المحدثة
  const [lang, setLang] = useState<'ar' | 'en' | 'es' | 'fr' | 'de' | 'tr'>('ar');
  const t = translations[lang];

  // بيانات المستخدم والقوائم المنسدلة
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; codeBlock?: string }>>([]);
  const [isChatActive, setIsChatActive] = useState(false); 

  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [deployingStatus, setDeployingStatus] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // الفحص التلقائي وتخطي الحواجز للمسجلين دخول مسبقاً وجلب بيانات الإيميل والصورة
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

  // إغلاق القوائم المنسدلة عند الضغط خارجها
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

  // تحويل الصوت إلى نص
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
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
          text: `⚡ NOVA COMPILER:\nGenerated complete responsive interface architecture based on your specification.\n\nYou can now preview the live layout or instantly trigger a production cloud deployment below:`,
          codeBlock: `<!DOCTYPE html>\n<html>\n<head>\n<style>\nbody { background: #000; color: #fff; font-family: sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }\n.card { border: 1px solid #222; padding: 40px; border-radius: 12px; text-align: center; }\n</style>\n</head>\n<body>\n<div class="card">\n<h1>Nova Deployed App</h1>\n<p>Production environment successfully running on localized server grid.</p>\n</div>\n</body>\n</html>`
        }
      ]);
    }, 1500);
  };

  const triggerDeployment = (index: number) => {
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

  return (
    <div style={{ 
      direction: t.dir as 'rtl' | 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#000000', color: '#ffffff',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 4px rgba(255,255,255,0.1)); }
          50% { transform: translateY(-8px); filter: drop-shadow(0 0 15px rgba(255,255,255,0.25)); }
        }
        @keyframes shakeLogo {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes pulseLogoThinking {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(255,255,255,0.4)); }
        }
        @keyframes wavePulse {
          0%, 100% { height: 6px; }
          50% { height: 24px; }
        }
        .supabase-auth-container { background: #000000 !important; padding: 5px; }
        .supabase-auth-container button {
          border-radius: 8px !important; font-weight: 600 !important;
          background: #ffffff !important; color: #000000 !important;
          border: 1px solid #ffffff !important; padding: 10px !important;
        }
        .supabase-auth-container input {
          border-radius: 8px !important; text-align: center !important;
          background-color: #000000 !important; color: #ffffff !important;
          border: 1px solid #222222 !important; padding: 12px !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222222; border-radius: 4px; }
      `}</style>

      {/* ==================== 👤 نظام قائمة الحساب واللغات في الزاوية العلوية ==================== */}
      {step === 'main' && user && (
        <div ref={menuRef} style={{ position: 'absolute', top: '20px', right: t.dir === 'rtl' ? 'auto' : '20px', left: t.dir === 'rtl' ? '20px' : 'auto', zIndex: 11000 }}>
          {/* زر الصورة الشخصية الدائري */}
          <button 
            onClick={() => { setIsMenuOpen(!isMenuOpen); setIsLangMenuOpen(false); }}
            style={{ background: '#111', border: '1px solid #222', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }}
          >
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{user.email?.charAt(0).toUpperCase()}</span>
            )}
          </button>

          {/* القائمة المنسدلة الرئيسية لقائمة الحساب */}
          {isMenuOpen && (
            <div style={{ position: 'absolute', top: '50px', right: t.dir === 'rtl' ? 'auto' : '0', left: t.dir === 'rtl' ? '0' : 'auto', background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', width: '220px', padding: '8px', boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #111', marginBottom: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
              </div>

              {/* زر خيار اللغة التفاعلي */}
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '10px 12px', textAlign: t.dir === 'rtl' ? 'right' : 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#111'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>{t.language}</span>
                <span style={{ fontSize: '0.7rem', color: '#666' }}>{lang.toUpperCase()} ❯</span>
              </button>

              {/* قائمة اللغات الفرعية الجانبية الممتدة */}
              {isLangMenuOpen && (
                <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', marginTop: '4px', padding: '4px' }}>
                  {[
                    { code: 'ar', label: 'العربية' },
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
                      style={{ width: '100%', background: lang === language.code ? '#222' : 'transparent', border: 'none', color: '#fff', padding: '8px 12px', textAlign: t.dir === 'rtl' ? 'right' : 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid #111', margin: '6px 0' }} />

              {/* زر تسجيل الخروج داخل القائمة */}
              <button 
                onClick={() => supabase.auth.signOut()}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#ff4444', padding: '10px 12px', textAlign: t.dir === 'rtl' ? 'right' : 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a0505'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {t.signOut}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== [1] شاشة كلمة المرور ==================== */}
      {step === 'password' && (
        <div style={{ 
          animation: isExitingPassword ? 'screenFadeOut 0.5s ease forwards' : 'none', 
          textAlign: 'center', width: '90%', maxWidth: '360px', background: '#000000', 
          border: '1px solid #111111', padding: '45px 30px', borderRadius: '16px' 
        }}>
          <div style={{ margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', animation: robotIsShaking ? 'shakeLogo 0.15s infinite' : 'floatLogo 4s infinite ease-in-out' }}>
            <NovaLogoIcon size={110} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#555555', margin: '0 0 20px 0', letterSpacing: '1.5px', fontWeight: '600' }}>{t.securityKey}</p>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '12px', fontSize: '1rem', color: '#fff', textAlign: 'center', border: '1px solid #222222', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', background: '#000000', letterSpacing: '2px' }} 
          />
        </div>
      )}

      {/* ==================== [2] بوابة الحسابات ==================== */}
      {step === 'oauth' && (
        <div style={{ width: '90%', maxWidth: '370px', background: '#000000', border: '1px solid #111111', padding: '35px 25px', borderRadius: '16px', boxSizing: 'border-box' }}>
          <div style={{ margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center', animation: 'floatLogo 4s infinite ease-in-out' }}>
            <NovaLogoIcon size={85} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#ffffff', marginBottom: '25px', letterSpacing: '1px', fontWeight: '600', textAlign: 'center' }}>{t.accessAccount}</p>
          <div className="supabase-auth-container" style={{ direction: 'ltr' }}>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google', 'github']} theme="dark" showLinks={true} />
          </div>
        </div>
      )}

      {/* ==================== [3] شاشة المحادثة المتمحورة والذكية بالمنتصف ==================== */}
      {step === 'main' && (
        <div style={{ 
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', padding: '30px 20px', boxSizing: 'border-box'
        }}>
          
          <div style={{
            width: '100%', maxWidth: '720px',
            height: isChatActive ? '83vh' : 'auto',
            display: 'flex', flexDirection: 'column',
            justifyContent: isChatActive ? 'space-between' : 'center',
            alignItems: 'center',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>

            {/* الشعار */}
            <div style={{
              transform: isChatActive ? 'scale(0.65)' : 'scale(1)',
              marginBottom: isChatActive ? '10px' : '30px',
              animation: robotState === 'thinking' ? 'pulseLogoThinking 0.4s infinite ease-in-out' : 'floatLogo 4s infinite ease-in-out',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              flexShrink: 0
            }}>
              <NovaLogoIcon size={isChatActive ? 100 : 145} />
            </div>

            {/* صندوق رسائل الشات بالنص */}
            {isChatActive && (
              <div className="custom-scrollbar" style={{ 
                width: '100%', flex: 1, overflowY: 'auto', 
                display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 5px',
                margin: '10px 0', animation: 'fadeInMessages 0.5s ease'
              }} ref={chatBoxRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    <div style={{ 
                      maxWidth: '85%', padding: '14px 18px', borderRadius: '10px', 
                      background: msg.sender === 'user' ? '#0d0d0d' : '#000000', 
                      border: msg.sender === 'user' ? '1px solid #1a1a1a' : '1px solid #111111', 
                      fontSize: '0.95rem', lineHeight: '1.5', textAlign: 'left', direction: 'ltr'
                    }}>
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                      
                      {msg.codeBlock && (
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #111111', paddingTop: '12px' }}>
                          <button onClick={() => setPreviewContent(msg.codeBlock || null)} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>{t.livePreview}</button>
                          <button onClick={() => triggerDeployment(idx)} style={{ background: 'transparent', color: '#ffffff', border: '1px solid #333333', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>{t.prodDeploy}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* صندوق المدخلات والكتابة الفاخر */}
            <div style={{ 
              width: '100%', display: 'flex', gap: '12px', background: '#000000', border: '1px solid #1f1f1f', 
              padding: '12px 16px', borderRadius: '12px', alignItems: 'center', boxSizing: 'border-box',
              flexShrink: 0
            }}>
              {isListening ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'wavePulse 0.4s infinite ease-in-out' }} />
                  <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'wavePulse 0.6s infinite ease-in-out', animationDelay: '0.1s' }} />
                  <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'wavePulse 0.3s infinite ease-in-out', animationDelay: '0.2s' }} />
                </div>
              ) : (
                <input 
                  type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={robotState === 'thinking' ? t.processing : t.placeholder} 
                  disabled={robotState === 'thinking'}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.95rem', textAlign: t.dir === 'rtl' ? 'right' : 'left' }}
                />
              )}

              <button onClick={toggleVoice} disabled={robotState === 'thinking'} style={{ background: 'transparent', color: isListening ? '#ffffff' : '#444444', border: 'none', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1rem' }}>🎙️</button>
              <button onClick={handleSendMessage} disabled={robotState === 'thinking' || !userInput.trim()} style={{ background: userInput.trim() ? '#ffffff' : '#000000', color: userInput.trim() ? '#000000' : '#444444', border: userInput.trim() ? 'none' : '1px solid #222222', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold', transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }}>↗</button>
            </div>

          </div>

          {/* ==================== نافذة منبثقة للمعاينة المباشرة ==================== */}
          {previewContent && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000, padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: '900px', height: '80vh', background: '#000000', border: '1px solid #222222', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #111111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', background: '#050505', direction: t.dir as 'rtl' | 'ltr' }}>
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', color: '#888' }}>{t.previewWin}</span>
                  <button onClick={() => setPreviewContent(null)} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>{t.close}</button>
                </div>
                <iframe srcDoc={previewContent} title="Nova Preview" style={{ flex: 1, width: '100%', border: 'none', background: '#ffffff' }} />
              </div>
            </div>
          )}

          {/* ==================== شاشة محاكاة الـ Cloud Deploy الفورية للإنتاج ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000 }}>
              <div style={{ width: '90%', maxWidth: '400px', background: '#050505', border: '1px solid #222222', padding: '35px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', letterSpacing: '1px', color: '#666', marginBottom: '20px' }}>{t.deployProgress}</p>
                <div style={{ width: '100%', height: '4px', background: '#111111', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ width: `${deployingStatus.progress}%`, height: '100%', background: '#ffffff', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '25px' }}>{deployingStatus.progress}%</p>
                {deployingStatus.url ? (
                  <div>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '10px' }}>{t.envLive}</p>
                    <a href={deployingStatus.url} target="_blank" rel="noreferrer" style={{ color: '#ffffff', fontSize: '0.9rem', wordBreak: 'break-all', display: 'block', marginBottom: '25px', textDecoration: 'underline' }}>{deployingStatus.url}</a>
                    <button onClick={() => setDeployingStatus({ active: false, progress: 0, url: null })} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>{t.returnWorkspace}</button>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#444' }}>{t.syncing}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}