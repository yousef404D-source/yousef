'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function NovaAI() {
  // الحالات الأمنية والمراحل
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [isExitingPassword, setIsExitingPassword] = useState(false);
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  // حالات الشات والتمدد الأوتوماتيكي
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; codeBlock?: string }>>([]);
  const [isChatActive, setIsChatActive] = useState(false); 

  // حالات الـ Preview والـ Deploy المحاكية
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [deployingStatus, setDeployingStatus] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // مسار شعارك الجديد (تأكد من تسمية الصورة nova-logo.png ووضعها داخل مجلد public)
  const logoUrl = '/nova-logo.png';

  // مراقبة جلسة تسجيل الدخول الفعلية من Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStep('main');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setStep('main');
      } else {
        setStep('password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // إعداد ميزة تحويل الصوت إلى نص (Voice-to-Text)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'ar-SA';
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
  }, []);

  // التمرير التلقائي لأسفل الشات
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  // التحقق من كلمة المرور 
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

  // إرسال الرسالة وتنشيط تكبير الشات
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

  // تشغيل محاكاة الـ Deployment
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
    if (!recognitionRef.current) return alert('Speech recognition not supported in this browser.');
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const stopVoice = () => {
    setIsListening(false);
    setRobotState('normal');
  };

  return (
    <div style={{ 
      direction: 'ltr', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', width: '100vw', background: '#000000', color: '#ffffff',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      <style>{`
        /* ⚪⚫ نظام الأنيميشن للشعار الجديد الخاص بك */
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 4px rgba(255,255,255,0.1)); }
          50% { transform: translateY(-8px) scale(1.02); filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); }
        }
        @keyframes shakeLogo {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes pulseLogoThinking {
          0%, 100% { transform: scale(1); filter: opacity(0.6); }
          50% { transform: scale(1.08); filter: opacity(1) drop-shadow(0 0 20px rgba(255,255,255,0.4)); }
        }
        @keyframes wavePulse {
          0%, 100% { height: 6px; }
          50% { height: 24px; }
        }
        @keyframes screenFadeIn { 
          from { opacity: 0; transform: scale(0.98); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes screenFadeOut { 
          from { opacity: 1; transform: scale(1); } 
          to { opacity: 0; transform: scale(0.96); } 
        }

        /* تنسيقات Supabase Auth مونوكروم */
        .supabase-auth-container {
          background: #000000 !important;
          padding: 5px;
        }
        .supabase-auth-container button {
          border-radius: 8px !important;
          font-weight: 600 !important;
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px solid #ffffff !important;
          padding: 10px !important;
          transition: 0.2s all ease !important;
        }
        .supabase-auth-container button:hover {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .supabase-auth-container input {
          border-radius: 8px !important;
          text-align: center !important;
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 1px solid #222222 !important;
          padding: 12px !important;
        }
        .supabase-auth-container label {
          color: #666666 !important;
          font-size: 0.75rem !important;
          display: block;
          margin-bottom: 6px;
          text-align: left;
        }
        .supabase-auth-container a {
          color: #ffffff !important;
          font-size: 0.8rem !important;
          text-decoration: underline !important;
        }
        .supabase-auth-container span {
          color: #444444 !important;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222222; border-radius: 4px; }
      `}</style>

      {/* ==================== [1] شاشة كلمة المرور مع الشعار الجديد ==================== */}
      {step === 'password' && (
        <div style={{ 
          animation: isExitingPassword ? 'screenFadeOut 0.5s ease forwards' : 'screenFadeIn 0.4s ease', 
          textAlign: 'center', width: '90%', maxWidth: '360px', background: '#000000', 
          border: '1px solid #111111', padding: '45px 30px', borderRadius: '16px' 
        }}>
          {/* حاوية الشعار التفاعلية */}
          <div style={{
            width: '100px', height: '100px', margin: '0 auto 25px auto',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            animation: robotIsShaking ? 'shakeLogo 0.15s infinite' : 'floatLogo 4s infinite ease-in-out'
          }}>
            <img src={logoUrl} alt="Nova AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <p style={{ fontSize: '0.8rem', color: '#555555', margin: '0 0 20px 0', letterSpacing: '1.5px', fontWeight: '600' }}>SECURITY KEY REQUIRED</p>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '12px', fontSize: '1rem', color: '#fff', textAlign: 'center', border: '1px solid #222222', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', background: '#000000', letterSpacing: '2px' }} 
          />
        </div>
      )}

      {/* ==================== [2] بوابة الحسابات الشاملة مع الشعار الجديد ==================== */}
      {step === 'oauth' && (
        <div style={{ animation: 'screenFadeIn 0.4s ease', width: '90%', maxWidth: '370px', background: '#000000', border: '1px solid #111111', padding: '35px 25px', borderRadius: '16px', boxSizing: 'border-box' }}>
          
          <div style={{ width: '80px', height: '80px', margin: '0 auto 20px auto', animation: 'floatLogo 4s infinite ease-in-out' }}>
            <img src={logoUrl} alt="Nova AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <p style={{ fontSize: '0.8rem', color: '#ffffff', marginBottom: '25px', letterSpacing: '1px', fontWeight: '600', textAlign: 'center' }}>ACCESS SYSTEM ACCOUNT</p>
          <div className="supabase-auth-container" style={{ direction: 'ltr' }}>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'github']}
              theme="dark"
              showLinks={true} 
            />
          </div>
        </div>
      )}

      {/* ==================== [3] شاشة الشات المتقدمة ذات التمدد والتكبير التلقائي والشعار الجديد ==================== */}
      {step === 'main' && (
        <div style={{ 
          animation: 'screenFadeIn 0.5s ease', width: '100%', height: '100%', 
          display: 'flex', flexDirection: 'column', 
          justifyContent: isChatActive ? 'space-between' : 'center', 
          padding: '30px 20px', boxSizing: 'border-box', background: '#000000' 
        }}>
          
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            justifyContent: isChatActive ? 'flex-start' : 'center',
            flex: isChatActive ? 1 : 'none', width: '100%', overflow: 'hidden',
            transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)' 
          }}>
            
            {/* الشعار في واجهة الذكاء الاصطناعي الرئيسية */}
            <div style={{
              width: isChatActive ? '70px' : '130px', 
              height: isChatActive ? '70px' : '130px', 
              marginBottom: isChatActive ? '20px' : '35px',
              animation: robotState === 'thinking' ? 'pulseLogoThinking 0.4s infinite ease-in-out' : 'floatLogo 4s infinite ease-in-out',
              transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
            }}>
              <img src={logoUrl} alt="Nova AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* صندوق رسائل الشات التفاعلي الممتد */}
            {isChatActive && (
              <div className="custom-scrollbar" style={{ 
                width: '100%', maxWidth: '720px', flex: 1, overflowY: 'auto', 
                display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0',
                animation: 'screenFadeIn 0.6s ease' 
              }} ref={chatBoxRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    <div style={{ 
                      maxWidth: '85%', padding: '14px 18px', borderRadius: '10px', 
                      background: msg.sender === 'user' ? '#0d0d0d' : '#000000', 
                      border: msg.sender === 'user' ? '1px solid #1a1a1a' : '1px solid #111111', 
                      fontSize: '0.95rem', lineHeight: '1.5'
                    }}>
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                      
                      {msg.codeBlock && (
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #111111', paddingTop: '12px' }}>
                          <button 
                            onClick={() => setPreviewContent(msg.codeBlock || null)} 
                            style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                          >
                            💻 Live Preview
                          </button>
                          <button 
                            onClick={() => triggerDeployment(idx)} 
                            style={{ background: 'transparent', color: '#ffffff', border: '1px solid #333333', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                          >
                            🚀 Production Deploy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* صندوق المدخلات الذكي الكلاسيكي */}
          <div style={{ 
            width: '100%', maxWidth: '720px', margin: isChatActive ? '10px auto 0 auto' : '0 auto', 
            display: 'flex', gap: '12px', background: '#000000', border: '1px solid #1f1f1f', 
            padding: '12px 16px', borderRadius: '12px', alignItems: 'center', boxSizing: 'border-box',
            transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
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
                placeholder={robotState === 'thinking' ? "Processing build architecture..." : "Ask anything or describe your landing page..."} 
                disabled={robotState === 'thinking'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.95rem' }}
              />
            )}

            <button onClick={toggleVoice} disabled={robotState === 'thinking'} style={{ background: 'transparent', color: isListening ? '#ffffff' : '#444444', border: 'none', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1rem' }}>
              🎙️
            </button>
            <button onClick={handleSendMessage} disabled={robotState === 'thinking' || !userInput.trim()} style={{ background: userInput.trim() ? '#ffffff' : '#000000', color: userInput.trim() ? '#000000' : '#444444', border: userInput.trim() ? 'none' : '1px solid #222222', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {robotState === 'thinking' ? '⏳' : '↗'}
            </button>
          </div>

          {/* ==================== نافذة منبثقة للمعاينة الحية ==================== */}
          {previewContent && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: '900px', height: '80vh', background: '#000000', border: '1px solid #222222', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #111111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', background: '#050505' }}>
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', color: '#888' }}>PREVIEW WINDOW (SANDBOX)</span>
                  <button onClick={() => setPreviewContent(null)} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Close</button>
                </div>
                <iframe srcDoc={previewContent} title="Nova Preview" style={{ flex: 1, width: '100%', border: 'none', background: '#ffffff' }} />
              </div>
            </div>
          )}

          {/* ==================== شاشة محاكاة الـ Cloud Deploy الفورية للإنتاج ==================== */}
          {deployingStatus.active && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
              <div style={{ width: '90%', maxWidth: '400px', background: '#050505', border: '1px solid #222222', padding: '35px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', letterSpacing: '1px', color: '#666', marginBottom: '20px' }}>PRODUCTION DEPLOYMENT IN PROGRESS</p>
                
                <div style={{ width: '100%', height: '4px', background: '#111111', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ width: `${deployingStatus.progress}%`, height: '100%', background: '#ffffff', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '25px' }}>{deployingStatus.progress}%</p>

                {deployingStatus.url ? (
                  <div style={{ animation: 'screenFadeIn 0.3s ease' }}>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '10px' }}>✓ Environment Live at:</p>
                    <a href={deployingStatus.url} target="_blank" rel="noreferrer" style={{ color: '#ffffff', fontSize: '0.9rem', wordBreak: 'break-all', display: 'block', marginBottom: '25px', textDecoration: 'underline' }}>{deployingStatus.url}</a>
                    <button onClick={() => setDeployingStatus({ active: false, progress: 0, url: null })} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Return to Workspace</button>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#444' }}>Synchronizing structural repository to cloud nodes...</p>
                )}
              </div>
            </div>
          )}

          <button onClick={() => supabase.auth.signOut()} style={{ position: 'absolute', bottom: '10px', right: '15px', background: 'transparent', color: '#222222', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>
            Sign Out
          </button>

        </div>
      )}

    </div>
  );
}