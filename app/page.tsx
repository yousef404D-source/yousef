'use client';

import { useState, useEffect, useRef } from 'react';

export default function NovaAI() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLockedScreenHidden, setIsLockedScreenHidden] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; hasButton?: boolean }>>([
    { sender: 'bot', text: 'أهلاً بك في منصة نوفا AI! أنا هنا لأقوم بتحويل أي فكرة تخطر ببالك إلى موقع إلكتروني حقيقي. يمكنك الكتابة أو الضغط على زر "فويس" للتحدث مباشرة بصوتك! 🛠️' }
  ]);
  const [robotState, setRobotState] = useState<'normal' | 'thinking' | 'listening'>('normal');
  const [isListening, setIsListening] = useState(false);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // إعداد ميزة التعرف على الصوت عند بدء التشغيل
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

  // نزول الشات لأسفل تلقائياً عند إضافة رسائل جديدة
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const checkPassword = () => {
    if (password === '1234') {
      setIsUnlocked(true);
      setTimeout(() => {
        setIsLockedScreenHidden(true);
      }, 600);
    } else {
      alert('❌ كلمة المرور غير صحيحة! جرب الكود التجريبي: 1234');
      setPassword('');
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim() === '') return;

    const currentText = userInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: currentText }]);
    setUserInput('');
    setRobotState('thinking');

    // محاكاة استجابة نوفا AI بعد ثانيتين
    setTimeout(() => {
      setRobotState('normal');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚙️ ذكاء نوفا المولد يحاكي فكرتك الآن:\nتم تحليل طلبك لبناء الموقع الخاص بـ: "${currentText}" بنجاح.\n\n[✓] جرى إنشاء الهيكل البنائي بنجاح (index.html)!\n[✓] جرى حقن التنسيقات المتجاوبة (style.css)!`,
          hasButton: true
        }
      ]);
    }, 2000);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('ميزة الفويس غير مدعومة في هذا المتصفح حالياً.');
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
    <div className="nova-wrapper" style={{ direction: 'rtl', fontFamily: 'Courier New, monospace, Arial' }}>
      <style jsx global>{`
        body { background-color: #f0f0f0; margin: 0; padding: 0; height: 100vh; display: flex; justify-content: center; align-items: center; color: #000; }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* 1. شاشة القفل */}
      {!isLockedScreenHidden && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#ffffff',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          transition: 'transform 0.6s cubic-bezier(0.77, 0, 0.175, 1)',
          transform: isUnlocked ? 'translateY(-100%)' : 'translateY(0)'
        }}>
          <div style={{ border: '3px solid #000', padding: '30px', background: '#fffdf0', boxShadow: '8px 8px 0px #000', textAlign: 'center', width: '90%', maxWidth: '360px', animation: 'bounceIn 0.6s ease', boxSizing: 'border-box' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.6rem' }}>🔒 نظام نوفا AI مُغلق</h2>
            <p>يرجى إدخال كلمة المرور لتفعيل بيئة بناء المواقع</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} placeholder="كلمة المرور الافتراضية 1234" style={{ width: '100%', padding: '12px', fontSize: '1.2rem', textAlign: 'center', border: '2px solid #000', marginTop: '15px', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
            <button onClick={checkPassword} style={{ marginTop: '20px', padding: '12px', fontSize: '1.1rem', background: '#00ff66', border: '2px solid #000', cursor: 'pointer', boxShadow: '4px 4px 0px #000', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}>تشغيل النظام 🚀</button>
          </div>
        </div>
      )}

      {/* 2. التطبيق الرئيسي */}
      <div style={{
        display: isUnlocked ? 'flex' : 'none', width: '95vw', maxWidth: '800px', border: '3px solid #000', background: '#fff', boxShadow: '10px 10px 0px #000', height: '85vh', flexDirection: 'column',
        opacity: isUnlocked ? 1 : 0, transform: isUnlocked ? 'scale(1)' : 'scale(0.9)', transition: 'opacity 0.4s ease, transform 0.4s ease'
      }}>
        <div style={{ background: '#00ffff', padding: '15px', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>نوفا AI 🤖 ✨</h2>
            <small>نظام تحويل الأفكار والنصوص إلى مواقع ويب حقيقية</small>
          </div>
          
          {/* الروبوت التفاعلي */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '10px' }}>
            <div style={{
              width: '50px', height: '45px', borderRadius: '10px', position: 'relative', transition: 'background-color 0.3s ease',
              backgroundColor: robotState === 'thinking' ? '#ff0055' : robotState === 'listening' ? '#0055ff' : '#000',
              animation: robotState === 'thinking' ? 'shake 0.15s infinite' : robotState === 'listening' ? 'pulse 0.5s infinite' : 'float 2.5s ease-in-out infinite'
            }}>
              {/* عيون الروبوت */}
              <div style={{
                position: 'absolute', top: '15px', left: '8px', width: '8px', height: '8px', borderRadius: '50%', animation: 'blink 4s infinite', transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                backgroundColor: robotState === 'thinking' ? '#fff' : robotState === 'listening' ? '#00ffff' : '#00ff66',
                boxShadow: robotState === 'thinking' ? '26px 0px 0px #fff' : robotState === 'listening' ? '26px 0px 0px #00ffff' : '26px 0px 0px #00ff66'
              }} />
              {/* الهوائي */}
              <div style={{ position: 'absolute', top: '-10px', left: '22px', width: '6px', height: '10px', backgroundColor: '#000' }} />
            </div>
          </div>
        </div>

        {/* صندوق رسائل الشات */}
        <div ref={chatBoxRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fafafa', borderBottom: '3px solid #000' }}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={{
              marginBottom: '15px', padding: '12px 18px', border: '2px solid #000', maxWidth: '75%', boxShadow: '4px 4px 0px #000', animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', fontSize: '1rem', wordWrap: 'break-word', whiteSpace: 'pre-line',
              background: msg.sender === 'user' ? '#fffdf0' : '#e6f7ff',
              float: msg.sender === 'user' ? 'right' : 'left',
              clear: 'both'
            }}>
              {msg.text}
              {msg.hasButton && (
                <div>
                  <button onClick={() => alert('جاري ضغط وتحميل ملفات موقعك...')} style={{ marginTop: '10px', background: '#00ffff', border: '2px solid #000', padding: '8px 12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 2px 0px #000', fontFamily: 'inherit' }}>تحميل مجلد الموقع الجاهز 📂</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* لوحة الإدخال */}
        <div style={{ padding: '15px', display: 'flex', gap: '10px', background: '#fff', alignItems: 'center' }}>
          <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="تكلم أو اكتب هنا، مثال: صمم لي صفحة هبوط لشركة مقاولات باللون الأزرق والأبيض..." style={{ flex: 1, height: '50px', border: '2px solid #000', padding: '12px', resize: 'none', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          <button onClick={toggleVoice} style={{ height: '50px', padding: '0 22px', fontWeight: 'bold', fontSize: '1rem', border: '2px solid #000', cursor: 'pointer', boxShadow: '3px 3px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s ease', background: isListening ? '#ff0055' : '#ffcc00', color: isListening ? '#fff' : '#000' }}>{isListening ? '🛑 إلغاء' : '🎙️ فويس'}</button>
          <button onClick={handleSendMessage} style={{ height: '50px', padding: '0 22px', fontWeight: 'bold', fontSize: '1rem', border: '2px solid #000', cursor: 'pointer', boxShadow: '3px 3px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s ease', background: '#00ff66' }}>إرسال ⚡</button>
        </div>
      </div>
    </div>
  );
}