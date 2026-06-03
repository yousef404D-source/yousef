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

  // نظام الـ Voice-to-Text المتوافق مع الواجهة الاحترافية
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
          text: `🎯 Nova Obsidian Engine Response:\nYour premium architecture for: "${currentText}" has been compiled.\n\n[✓] Generated hyper-responsive minimal layouts.\n[✓] Applied premium monochrome asset styling.`,
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
      background: '#000000', 
      color: '#ffffff',
      margin: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* أنميشن وحركات المكعب الماتريكس الأسود والعيون البيضاء المتوهجة */}
      <style>{`
        @keyframes monolithFloat {
          0%, 100% { transform: translateY(0) rotateX(15deg) rotateY(15deg); box-shadow: 0 10px 30px rgba(255,255,255,0.05); }
          50% { transform: translateY(-10px) rotateX(20deg) rotateY(25deg); box-shadow: 0 20px 40px rgba(255,255,255,0.1); }
        }
        @keyframes monolithThink {
          0% { transform: scale(1) rotate(0deg); border-color: #ffffff; }
          25% { transform: scale(0.95) rotate(5deg); }
          75% { transform: scale(1.05) rotate(-5deg); box-shadow: 0 0 30px rgba(255,255,255,0.2); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes monolithListen {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,255,255,0.3); border-color: #ffffff; }
          50% { transform: scale(1.08); box-shadow: 0 0 60px rgba(255,255,255,0.5); border-color: #ffffff; }
        }
        @keyframes eyePulse {
          0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 15px #ffffff, 0 0 30px #ffffff; }
          50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 25px #ffffff, 0 0 50px #ffffff; }
        }
        @keyframes eyeThinking {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(0.2) scaleY(1.5); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      `}</style>

      {/* [1] شاشة الـ System Login باللون الأسود الفخم والغامض */}
      {!isLockedScreenHidden && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: '#000000',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          transition: 'transform 0.7s cubic-bezier(0.86, 0, 0.07, 1)',
          transform: isUnlocked ? 'translateY(-100%)' : 'translateY(0)'
        }}>
          <div style={{ 
            background: '#050505', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            padding: '50px 40px', 
            borderRadius: '24px',
            boxShadow: '0 30px 100px rgba(0,0,0,0.9)', 
            textAlign: 'center', 
            width: '90%', 
            maxWidth: '440px',
            boxSizing: 'border-box'
          }}>
            {/* الروبوت المكعب الأسود في شاشة القفل */}
            <div style={{
              width: '75px', height: '75px', background: '#0a0a0a',
              border: '2px solid rgba(255, 255, 255, 0.2)', margin: '0 auto 35px auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
              borderRadius: '16px', animation: 'monolithFloat 4s infinite ease-in-out', transformStyle: 'preserve-3d'
            }}>
              {/* العين البيضاء الحية */}
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff', animation: 'eyePulse 2s infinite ease-in-out' }} />
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#ffffff' }}>System Login</h1>
            <p style={{ fontSize: '0.9rem', color: '#666666', margin: '0 0 35px 0', fontWeight: '500', letterSpacing: '0.5px' }}>AUTHENTICATE TO ACCESS NOVA REPOSITORY</p>
            
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && checkPassword()} 
              placeholder="ENTER SECURITY TOKEN" 
              style={{ width: '100%', padding: '16px 24px', fontSize: '1rem', color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', background: '#0c0c0c', transition: 'all 0.3s ease', letterSpacing: '2px' }} 
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            
            <button onClick={checkPassword} style={{ marginTop: '25px', padding: '16px', fontSize: '1rem', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', width: '100%', boxSizing: 'border-box', transition: 'all 0.2s ease', letterSpacing: '0.5px' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              ACCESS SYSTEM
            </button>
          </div>
        </div>
      )}

      {/* [2] الواجهة الرئيسية كاملة السواد بأعلى مستويات الفخامة البصرية */}
      <div style={{
        display: isUnlocked ? 'flex' : 'none', width: '100%', height: '100%', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'center', padding: '50px 24px', boxSizing: 'border-box',
        opacity: isUnlocked ? 1 : 0, transform: isUnlocked ? 'scale(1)' : 'scale(0.98)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* الجسم المركزي للتطبيق */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* الروبوت المكعب الأسود المطور والذكي المتفاعل بالكامل */}
          <div style={{
            width: '90px',
            height: '90px',
            background: '#080808',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '35px',
            transition: 'all 0.4s ease',
            animation: robotState === 'thinking' ? 'monolithThink 0.6s infinite linear' : robotState === 'listening' ? 'monolithListen 0.5s infinite ease-in-out' : 'monolithFloat 4s infinite ease-in-out'
          }}>
            {/* العيون البيضاء الفائقة التوهج */}
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#ffffff', 
              boxShadow: '0 0 20px #ffffff, 0 0 40px #ffffff',
              animation: robotState === 'thinking' ? 'eyeThinking 0.3s infinite linear' : 'eyePulse 2s infinite ease-in-out',
              transition: 'all 0.3s'
            }} />
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px', color: '#ffffff' }}>How can I help you today?</h1>
          <p style={{ fontSize: '1rem', color: '#666666', margin: 0, fontWeight: '500', letterSpacing: '0.5px' }}>CURRENT MODE: <span style={{ color: '#ffffff', fontWeight: '700' }}>CREATING ADVANCED WEBSITES</span></p>

          {/* لوحة عرض المخرجات والدردشة باللون الأسود المتناسق */}
          {chatMessages.length > 0 && (
            <div style={{ width: '90vw', maxWidth: '650px', maxHeight: '220px', overflowY: 'auto', marginTop: '30px', background: '#050505', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.8)' }} ref={chatBoxRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ padding: '12px 5px', textAlign: msg.sender === 'user' ? 'right' : 'left', color: '#ffffff', fontSize: '0.98rem', borderBottom: '1px solid rgba(255,255,255,0.03)', animation: 'fadeIn 0.3s ease' }}>
                  <strong style={{ color: msg.sender === 'user' ? '#888888' : '#ffffff' }}>{msg.sender === 'user' ? 'You: ' : 'Nova AI: '}</strong>
                  <span style={{ whiteSpace: 'pre-line', lineHeight: '1.5', opacity: msg.sender === 'user' ? 0.8 : 1 }}>{msg.text}</span>
                  {msg.hasButton && (
                    <button onClick={() => alert('Downloading compiled structural assets...')} style={{ display: 'block', marginTop: '12px', background: '#ffffff', color: '#000000', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 15px rgba(255,255,255,0.1)', transition: '0.2s' }}>Download Application Zip 📂</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الكونسول السفلي الفخم الفائق البساطة (Ultra-Minimalist Input) */}
        <div style={{
          width: '100%', maxWidth: '780px', display: 'flex', gap: '15px', background: '#050505',
          border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 18px', borderRadius: '16px', boxSizing: 'border-box',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9)', alignItems: 'center'
        }}>
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe the website you want to generate..." 
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1.05rem', padding: '8px 5px', fontFamily: 'inherit' }}
          />
          
          {/* المايك الاحترافي أحادي اللون */}
          <button onClick={toggleVoice} style={{ background: isListening ? '#ffffff' : 'transparent', color: isListening ? '#000000' : '#ffffff', border: isListening ? 'none' : '1px solid rgba(255,255,255,0.1)', width: '46px', height: '46px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.3s ease' }}>
            🎙️
          </button>
          
          {/* زر التفعيل باللون الأبيض الصافي الفخم */}
          <button onClick={handleSendMessage} style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '0 28px', height: '46px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s ease' }}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}