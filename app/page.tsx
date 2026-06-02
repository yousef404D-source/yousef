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

  // نظام الـ Voice-to-Text الاحترافي
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

    setTimeout(() => {
      setRobotState('normal');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `🎯 Nova Quantum Engine Response:\nYour premium architecture for: "${currentText}" has been processed and compiled successfully.\n\n[✓] Generated hyper-responsive custom layouts.\n[✓] Embedded Cyber-Violet custom aesthetic elements.`,
          hasButton: true
        }
      ]);
    }, 2500);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice Module requires a premium modern browser connection.');
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
      background: 'radial-gradient(circle at center, #1a0f2e 0%, #05020c 100%)', 
      color: '#ffffff',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* مكتبة الأنميشن والـ Keyframes للروبوت الفضائي المطور (Orbital Core) والنيون البنفسجي */}
      <style>{`
        @keyframes corePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px #bd00ff, inset 0 0 15px #ff0077; }
          50% { transform: scale(1.08); box-shadow: 0 0 50px #ff0077, inset 0 0 25px #bd00ff; }
        }
        @keyframes orbitRotate {
          0% { transform: rotate(0deg); border-color: #bd00ff; }
          50% { border-color: #ff0077; transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg); border-color: #bd00ff; }
        }
        @keyframes listenEnergy {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px #00ffcc, inset 0 0 20px #00ffcc; border-color: #00ffcc; }
          50% { transform: scale(1.15); box-shadow: 0 0 65px #00ffcc, inset 0 0 35px #fff; border-color: #fff; }
        }
        @keyframes thinkMatrix {
          0% { transform: rotate(0deg) translateY(-5px); filter: hue-rotate(0deg); }
          50% { transform: rotate(180deg) translateY(5px); filter: hue-rotate(90deg); box-shadow: 0 0 60px #ff003c; }
          100% { transform: rotate(360deg) translateY(-5px); filter: hue-rotate(0deg); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      `}</style>

      {/* [1] شاشة الـ System Login بنفسجية نيون فخمة */}
      {!isLockedScreenHidden && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'radial-gradient(circle at center, #150b24 0%, #040108 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          transition: 'transform 0.7s cubic-bezier(0.86, 0, 0.07, 1)',
          transform: isUnlocked ? 'translateY(-100%)' : 'translateY(0)'
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.015)', 
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(189, 0, 255, 0.15)', 
            padding: '50px 40px', 
            borderRadius: '30px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 30px rgba(189, 0, 255, 0.1)', 
            textAlign: 'center', 
            width: '90%', 
            maxWidth: '440px',
            boxSizing: 'border-box'
          }}>
            {/* الروبوت الجديد المطور في شاشة القفل */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#090414',
              border: '2px dashed #bd00ff', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
              position: 'relative', animation: 'orbitRotate 6s infinite linear'
            }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff0077 0%, #bd00ff 100%)', boxShadow: '0 0 25px #ff0077', animation: 'corePulse 2s infinite ease-in-out' }} />
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '700', letterSpacing: '0.5px', background: 'linear-gradient(135deg, #fff 30%, #e0b0ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Login</h1>
            <p style={{ fontSize: '0.9rem', color: '#b39ddb', margin: '0 0 35px 0', fontWeight: '500' }}>Authenticate to access Nova AI Premium</p>
            
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
              placeholder="Enter Security Token" 
              style={{ width: '100%', padding: '16px 24px', fontSize: '1.05rem', color: '#fff', textAlign: 'center', border: '1px solid rgba(189,0,255,0.25)', borderRadius: '14px', outline: 'none', boxSizing: 'border-box', background: 'rgba(0,0,0,0.4)', transition: 'all 0.3s ease' }} 
              onFocus={(e) => {
                e.target.style.borderColor = '#ff0077';
                e.target.style.boxShadow = '0 0 15px rgba(255, 0, 119, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(189,0,255,0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <button onClick={checkPassword} style={{ marginTop: '25px', padding: '16px', fontSize: '1.05rem', background: 'linear-gradient(90deg, #bd00ff 0%, #ff0077 100%)', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', width: '100%', boxSizing: 'border-box', boxShadow: '0 6px 25px rgba(189, 0, 255, 0.35)', transition: 'all 0.2s ease' }}>
              Enter System
            </button>
          </div>
        </div>
      )}

      {/* [2] واجهة النظام الأساسية الفخمة باللون البنفسجي الساحر وروبوت الـ Core */}
      <div style={{
        display: isUnlocked ? 'flex' : 'none', width: '100%', height: '100%', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'center', padding: '50px 24px', boxSizing: 'border-box',
        opacity: isUnlocked ? 1 : 0, transform: isUnlocked ? 'scale(1)' : 'scale(0.97)', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
      }}>
        
        {/* الجسم المركزي للتطبيق */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* تصميم الروبوت المطور المذهل (Orbital Core): نواة طاقة عائمة مع حلقة خارجية دوارة */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: robotState === 'listening' ? '3px solid #00ffcc' : '2px dashed rgba(189, 0, 255, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '35px',
            transition: 'all 0.4s ease',
            animation: robotState === 'thinking' ? 'thinkMatrix 1s infinite linear' : robotState === 'listening' ? 'listenEnergy 0.5s infinite ease-in-out' : 'orbitRotate 10s infinite linear'
          }}>
            {/* النواة المضيئة الداخلية */}
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: robotState === 'listening' ? '#00ffcc' : 'linear-gradient(135deg, #ff0077 0%, #bd00ff 100%)', 
              boxShadow: robotState === 'thinking' ? '0 0 35px #ff003c' : robotState === 'listening' ? '0 0 30px #00ffcc' : '0 0 25px #bd00ff',
              animation: 'corePulse 2s infinite ease-in-out',
              transition: 'all 0.3s'
            }} />
            
            {/* قمر صناعي الكتروني صغير يدور حول النواة */}
            <div style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#fff',
              top: '5px',
              left: '5px',
              boxShadow: '0 0 10px #fff'
            }} />
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.8px', background: 'linear-gradient(135deg, #ffffff 30%, #f0caff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How can I help you today?</h1>
          <p style={{ fontSize: '1.05rem', color: '#b39ddb', margin: 0, fontWeight: '500', opacity: 0.9, letterSpacing: '0.3px' }}>Current Mode: <span style={{ color: '#ff0077', fontWeight: '700', textShadow: '0 0 12px rgba(255,0,119,0.4)' }}>Creating advanced websites</span></p>

          {/* مسار عرض الشات والعمليات البرمجية */}
          {chatMessages.length > 0 && (
            <div style={{ width: '90vw', maxWidth: '650px', maxHeight: '220px', overflowY: 'auto', marginTop: '30px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(189,0,255,0.1)', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)' }} ref={chatBoxRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ padding: '12px 5px', textAlign: msg.sender === 'user' ? 'right' : 'left', color: msg.sender === 'user' ? '#ff0077' : '#ffffff', fontSize: '0.98rem', borderBottom: '1px solid rgba(255,255,255,0.02)', animation: 'fadeIn 0.3s ease' }}>
                  <strong style={{ color: msg.sender === 'user' ? '#ff0077' : '#bd00ff' }}>{msg.sender === 'user' ? 'You: ' : 'Nova AI: '}</strong>
                  <span style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{msg.text}</span>
                  {msg.hasButton && (
                    <button onClick={() => alert('Downloading compiled structural assets...')} style={{ display: 'block', marginTop: '12px', background: 'linear-gradient(90deg, #ff0077 0%, #bd00ff 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 15px rgba(255,0,119,0.4)' }}>Download Application Zip 📂</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الكونسول السفلي الفخم للإرسال والتسجيل الفوري */}
        <div style={{
          width: '100%', maxWidth: '780px', display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(189, 0, 255, 0.15)', padding: '12px 18px', borderRadius: '20px', boxSizing: 'border-box',
          backdropFilter: 'blur(30px)', boxShadow: '0 15px 40px rgba(0,0,0,0.5), 0 0 20px rgba(189,0,255,0.05)', alignItems: 'center'
        }}>
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe the website you want to generate..." 
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1.05rem', padding: '8px 5px', fontFamily: 'inherit' }}
          />
          
          {/* المايك النيون المتغير لونه تلقائياً */}
          <button onClick={toggleVoice} style={{ background: isListening ? '#00ffcc' : 'rgba(255,255,255,0.03)', color: isListening ? '#000' : '#fff', border: 'none', width: '46px', height: '46px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', transition: 'all 0.3s ease', boxShadow: isListening ? '0 0 20px #00ffcc' : 'none' }}>
            🎙️
          </button>
          
          {/* زر التفعيل الفاخر باللون الزهري/البنفسجي */}
          <button onClick={handleSendMessage} style={{ background: 'linear-gradient(90deg, #bd00ff 0%, #ff0077 100%)', color: '#fff', border: 'none', padding: '0 28px', height: '46px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s ease', boxShadow: '0 5px 15px rgba(189, 0, 255, 0.35)' }}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}