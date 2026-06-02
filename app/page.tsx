'use client';

import { useState, useEffect, useRef } from 'react';

export default function NovaAI() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLockedScreenHidden, setIsLockedScreenHidden] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; hasButton?: boolean }>>([]);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // إعداد ميزة الـ Voice-to-Text الاحترافية المتكاملة مع النظام الذكي
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

  // نظام التحقق من الباسورد المحدث والآمن للمنصة الاحترافية
  const checkPassword = () => {
    if (password === 'yousefyousefbaker505') {
      setIsUnlocked(true);
      setTimeout(() => {
        setIsLockedScreenHidden(true);
      }, 600);
    } else {
      alert('🔒 Access Denied: Invalid Security Token!');
      setPassword('');
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim() === '') return;

    const currentText = userInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: currentText }]);
    setUserInput('');
    setRobotState('thinking');

    // محاكاة محرك الذكاء الاصطناعي المتقدم لإنشاء الأكواد والمواقع
    setTimeout(() => {
      setRobotState('normal');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `🎯 Nova Core Engine Response:\nYour enterprise-grade architecture for: "${currentText}" has been analyzed and successfully compiled.\n\n[✓] Deployed reactive component tree.\n[✓] Injected ultra-modern responsive design frameworks.`,
          hasButton: true
        }
      ]);
    }, 2500);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice Module requires a premium modern browser connection (Chrome/Safari).');
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw', 
      background: 'radial-gradient(circle at center, #161933 0%, #070812 100%)', 
      color: '#ffffff',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* مكتبة الأنميشن والتأثيرات النيون الضوئية المتقدمة (Glow & Pulse) */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(79, 172, 254, 0.4), inset 0 0 20px rgba(0, 242, 254, 0.5); border-color: #00f2fe; }
          50% { transform: scale(1.04); box-shadow: 0 0 50px rgba(0, 242, 254, 0.7), inset 0 0 30px rgba(79, 172, 254, 0.8); border-color: #4facfe; }
        }
        @keyframes listenGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 35px rgba(0, 255, 102, 0.5), inset 0 0 20px rgba(0, 255, 102, 0.4); border-color: #00ff66; }
          50% { transform: scale(1.1); box-shadow: 0 0 60px rgba(0, 255, 102, 0.8), inset 0 0 35px rgba(0, 255, 102, 0.6); border-color: #fff; }
        }
        @keyframes thinkGlow {
          0% { transform: rotate(0deg) scale(1); box-shadow: 0 0 40px #ff0055; border-color: #ff0055; }
          50% { transform: rotate(180deg) scale(0.96); box-shadow: 0 0 20px #ff0055; border-color: #ff3377; }
          100% { transform: rotate(360deg) scale(1); box-shadow: 0 0 40px #ff0055; border-color: #ff0055; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(25px); filter: blur(5px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      `}</style>

      {/* [1] شاشة الـ System Login الاحترافية الفخمة */}
      {!isLockedScreenHidden && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'radial-gradient(circle at center, #121426 0%, #05060d 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          transition: 'transform 0.7s cubic-bezier(0.86, 0, 0.07, 1)',
          transform: isUnlocked ? 'translateY(-100%)' : 'translateY(0)'
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            padding: '50px 40px', 
            borderRadius: '28px',
            boxShadow: '0 30px 70px rgba(0,0,0,0.6)', 
            textAlign: 'center', 
            width: '90%', 
            maxWidth: '440px',
            boxSizing: 'border-box'
          }}>
            {/* الروبوت النيوني الدائري في واجهة الدخول */}
            <div style={{
              width: '75px', height: '75px', borderRadius: '50%', background: '#0a0b14',
              border: '3px solid #4facfe', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
              animation: 'pulseGlow 3s infinite ease-in-out'
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 20px #ffffff' }} />
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '700', letterSpacing: '0.5px' }}>System Login</h1>
            <p style={{ fontSize: '0.9rem', color: '#7a8bc7', margin: '0 0 35px 0', fontWeight: '500' }}>Authenticate to access Nova AI Premium</p>
            
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
              placeholder="System Password" 
              style={{ width: '100%', padding: '16px 24px', fontSize: '1.05rem', color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', outline: 'none', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', transition: 'all 0.3s ease' }} 
              onFocus={(e) => {
                e.target.style.borderColor = '#00f2fe';
                e.target.style.boxShadow = '0 0 15px rgba(0, 242, 254, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <button onClick={checkPassword} style={{ marginTop: '25px', padding: '16px', fontSize: '1.05rem', background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', width: '100%', boxSizing: 'border-box', boxShadow: '0 6px 20px rgba(79, 172, 254, 0.4)', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              Enter System
            </button>
          </div>
        </div>
      )}

      {/* [2] واجهة النظام الأساسية المتطورة الفاخرة "How can I help you today?" */}
      <div style={{
        display: isUnlocked ? 'flex' : 'none', width: '100%', height: '100%', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'center', padding: '50px 24px', boxSizing: 'border-box',
        opacity: isUnlocked ? 1 : 0, transform: isUnlocked ? 'scale(1)' : 'scale(0.97)', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
      }}>
        
        {/* الجسم المركزي للتطبيق */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* محرك الروبوت الدائري الذكي - يتفاعل أنيميشنياً بالكامل حسب النشاط الحالي */}
          <div style={{
            width: '95px', height: '95px', borderRadius: '50%', background: '#070912',
            border: '4px solid',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            marginBottom: '35px',
            animation: robotState === 'thinking' ? 'thinkGlow 1.2s infinite linear' : robotState === 'listening' ? 'listenGlow 0.5s infinite ease-in-out' : 'pulseGlow 2.5s infinite ease-in-out'
          }}>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: '#ffffff', 
              boxShadow: robotState === 'thinking' ? '0 0 25px #ff0055' : robotState === 'listening' ? '0 0 25px #00ff66' : '0 0 25px #00f2fe' 
            }} />
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.8px', background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How can I help you today?</h1>
          <p style={{ fontSize: '1.05rem', color: '#7a8bc7', margin: 0, fontWeight: '500', opacity: 0.9, letterSpacing: '0.3px' }}>Current Mode: <span style={{ color: '#00f2fe', fontWeight: '700', textShadow: '0 0 10px rgba(0,242,254,0.3)' }}>Creating advanced websites</span></p>

          {/* مسار عرض الشات والعمليات البرمجية المتكامل الأناقة */}
          {chatMessages.length > 0 && (
            <div style={{ width: '90vw', maxWidth: '650px', maxHeight: '220px', overflowY: 'auto', marginTop: '30px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.2)' }} ref={chatBoxRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ padding: '12px 5px', textAlign: msg.sender === 'user' ? 'right' : 'left', color: msg.sender === 'user' ? '#00f2fe' : '#ffffff', fontSize: '0.98rem', borderBottom: '1px solid rgba(255,255,255,0.03)', animation: 'fadeIn 0.3s ease' }}>
                  <strong style={{ color: msg.sender === 'user' ? '#00f2fe' : '#4facfe' }}>{msg.sender === 'user' ? 'You: ' : 'Nova AI: '}</strong>
                  <span style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{msg.text}</span>
                  {msg.hasButton && (
                    <button onClick={() => alert('Downloading compiled structural assets...')} style={{ display: 'block', marginTop: '12px', background: 'linear-gradient(90deg, #00ff66 0%, #00aa44 100%)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(0,255,102,0.3)', transition: '0.2s' }}>Download Application Zip 📂</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الكونسول السفلي الفخم والألترا مودرن للإرسال والتسجيل الفوري */}
        <div style={{
          width: '100%', maxWidth: '780px', display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', padding: '12px 18px', borderRadius: '20px', boxSizing: 'border-box',
          backdropFilter: 'blur(30px)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', alignItems: 'center'
        }}>
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe the website you want to generate..." 
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1.05rem', padding: '8px 5px', fontFamily: 'inherit' }}
          />
          
          {/* وحدة التحكم الصوتي الرقمية النيون */}
          <button onClick={toggleVoice} style={{ background: isListening ? '#ff0055' : 'rgba(255,255,255,0.04)', color: '#fff', border: 'none', width: '46px', height: '46px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: isListening ? '0 0 20px #ff0055' : 'none' }}>
            🎙️
          </button>
          
          {/* زر المتابعة والإنشاء الفخم */}
          <button onClick={handleSendMessage} style={{ background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)', color: '#fff', border: 'none', padding: '0 28px', height: '46px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s ease', boxShadow: '0 5px 15px rgba(79, 172, 254, 0.3)' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}