'use client';

import { useState, useEffect, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase'; // مسار مستقر ومضمون

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

  // مراقبة حالة تسجيل الدخول الحقيقية من Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStep('main'); 
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setRobotEyeColor('green');
        setTimeout(() => {
          setStep('main');
          setRobotEyeColor('white');
        }, 600);
      } else {
        setStep('password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          text: `⚡ SYSTEM COMPILER:\nDeployment complete for structural assets matching your prompt.\n\n[✓] Environment synchronized.`,
          hasButton: true
        }
      ]);
    }, 2000);
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
      direction: 'ltr', 
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
      
      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 30px rgba(255,255,255,0.03); }
          50% { transform: translateY(-6px); box-shadow: 0 0 45px rgba(255,255,255,0.1); }
        }
        @keyframes robotShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes pulseEye {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes rotateOuterRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes voiceWavePulse {
          0%, 100% { height: 6px; }
          50% { height: 26px; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        
        /* التحكم الكامل والتام بمظهر عناصر Supabase Auth باللون الأسود الفخم لتفادي مشاكل الـ Types */
        .supabase-auth-container {
          background: #030303 !important;
        }
        .supabase-auth-container button {
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          transition: 0.2s all !important;
          background-color: #ffffff !important;
          color: #000000 !important;
          border: none !important;
        }
        .supabase-auth-container button:hover {
          background-color: #eeeeee !important;
        }
        .supabase-auth-container input {
          border-radius: 12px !important;
          text-align: center !important;
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
          padding: 12px !important;
        }
        .supabase-auth-container label {
          color: #555555 !important;
          font-size: 0.8rem !important;
          letter-spacing: 1px !important;
          display: block;
          margin-bottom: 5px;
        }
        .supabase-auth-container a {
          color: #666666 !important;
          font-size: 0.8rem !important;
          text-decoration: none !important;
        }
        .supabase-auth-container a:hover {
          color: #999999 !important;
        }
      `}</style>

      {/* ==================== [1] شاشة القفل الفائقة البساطة ==================== */}
      {step === 'password' && (
        <div style={{ animation: 'fadeIn 0.4s ease', textAlign: 'center', width: '90%', maxWidth: '380px', background: '#030303', border: '1px solid rgba(255,255,255,0.04)', padding: '50px 35px', borderRadius: '24px' }}>
          
          <div style={{
            width: '85px', height: '85px', borderRadius: '50%', background: '#080808',
            border: `1px solid ${robotEyeColor === 'red' ? '#ff3333' : robotEyeColor === 'green' ? '#33cc66' : 'rgba(255,255,255,0.12)'}`,
            margin: '0 auto 35px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
            animation: robotIsShaking ? 'robotShake 0.15s infinite' : 'robotFloat 4s infinite ease-in-out', transition: 'all 0.2s'
          }}>
            <div style={{ position: 'absolute', width: '104%', height: '104%', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.15)', animation: 'rotateOuterRing 15s infinite linear' }} />
            <div style={{ 
              width: '20px', height: '20px', borderRadius: '50%', 
              background: robotEyeColor === 'red' ? '#ff3333' : robotEyeColor === 'green' ? '#33cc66' : '#ffffff', 
              boxShadow: `0 0 25px ${robotEyeColor === 'red' ? '#ff3333' : robotEyeColor === 'green' ? '#33cc66' : '#ffffff'}`,
              animation: 'pulseEye 1.5s infinite ease-in-out', transition: 'all 0.2s'
            }} />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#555555', margin: '0 0 25px 0', letterSpacing: '1.5px', fontWeight: '600' }}>ENTER SYSTEM TOKEN</p>
          
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
            placeholder="••••••••" 
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem', color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', outline: 'none', boxSizing: 'border-box', background: '#000000', transition: '0.3s', letterSpacing: '3px' }} 
          />
        </div>
      )}

      {/* ==================== [2] خطوة الـ Supabase Auth الحقيقية المعزولة والمضمونة ==================== */}
      {step === 'oauth' && (
        <div style={{ animation: 'fadeIn 0.4s ease', width: '90%', maxWidth: '380px', background: '#030303', border: '1px solid rgba(255,255,255,0.04)', padding: '40px 35px', borderRadius: '24px', boxSizing: 'border-box' }}>
          <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: '#080808', border: '1px solid rgba(255,255,255,0.1)', margin: '0 auto 25px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 20px #ffffff' }} />
          </div>
          
          <p style={{ fontSize: '0.85rem', color: '#555555', marginBottom: '25px', letterSpacing: '1.5px', fontWeight: '600', textAlign: 'center' }}>SIGN IN TO CONTINUE</p>
          
          <div className="supabase-auth-container">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'github']}
              theme="dark"
              view="sign_in"
              showLinks={true}
            />
          </div>
        </div>
      )}

      {/* ==================== [3] الواجهة الرئيسية البسيطة الفاخرة ==================== */}
      {step === 'main' && (
        <div style={{ animation: 'fadeIn 0.5s ease', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 24px', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0', textAlign: 'center', width: '100%' }}>
            
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', background: '#050505',
              border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '40px',
              animation: 'robotFloat 4s infinite ease-in-out'
            }}>
              <div style={{ position: 'absolute', width: '105%', height: '105%', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', animation: 'rotateOuterRing 25s infinite linear' }} />
              <div style={{ 
                width: '22px', height: '22px', borderRadius: '50%', background: '#ffffff', 
                boxShadow: robotState === 'thinking' ? '0 0 35px #ffffff' : '0 0 25px #ffffff',
                animation: 'pulseEye 1.2s infinite ease-in-out'
              }} />
            </div>

            {chatMessages.length > 0 && (
              <div style={{ width: '90vw', maxWidth: '650px', maxHeight: '250px', overflowY: 'auto', background: '#030303', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left', boxSizing: 'border-box', marginBottom: '20px' }} ref={chatBoxRef}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '0.95rem' }}>
                    <strong style={{ color: msg.sender === 'user' ? '#555' : '#fff', marginRight: '6px' }}>{msg.sender === 'user' ? 'YOU:' : 'SYSTEM:'}</strong>
                    <span style={{ whiteSpace: 'pre-line', lineHeight: '1.5', opacity: msg.sender === 'user' ? 0.75 : 1 }}>{msg.text}</span>
                    {msg.hasButton && (
                      <button onClick={() => alert('Downloading code repository...')} style={{ display: 'block', marginTop: '12px', background: '#ffffff', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Download ZIP</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '15px', background: '#030303', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px 16px', borderRadius: '16px', alignItems: 'center', boxSizing: 'border-box' }}>
            
            {isListening ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0 10px', height: '30px', flex: 1, justifyContent: 'flex-start' }}>
                <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'voiceWavePulse 0.4s infinite ease-in-out' }} />
                <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'voiceWavePulse 0.6s infinite ease-in-out', animationDelay: '0.1s' }} />
                <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'voiceWavePulse 0.3s infinite ease-in-out', animationDelay: '0.2s' }} />
                <div style={{ width: '3px', background: '#ffffff', borderRadius: '3px', animation: 'voiceWavePulse 0.5s infinite ease-in-out', animationDelay: '0.15s' }} />
              </div>
            ) : (
              <input 
                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything..." 
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            )}

            <button onClick={toggleVoice} style={{ background: 'transparent', color: isListening ? '#33cc66' : '#666666', border: 'none', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: '0.2s' }}>
              🎙️
            </button>
            
            <button onClick={handleSendMessage} style={{ background: '#ffffff', color: '#000000', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              ↗
            </button>
          </div>

          <button onClick={() => supabase.auth.signOut()} style={{ position: 'absolute', bottom: '15px', right: '20px', background: 'transparent', color: '#333', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
            Logout Session
          </button>

        </div>
      )}

    </div>
  );
}