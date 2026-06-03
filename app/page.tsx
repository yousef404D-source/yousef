'use client';

import { useState, useEffect, useRef } from 'react';

export default function NovaAI() {
  // الحالات الأمنية والتحقق
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [robotEyeColor, setRobotEyeColor] = useState<'white' | 'red' | 'green'>('white');
  const [robotIsShaking, setRobotIsShaking] = useState(false);
  
  // حالات الشات والذكاء الاصطناعي
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; hasButton?: boolean }>>([]);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // فحص كلمة المرور مع تفاعل الروبوت بالألوان والاهتزاز
  const checkPassword = () => {
    if (password === 'yousefyousefbaker505') {
      setRobotEyeColor('green');
      setTimeout(() => {
        setStep('oauth'); // الانتقال لخطوة تسجيل جوجل / جيت هاب
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

  // محاكاة تسجيل الدخول الخارجي
  const handleOAuthLogin = (provider: 'Google' | 'GitHub') => {
    setRobotEyeColor('green');
    setTimeout(() => {
      setStep('main'); // الدخول للموقع الرئيسي مباشر
      setRobotEyeColor('white');
    }, 600);
  };

  // معالجة إرسال النصوص للذكاء الاصطناعي
  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const textToSend = userInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setUserInput('');
    setRobotState('thinking');

    setTimeout(() => {
      setRobotState('normal');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `🤖 استجابة النظام الذكي:\nتم استلام فكرتك وجاري معالجتها وبناء الملفات المخصصة لها بالكامل.\n\n[✓] تم توليد الكود الأساسي بنجاح وتجهيز بيئة التشغيل السحابية.`,
          hasButton: true
        }
      ]);
    }, 2000);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('ميزة الصوت تحتاج إلى متصفح يدعم الـ Speech Recognition مثل كروم.');
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
      direction: 'rtl', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw', 
      background: '#000000', 
      color: '#ffffff',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* أنميشن وحركات الروبوت الدائري واهتزاز الخطأ */}
      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 25px rgba(255,255,255,0.05); }
          50% { transform: translateY(-8px); box-shadow: 0 0 40px rgba(255,255,255,0.15); }
        }
        @keyframes robotShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes pulseEye {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes rotateRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* ==================== [1] مرحلة الباسورد الأولية ==================== */}
      {step === 'password' && (
        <div style={{ animation: 'fadeIn 0.4s ease', textAlign: 'center', width: '90%', maxWidth: '420px', background: '#050505', border: '1px solid rgba(255,255,255,0.05)', padding: '45px 35px', borderRadius: '24px', boxShadow: '0 25px 80px rgba(0,0,0,0.9)' }}>
          
          {/* الروبوت الدائري التفاعلي بالألوان والاهتزاز */}
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%', background: '#0d0d0d',
            border: `2px solid ${robotEyeColor === 'red' ? '#ff3333' : robotEyeColor === 'green' ? '#33cc66' : 'rgba(255,255,255,0.1)'}`,
            margin: '0 auto 30px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
            animation: robotIsShaking ? 'robotShake 0.2s infinite' : 'robotFloat 4s infinite ease-in-out', transition: 'all 0.3s'
          }}>
            <div style={{ position: 'absolute', width: '102%', height: '102%', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', animation: 'rotateRing 12s infinite linear' }} />
            <div style={{ 
              width: '22px', height: '22px', borderRadius: '50%', 
              background: robotEyeColor === 'red' ? '#ff3333' : robotEyeColor === 'green' ? '#33cc66' : '#ffffff', 
              boxShadow: `0 0 25px ${robotEyeColor === 'red' ? '#ff3333' : robotEyeColor === 'green' ? '#33cc66' : '#ffffff'}`,
              animation: 'pulseEye 1.5s infinite ease-in-out', transition: 'all 0.3s'
            }} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 5px 0' }}>نظام الحماية الذكي</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 30px 0', letterSpacing: '0.5px' }}>ENTER SYSTEM SECURITY TOKEN</p>
          
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="أدخل رمز المرور..." 
            style={{ width: '100%', padding: '15px', fontSize: '1rem', color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', background: '#0a0a0a', transition: '0.3s' }} 
          />
          <button onClick={checkPassword} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#ffffff', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>التحقق من الرمز ⚡</button>
        </div>
      )}

      {/* ==================== [2] مرحلة الـ OAuth (تسجيل الدخول من جوجل / جيت هاب) ==================== */}
      {step === 'oauth' && (
        <div style={{ animation: 'fadeIn 0.4s ease', textAlign: 'center', width: '90%', maxWidth: '420px', background: '#050505', border: '1px solid rgba(255,255,255,0.05)', padding: '45px 35px', borderRadius: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0d0d0d', border: '2px solid #33cc66', margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#33cc66', boxShadow: '0 0 20px #33cc66' }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 8px 0' }}>تأكيد الهوية الرقمية</h2>
          <p style={{ fontSize: '0.9rem', color: '#777', margin: '0 0 35px 0' }}>الرجاء اختيار وسيلة تسجيل الدخول المعتمدة للمنصة</p>
          
          <button onClick={() => handleOAuthLogin('Google')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', marginBottom: '12px', transition: '0.3s' }}>
            <span>Sign in with Google</span> 🌐
          </button>
          
          <button onClick={() => handleOAuthLogin('GitHub')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: '0.3s' }}>
            <span>Sign in with GitHub</span> 🐙
          </button>
        </div>
      )}

      {/* ==================== [3] الواجهة الرئيسية البسيطة الفاخرة ==================== */}
      {step === 'main' && (
        <div style={{ animation: 'fadeIn 0.5s ease', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '