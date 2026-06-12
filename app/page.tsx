'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function NovaAI() {
  // الحالات الأمنية والتحقق
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'password' | 'oauth' | 'syncing' | 'main'>('password');
  const [robotEyeColor, setRobotEyeColor] = useState<'white' | 'red' | 'green' | 'cyan'>('white');
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  // حالات الشات والذكاء الاصطناعي
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening' | 'success'>('normal');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; url?: string }>>([]);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // مراقبة حالة تسجيل الدخول الحقيقية مع إضافة أنميشن المزامنة الفخم
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        triggerSyncAnimation();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setRobotEyeColor('green');
        setTimeout(() => {
          triggerSyncAnimation();
          setRobotEyeColor('white');
        }, 600);
      } else {
        setStep('password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const triggerSyncAnimation = () => {
    setStep('syncing');
    setTimeout(() => {
      setStep('main');
    }, 2200); // وقت أنميشن شاشة التحميل السيبرانية
  };

  // إعداد ميزة الـ Voice-to-Text
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'ar-SA';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

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

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  // فحص كلمة المرور المبدئية
  const checkPassword = () => {
    if (password === 'yousefyousefbaker505') {
      setRobotEyeColor('green');
      setTimeout(() => {
        setStep('oauth');
      }, 800);
    } else {
      setRobotEyeColor('red');
      setRobotIsShaking(true);
      setTimeout(() => {
        setRobotIsShaking(false);
        setRobotEyeColor('white');
        setPassword('');
      }, 1000);
    }
  };

  // إرسال واستدعاء المحرك الحقيقي بقوة هائلة
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const textToSend = userInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setUserInput('');
    setRobotState('thinking');

    try {
      const response = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        setRobotState('success');
        setGeneratedUrl(data.url);
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `⚡ NOVA ENGINE CODES COMPiled:\nتم بناء وتجهيز موقعك الحقيقي بنجاح تام وبأعلى كفاءة في النظام الرقمي! انظر إلى يمينك للمعاينة الحية والتفاعل فوراً.`,
            url: data.url
          }
        ]);
        setTimeout(() => setRobotState('normal'), 3000); // العودة للحالة الطبيعية بعد أنميشن النجاح
      } else {
        throw new Error(data.error || "Failed to generate site code");
      }

    } catch (err: any) {
      setRobotState('normal');
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `❌ SYSTEM FAILURE:\nفشل المحرك في معالجة البيانات: ${err.message}` }
      ]);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const stopVoice = () => {
    setIsListening(false);
    setRobotState('normal');
  };

  return (
    <div style={{ 
      direction: 'rtl', // قلب الموقع بالكامل للغة العربية والاحترافية الشرقية
      fontFamily: '"Cairo", "-apple-system", sans-serif', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw', 
      background: '#03030c', 
      color: '#ffffff',
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden'
    }}>
      
      <style>{`
        /* 🌌 مصفوفة الأنميشنات الخارقة مالها حدود */
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.1)); }
          50% { transform: translateY(-10px) scale(1.02); filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.25)); }
        }
        @keyframes robotShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes eyePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; filter: brightness(1); }
          50% { transform: scale(1.2); opacity: 1; filter: brightness(1.4); }
        }
        @keyframes rotateClockwise { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes rotateCounterClockwise { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        @keyframes cyberScan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        @keyframes voiceWavePulse { 0%, 100% { height: 6px; } 50% { height: 32px; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes glitchText {
          0% { text-shadow: 2px 0 0 #ff00c1, -2px 0 0 #00fff0; }
          50% { text-shadow: -2px 0 0 #ff00c1, 2px 0 0 #00fff0; }
          100% { text-shadow: 2px 0 0 #ff00c1, -2px 0 0 #00fff0; }
        }

        /* تخصيص صندوق البريد وسوبابيز */
        .supabase-auth-container { background: #06060f !important; border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 20px; }
        .supabase-auth-container button { border-radius: 12px !important; font-weight: bold !important; transition: 0.3s all !important; background: linear-gradient(135deg, #4f46e5, #06b6d4) !important; color: #ffffff !important; border: none !important; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4) !important; }
        .supabase-auth-container button:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6) !important; }
        .supabase-auth-container input { border-radius: 12px !important; text-align: center !important; background-color: #020205 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 12px !important; }
        .supabase-auth-container label { color: #888899 !important; font-size: 0.8rem !important; display: block; margin-bottom: 5px; text-align: right; }
        .supabase-auth-container a { color: #4f46e5 !important; font-size: 0.8rem !important; text-decoration: none !important; }
        
        /* شريط التمرير الاحترافي الفخم للشات */
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
      `}</style>

      {/* ==================== [1] شاشة القفل الفائقة البساطة ==================== */}
      {step === 'password' && (
        <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', width: '90%', maxWidth: '380px', background: '#05050d', border: '1px solid rgba(255,255,255,0.05)', padding: '50px 35px', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%', background: '#090914',
            border: `2px solid ${robotEyeColor === 'red' ? '#ff3355' : robotEyeColor === 'green' ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
            margin: '0 auto 35px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
            animation: robotIsShaking ? 'robotShake 0.15s infinite' : 'robotFloat 4s infinite ease-in-out'
          }}>
            <div style={{ position: 'absolute', width: '106%', height: '106%', borderRadius: '50%', border: '1px dashed #4f46e5', opacity: 0.4, animation: 'rotateClockwise 15s infinite linear' }} />
            <div style={{ 
              width: '22px', height: '22px', borderRadius: '50%', 
              background: robotEyeColor === 'red' ? '#ff3355' : robotEyeColor === 'green' ? '#10b981' : '#00fff0', 
              boxShadow: `0 0 25px ${robotEyeColor === 'red' ? '#ff3355' : robotEyeColor === 'green' ? '#10b981' : '#00fff0'}`,
              animation: 'eyePulse 1.5s infinite ease-in-out'
            }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6366f1', margin: '0 0 25px 0', letterSpacing: '2px', fontWeight: 'bold' }}>أدخل رمز برمجية المحرك</p>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '16px', fontSize: '1.2rem', color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', outline: 'none', background: '#000005', transition: '0.3s', letterSpacing: '4px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)' }} 
          />
        </div>
      )}

      {/* ==================== [2] خطوة الـ Supabase Auth الحقيقية ==================== */}
      {step === 'oauth' && (
        <div style={{ animation: 'fadeIn 0.5s ease', width: '90%', maxWidth: '390px', background: '#05050d', border: '1px solid rgba(255,255,255,0.05)', padding: '40px 30px', borderRadius: '28px', boxSizing: 'border-box' }}>
          <p style={{ fontSize: '0.9rem', color: '#00fff0', marginBottom: '30px', letterSpacing: '1px', fontWeight: 'bold', textAlign: 'center', animation: 'glitchText 3s infinite' }}>بوابة توثيق الحساب الذكي</p>
          <div className="supabase-auth-container" style={{ direction: 'ltr' }}>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google', 'github']} theme="dark" view="sign_in" showLinks={true} />
          </div>
        </div>
      )}

      {/* ==================== [3] الأنميشن الجديد: شاشة مزامنة ودخول النظام الكونية ==================== */}
      {step === 'syncing' && (
        <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center', position: 'relative' }}>
          <div style={{ width: '120px', height: '120px', margin: '0 auto 30px auto', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#4f46e5', borderBottomColor: '#00fff0', animation: 'rotateClockwise 1s infinite linear' }} />
            <div style={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', border: '2px solid transparent', borderLeftColor: '#ec4899', borderRightColor: '#eab308', animation: 'rotateCounterClockwise 1.5s infinite linear' }} />
            <div style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 30px #ffffff' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '1px', background: 'linear-gradient(to right, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'glitchText 2s infinite' }}>جاري مزامنة البيئة السيبرانية...</h2>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '10px' }}>Nova Core Engine v2.0.26</p>
        </div>
      )}

      {/* ==================== [4] الواجهة الرئيسية الأسطورية المنقسمة ==================== */}
      {step === 'main' && (
        <div style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)', width: '100vw', height: '100vh', display: 'flex', boxSizing: 'border-box', background: '#020206' }}>
          
          {/* الجانب الأيمن: الشات الفخم جداً وعقل الروبوت الخارق */}
          <div style={{ width: generatedUrl ? '450px' : '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 24px', boxSizing: 'border-box', borderLeft: generatedUrl ? '1px solid rgba(255,255,255,0.08)' : 'none', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', background: 'linear-gradient(180deg, #04040f 0%, #020206 100%)', zIndex: 10 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', flex: 1, width: '100%' }}>
              
              {/* الروبوت السيبراني متطور الأنميشن */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', 
                background: robotState === 'thinking' ? '#090924' : robotState === 'listening' ? '#041c10' : '#060614',
                border: `2px solid ${robotState === 'thinking' ? '#00fff0' : robotState === 'listening' ? '#10b981' : robotState === 'success' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}`, 
                display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '30px', marginTop: '10px',
                animation: robotState === 'thinking' ? 'none' : 'robotFloat 4s infinite ease-in-out', transition: 'all 0.4s ease'
              }}>
                {/* الحلقات الخارجية الدوارة تعتمد على حالة البوت الميكانيكية */}
                <div style={{ position: 'absolute', width: '108%', height: '108%', borderRadius: '50%', border: '1px dashed #4f46e5', opacity: 0.5, animation: robotState === 'thinking' ? 'rotateClockwise 1.5s infinite linear' : 'rotateClockwise 25s infinite linear' }} />
                <div style={{ position: 'absolute', width: '116%', height: '116%', borderRadius: '50%', border: '1px dashed #00fff0', opacity: 0.2, animation: robotState === 'thinking' ? 'rotateCounterClockwise 3s infinite linear' : 'rotateCounterClockwise 40s infinite linear' }} />
                
                {/* البؤبؤ المضيء المتفاعل مع البيانات */}
                <div style={{ 
                  width: '20px', height: '20px', borderRadius: '50%', 
                  background: robotState === 'thinking' ? '#00fff0' : robotState === 'listening' ? '#10b981' : robotState === 'success' ? '#a855f7' : '#ffffff', 
                  boxShadow: `0 0 30px ${robotState === 'thinking' ? '#00fff0' : robotState === 'listening' ? '#10b981' : robotState === 'success' ? '#a855f7' : '#ffffff'}`,
                  animation: 'eyePulse 1s infinite ease-in-out', transition: 'all 0.3s'
                }} />
              </div>

              {/* صندوق شات سينمائي زجاجي فخم من اليمين لليسار */}
              <div className="custom-scroll" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingLeft: '5px', paddingRight: '5px' }} ref={chatBoxRef}>
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#4b5563', marginTop: '40px', fontSize: '0.9rem' }}>
                    <p style={{ color: '#6366f1', fontWeight: 'bold', marginBottom: '5px' }}>⚡ نِظام NOVA جاهز تماماً للاستدعاء الخارق</p>
                    <p>اكتب لي أي موقع حقيقي ببالك وسأبنيه لك بقوة كود مطلقة وبثوانٍ معدودة...</p>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end', // المستخدم يمين والبوت يسار بالتوزيع الاحترافي
                    width: '100%',
                    animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <div style={{ 
                      maxWidth: '85%', 
                      padding: '14px 18px', 
                      borderRadius: msg.sender === 'user' ? '20px 20px 0px 20px' : '20px 20px 20px 0px', 
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)' : 'rgba(255,255,255,0.03)', 
                      border: msg.sender === 'user' ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.05)', 
                      backdropFilter: 'blur(10px)',
                      fontSize: '0.95rem',
                      boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(99,102,241,0.05)' : 'none'
                    }}>
                      <strong style={{ display: 'block', color: msg.sender === 'user' ? '#00fff0' : '#a855f7', marginBottom: '6px', fontSize: '0.75rem', letterSpacing: '1px' }}>
                        {msg.sender === 'user' ? '👤 المُطوّر الحالي' : '⚡ مصفوفة NOVA CORE'}
                      </strong>
                      <span style={{ whiteSpace: 'pre-line', lineHeight: '1.6', textAlign: 'right', display: 'block' }}>{msg.text}</span>
                      {msg.url && (
                        <a href={msg.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '12px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem', transition: '0.2s', boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>نافذة خارجية مستقلة ↗</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* شريط المدخلات السيبراني المضيء */}
            <div style={{ width: '100%', display: 'flex', gap: '12px', background: '#04040c', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px 16px', borderRadius: '18px', alignItems: 'center', boxSizing: 'border-box', marginTop: '20px', boxShadow: robotState === 'thinking' ? '0 0 20px rgba(0,255,240,0.1)' : 'none', transition: 'all 0.3s ease' }}>
              {isListening ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px', height: '36px', flex: 1, justifyContent: 'flex-start' }}>
                  <div style={{ width: '3px', background: '#10b981', borderRadius: '3px', animation: 'voiceWavePulse 0.4s infinite ease-in-out' }} />
                  <div style={{ width: '3px', background: '#10b981', borderRadius: '3px', animation: 'voiceWavePulse 0.6s infinite ease-in-out', animationDelay: '0.1s' }} />
                  <div style={{ width: '3px', background: '#10b981', borderRadius: '3px', animation: 'voiceWavePulse 0.3s infinite ease-in-out', animationDelay: '0.2s' }} />
                  <div style={{ width: '3px', background: '#10b981', borderRadius: '3px', animation: 'voiceWavePulse 0.5s infinite ease-in-out', animationDelay: '0.15s' }} />
                </div>
              ) : (
                <input 
                  type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={robotState === 'thinking' ? "جاري تشغيل مصفوفة التوليد الخارقة..." : "اطلب بناء موقع إلكتروني حقيقي بالكامل..."}
                  disabled={robotState === 'thinking'}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem', fontFamily: 'inherit', textAlign: 'right' }}
                />
              )}

              <button onClick={toggleVoice} disabled={robotState === 'thinking'} style={{ background: 'transparent', color: isListening ? '#10b981' : '#4b5563', border: 'none', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: '0.2s' }}>
                🎙️
              </button>
              
              <button onClick={handleSendMessage} disabled={robotState === 'thinking' || !userInput.trim()} style={{ background: userInput.trim() ? '#ffffff' : '#111115', color: userInput.trim() ? '#000000' : '#444448', border: 'none', width: '42px', height: '42px', borderRadius: '12px', cursor: userInput.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', transition: 'all 0.3s' }}>
                {robotState === 'thinking' ? '⏳' : '←'}
              </button>
            </div>

            <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#222228', border: 'none', cursor: 'pointer', fontSize: '0.75rem', alignSelf: 'center', marginTop: '15px', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}>
              إنهاء وعزل الجلسة الحالية
            </button>
          </div>

          {/* الجانب الأيسر: شاشة المعاينة الفورية والحيّة للمواقع الحقيقية */}
          {generatedUrl && (
            <div style={{ flex: 1, height: '100%', background: '#000000', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(to right, #4f46e5, #00fff0)', zIndex: 100 }} />
              <div style={{ background: '#04040a', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#00fff0', letterSpacing: '1px', fontWeight: 'bold' }}>🖥️ لوحة المعاينة المعمارية والترجمة الحية</span>
                <button onClick={() => setGeneratedUrl(null)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ff3355', cursor: 'pointer', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', transition: '0.2s' }}>إغلاق الشاشة ✕</button>
              </div>
              <iframe src={generatedUrl} title="Nova Live Generation Container" style={{ width: '100%', flex: 1, border: 'none', background: '#ffffff' }} />
            </div>
          )}

        </div>
      )}

    </div>
  );
}