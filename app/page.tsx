'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// 🌟 شعار Nova الهندسي الفخم الثابت
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
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

export default function NovaAI() {
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [isExitingPassword, setIsExitingPassword] = useState(false);
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [thinkingStatusText, setThinkingStatusText] = useState('جاري تحليل طلبك...');
  
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: "مرحباً بك! أنا NOVA AI. يمكنني الإجابة على أسئلتك التقنية بكل احترافية، أو البدء في بناء وتصميم المواقع الإلكترونية. ماذا تريد أن نستكشف اليوم؟\n\nHello! I am NOVA AI. I can answer your technical questions or build professional websites. What are we exploring today?" }
  ]);

  const [currentProjectState, setCurrentProjectState] = useState<'idle' | 'asking_details' | 'ready_to_build'>('idle');
  const [showWorkspaceButtons, setShowWorkspaceButtons] = useState(false); 
  const [activePreviewCode, setActivePreviewCode] = useState<string | null>(null);
  
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deployingStatus, setDeployingStatus] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
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

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    const hasArabic = /[\u0600-\u06FF]/.test(userText);
    const detectedLang = hasArabic ? 'ar' : 'en';
    setCurrentLang(detectedLang);

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');
    setRobotState('thinking');
    setThinkingStatusText(detectedLang === 'ar' ? 'جاري تحليل تفاصيل طلبك...' : 'Analyzing input request...');

    setTimeout(() => {
      setThinkingStatusText(detectedLang === 'ar' ? 'جاري معالجة الحلول البرمجية الفاخرة...' : 'Processing logical solution...');
      
      setTimeout(() => {
        if (currentProjectState === 'asking_details') {
          setRobotState('normal');
          setCurrentProjectState('ready_to_build');
          
          setActivePreviewCode(`<!DOCTYPE html><html><head><style>body { background: #050505; color: #fff; font-family: sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; } .box { border: 1px dashed #333; padding: 40px; border-radius: 12px; text-align:center; box-shadow: 0 4px 30px rgba(0,0,0,0.5); }</style></head><body><div class="box"><h1>Custom Workspace Preview</h1><p>Architected perfectly around your custom prompt: "${userText}"</p><p style="color:#888; font-size:0.9rem;">This workspace is fully scalable. You can request changes or click Production Deploy anytime.</p></div></body></html>`);
          
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: detectedLang === 'ar' 
                ? `🎯 تم تحميل تفاصيلك ومواصفاتك المخصصة بنجاح!\n\nلقد قمت ببناء نسخة معاينة حية متكاملة بناءً على رغبتك. تظهر لك الآن أزرار التحكم "Preview" و "Deploy" في الشريط العلوي. إذا كنت تريد تعديل أي شيء أخبرني هنا، وإذا كان ممتازاً اضغط على "Deploy" لجعله موقعاً حقيقياً.`
                : `🎯 Dynamic specifications loaded successfully!\n\nI have structured a comprehensive Live Preview according to your details. The "Preview" and "Deploy" toggles are now active at the top. If you need any code iterations, just let me know here. If it's perfect, click "Deploy" to publish it live.`
            }
          ]);
          return;
        }

        const lowerText = userText.toLowerCase();
        const isBuildIntent = lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('website') || lowerText.includes('make') || lowerText.includes('موقع') || lowerText.includes('انشاء') || lowerText.includes('صمم') || lowerText.includes('ابني');
        
        if (isBuildIntent) {
          setRobotState('normal');
          setCurrentProjectState('asking_details');
          setShowWorkspaceButtons(true);
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: detectedLang === 'ar'
                ? `💡 لقد لاحظت أنك تريد إنشاء منصة ويب جديدة. قبل أن أبدأ في كتابة الأكواد البرمجية للموقع وتوليدها، هل هناك أي تفاصيل إضافية أو شروط محددة تود إضافتها？ (مثل: ألوان معينة تفضلها، أقسام تريد رؤيتها، مميزات خاصة بالموقع، أو هوية بصرية معينة)`
                : `💡 I detected that you want to engineer a new web platform. Before we compile the architecture, are there any custom details or technical requirements you want included? (e.g., Specific color schemes, UI sections, responsive layouts, or branding style)`
            }
          ]);
        } else {
          setRobotState('normal');
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: detectedLang === 'ar'
                ? `🛡️ إجابة تقنية احترافية:\n\nهذا سؤال مفاهيمي ممتاز جداً. للتعامل مع هذا الأمر بكفاءة عالية، يجب أن ننظر إليه من منظور بنيوي هندسي بحت. في مجالات هندسة البرمجيات والحوسبة، يضمن الحفاظ على معيار البرمجة الكائنية واستقلالية المكونات (Modularity) أن تعمل العناصر المختلفة بكفاءة ودون إحداث تضارب في الأنظمة الاسترجاعية الأخرى. أخبرني إذا كنت ترغب في التوسع في أي جانب تقني محدد!`
                : `🛡️ Elite Technical Solution:\n\nThat is an excellent conceptual question. To address this efficiently, we must look at it from a pure structural standpoint. In computing and system engineering, maintaining modularity ensures that components operate independently without causing regression errors. Let me know if you want me to expand deeper on any technical aspect of this topic!`
            }
          ]);
        }
      }, 1000);
    }, 1200);
  };

  const triggerDeployment = () => {
    if (!activePreviewCode) return;
    
    setDeployingStatus({ active: true, progress: 0, url: null });
    
    const stepsAr = [
      { p: 20, t: 'جاري فحص وتدقيق هيكلة الأكواد المصدرية...' },
      { p: 45, t: 'جاري تجميع وحزم ملفات المشروع والإنتاج...' },
      { p: 70, t: 'جاري حجز الخوادم السحابية الآمنة لـ Nova...' },
      { p: 90, t: 'جاري ربط النطاقات وتوليد الرابط النهائي الحقيقي...' },
      { p: 100, t: 'الموقع حقيقي والآن على شبكة الإنترنت!' }
    ];

    const stepsEn = [
      { p: 20, t: 'Parsing source code elements...' },
      { p: 45, t: 'Bundling distribution assets...' },
      { p: 70, t: 'Provisioning secure cloud infrastructure...' },
      { p: 90, t: 'Binding dynamic URL endpoints...' },
      { p: 100, t: 'Production site online!' }
    ];

    const targetSteps = currentLang === 'ar' ? stepsAr : stepsEn;

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < targetSteps.length) {
        const current = targetSteps[currentStepIdx];
        setDeployingStatus(prev => ({ ...prev, progress: current.p }));
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

  return (
    <div style={{ 
      direction: currentLang === 'ar' ? 'rtl' : 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#f4f0ea', color: '#111111',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 4px rgba(0,0,0,0.05)); }
          50% { transform: translateY(-4px); filter: drop-shadow(0 0 10px rgba(0,0,0,0.15)); }
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
        @keyframes fadeInButtons {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* 🌊 تحريك خلفية التغذية البصرية بشكل دوراني ممتد ومموج هادئ */
        @keyframes visualNutritionAnimation {
          0% { transform: scale(1.1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(2deg); }
          100% { transform: scale(1.1) rotate(0deg); }
        }

        .animated-visual-bg {
          position: fixed;
          top: -10%; left: -10%; width: 120%; height: 120%;
          background-image: url('image_eeda94.png');
          background-position: center; 
          background-size: cover;
          opacity: 0.45; 
          filter: contrast(115%) brightness(105%) mix-blend-mode(multiply);
          z-index: -2; 
          animation: visualNutritionAnimation 28s ease-in-out infinite;
          pointer-events: none; 
          will-change: transform;
        }

        .bg-vignette-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle, rgba(244,240,234,0.1) 20%, rgba(244,240,234,0.85) 90%);
          z-index: -1; pointer-events: none;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dcd6cd; border-radius: 4px; }
      `}</style>

      {/* 🖼️ صورة التغذية البصرية المدمجة بالبيج والمتحركة */}
      <div className="animated-visual-bg"></div>
      <div className="bg-vignette-overlay"></div>

      {/* ==================== 🛠️ شريط التحكم العلوي المتطور والأزرار مخفية بالبداية ==================== */}
      {step === 'main' && user && (
        <div style={{ 
          position: 'absolute', top: '24px', left: '24px', right: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 11000, pointerEvents: 'none'
        }}>
          
          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', direction: 'ltr' }}>
            {showWorkspaceButtons && (
              <div style={{ display: 'flex', gap: '10px', animation: 'fadeInButtons 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                {/* برفيو مكتوب فيه Preview فقط باللون الأبيض والخط داكن متناسق */}
                <button 
                  onClick={() => activePreviewCode && setPreviewModalOpen(true)}
                  disabled={!activePreviewCode}
                  style={{ 
                    background: '#ffffff', 
                    border: '1px solid #d0c9be', 
                    color: '#111111', 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    cursor: activePreviewCode ? 'pointer' : 'not-allowed', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    transition: 'all 0.2s',
                    opacity: activePreviewCode ? 1 : 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  Preview
                </button>
                {/* دبلوي مكتوب فيه Deploy فقط وباللون الأزرق المميز */}
                <button 
                  onClick={triggerDeployment}
                  disabled={!activePreviewCode}
                  style={{ 
                    background: '#0070f3', 
                    border: 'none', 
                    color: '#ffffff', 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    cursor: activePreviewCode ? 'pointer' : 'not-allowed', 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    transition: 'all 0.2s',
                    opacity: activePreviewCode ? 1 : 0.5,
                    boxShadow: activePreviewCode ? '0 4px 14px rgba(0, 112, 243, 0.25)' : 'none'
                  }}
                >
                  Deploy
                </button>
              </div>
            )}
          </div>

          <div ref={menuRef} style={{ pointerEvents: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ background: '#ffffff', border: '1px solid #e0dacf', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
            >
              <span style={{ color: '#111111', fontSize: '0.85rem', fontWeight: 'bold' }}>{user.email?.charAt(0).toUpperCase()}</span>
            </button>

            {isMenuOpen && (
              <div style={{ position: 'absolute', top: '48px', right: 0, background: '#ffffff', border: '1px solid #e0dacf', borderRadius: '12px', width: '200px', padding: '6px', direction: 'ltr', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0eae0' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#777777', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#ff4d4d', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================== [1] شاشة فحص كلمة المرور الفاخرة بالثيم البيج الناعم ==================== */}
      {step === 'password' && (
        <div style={{ 
          animation: isExitingPassword ? 'screenFadeOut 0.5s ease forwards' : 'none', 
          textAlign: 'center', width: '90%', maxWidth: '360px', background: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(16px)', border: '1px solid #e5ded4', padding: '45px 30px', borderRadius: '24px', zIndex: 10, direction: 'ltr',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}>
          <div style={{ margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', animation: robotIsShaking ? 'shakeLogo 0.15s infinite' : 'floatLogo 4s infinite ease-in-out' }}>
            <div style={{ background: '#111', padding: '15px', borderRadius: '20px' }}>
              <NovaLogoIcon size={80} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#777777', margin: '0 0 20px 0', letterSpacing: '1.5px', fontWeight: '700' }}>SECURITY KEY REQUIRED</p>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem', color: '#111111', textAlign: 'center', border: '1px solid #dcd5ca', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', background: '#ffffff', letterSpacing: '2px' }} 
          />
        </div>
      )}

      {/* ==================== [2] بوابة التحقق وحسابات المستخدم ==================== */}
      {step === 'oauth' && (
        <div style={{ width: '90%', maxWidth: '370px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid #e5ded4', padding: '35px 25px', borderRadius: '24px', boxSizing: 'border-box', zIndex: 10, direction: 'ltr', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <div style={{ margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center', animation: 'floatLogo 4s infinite ease-in-out' }}>
            <div style={{ background: '#111', padding: '12px', borderRadius: '16px' }}>
              <NovaLogoIcon size={65} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#111111', marginBottom: '25px', letterSpacing: '1px', fontWeight: '700', textAlign: 'center' }}>ACCESS SYSTEM ACCOUNT</p>
          <div className="supabase-auth-container">
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google', 'github']} theme="default" showLinks={true} />
          </div>
        </div>
      )}

      {/* ==================== [3] شاشة محرك الشات ومساحة المحادثة الذكية ==================== */}
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

            <div style={{ transform: 'scale(0.55)', marginBottom: '0px', animation: 'floatLogo 4s infinite ease-in-out', flexShrink: 0 }}>
              <div style={{ background: '#111', padding: '16px', borderRadius: '24px' }}>
                <NovaLogoIcon size={80} />
              </div>
            </div>

            {/* مساحة رسائل الدردشة الانسيابية بالثيم الجديد المتوافق مع البيج */}
            <div className="custom-scrollbar" style={{ 
              width: '100%', flex: 1, overflowY: 'auto', 
              display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 5px',
              margin: '10px 0', animation: 'fadeInMessages 0.4s ease'
            }} ref={chatBoxRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{ 
                    maxWidth: '85%', padding: '14px 18px', borderRadius: '16px', 
                    background: msg.sender === 'user' ? '#ffffff' : 'rgba(238, 232, 222, 0.75)', 
                    border: msg.sender === 'user' ? '1px solid #e3ddd2' : '1px solid #dfd8cb', 
                    backdropFilter: 'blur(8px)',
                    color: '#111111',
                    fontSize: '0.92rem', lineHeight: '1.6', textAlign: currentLang === 'ar' ? 'right' : 'left',
                    direction: currentLang === 'ar' ? 'rtl' : 'ltr',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  </div>
                </div>
              ))}

              {/* تأثير جاري التفكير (Thinking Status) المتناغم مع لغة الدردشة */}
              {robotState === 'thinking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: 'fit-content', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', border: '1px dashed #cdc5b6', padding: '12px 20px', borderRadius: '14px', animation: 'fadeInMessages 0.2s ease', alignSelf: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: currentLang === 'ar' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '6px', height: '6px', background: '#111111', borderRadius: '50%', animation: 'shakeLogo 0.5s infinite alternate' }} />
                    <span style={{ fontSize: '0.8rem', color: '#555555', fontWeight: '500' }}>{thinkingStatusText}</span>
                  </div>
                  <div style={{ width: '120px', height: '2px', background: '#e4ded4', position: 'relative', overflow: 'hidden', borderRadius: '1px', alignSelf: currentLang === 'ar' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: '#111111', animation: 'thinkingBar 1.5s infinite ease-in-out' }} />
                  </div>
                </div>
              )}
            </div>

            {/* صندوق مدخلات المحادثة الرئيسي */}
            <div style={{ 
              width: '100%', display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid #dcd5c9', 
              padding: '10px 16px', borderRadius: '100px', alignItems: 'center', boxSizing: 'border-box', flexShrink: 0,
              flexDirection: currentLang === 'ar' ? 'row-reverse' : 'row',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
            }}>
              <input 
                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={currentLang === 'ar' ? "اسأل سؤالاً أو قم بوصف موقع الويب الذي تريد بناءه..." : "Ask a question or describe the website you want to build..."} 
                disabled={robotState === 'thinking'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#111111', fontSize: '0.95rem', padding: '6px 8px', textAlign: currentLang === 'ar' ? 'right' : 'left' }}
              />

              <button 
                onClick={() => alert(currentLang === 'ar' ? 'واجهة الإدخال الصوتي مهيأة تماماً.' : 'Voice core module activated.')} 
                disabled={robotState === 'thinking'} 
                style={{ background: '#eae3d8', color: '#444444', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <MicrophoneIcon />
              </button>
              
              <button 
                onClick={handleSendMessage} 
                disabled={robotState === 'thinking' || !userInput.trim()} 
                style={{ background: userInput.trim() ? '#111111' : '#eae3d8', color: userInput.trim() ? '#ffffff' : '#999999', border: 'none', width: '56px', height: '38px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <SendIcon />
              </button>
            </div>

          </div>

          {/* ==================== نافذة الـ Live Preview الهيكلية للمشاريع ==================== */}
          {previewModalOpen && activePreviewCode && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000, padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: '1000px', height: '85vh', background: '#ffffff', border: '1px solid #dcd5c9', borderRadius: '18px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0eae0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', background: '#faf8f5', flexDirection: currentLang === 'ar' ? 'row-reverse' : 'row' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: currentLang === 'ar' ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: '0.85rem', color: '#111111', fontWeight: '700', letterSpacing: '0.5px' }}>{currentLang === 'ar' ? 'نافذة المعاينة الحية (Sandbox)' : 'PREVIEW WINDOW (SANDBOX)'}</span>
                    <span style={{ fontSize: '0.7rem', background: '#eae3d8', color: '#555555', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>Development Build</span>
                  </div>
                  <button onClick={() => setPreviewModalOpen(false)} style={{ background: '#111111', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', transition: 'opacity 0.2s' }}>{currentLang === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}</button>
                </div>
                <iframe srcDoc={activePreviewCode} title="Nova Scalable Workspace" style={{ flex: 1, width: '100%', border: 'none', background: '#ffffff' }} />
              </div>
            </div>
          )}

          {/* ==================== شاشة معالجة الـ Production Deploy النهائية والمستقلة ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(244, 240, 234, 0.95)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 13000 }}>
              <div style={{ width: '90%', maxWidth: '420px', background: '#ffffff', border: '1px solid #dcd5c9', padding: '40px 35px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#777777', marginBottom: '20px', fontWeight: '700' }}>{currentLang === 'ar' ? 'جاري بناء ورفع الموقع الإنتاجي النهائي' : 'COMPILING PRODUCTION BUILD'}</p>
                
                <div style={{ width: '100%', height: '3px', background: '#eae3d8', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ width: `${deployingStatus.progress}%`, height: '100%', background: '#0070f3', transition: 'width 0.3s ease' }} />
                </div>
                
                <p style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '15px', color: '#111111' }}>{deployingStatus.progress}%</p>
                <p style={{ color: '#666666', fontSize: '0.85rem', marginBottom: '25px', fontStyle: 'italic' }}>{thinkingStatusText}</p>
                
                {deployingStatus.url && (
                  <div style={{ animation: 'fadeInMessages 0.4s ease' }}>
                    <div style={{ background: '#faf8f5', border: '1px solid #eadecf', padding: '16px', borderRadius: '12px', marginBottom: '25px' }}>
                      <p style={{ color: '#555555', fontSize: '0.8rem', margin: '0 0 8px 0', fontWeight: '500' }}>{currentLang === 'ar' ? '✓ البيئة الإنتاجية للموقع تعمل الآن على الرابط التالي:' : '✓ Production Environment Live at:'}</p>
                      <a href={deployingStatus.url} target="_blank" rel="noreferrer" style={{ color: '#0070f3', fontSize: '0.88rem', wordBreak: 'break-all', fontWeight: '600', textDecoration: 'underline' }}>{deployingStatus.url}</a>
                    </div>
                    <button onClick={() => setDeployingStatus({ active: false, progress: 0, url: null })} style={{ width: '100%', background: '#111111', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'background 0.2s' }}>{currentLang === 'ar' ? 'العودة لمساحة العمل' : 'Return to Workspace'}</button>
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