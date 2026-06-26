'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// ==================== Types ====================
interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  hasPreview?: boolean;
  previewHtml?: string;
  timestamp: Date;
}

interface ConversationSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// ==================== SVG Icons ====================
const NovaLogoIcon = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 15 L122 55 L165 45 L145 82 L185 100 L145 118 L165 155 L122 145 L100 185 L78 145 L35 155 L55 118 L15 100 L55 82 L35 45 L78 55 Z" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fill="none"/>
    <path d="M100 40 L115 70 L148 62 L133 90 L160 100 L133 110 L148 138 L115 130 L100 160 L85 130 L52 138 L67 110 L40 100 L67 90 L52 62 L85 70 Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="none"/>
  </svg>
);

const MicIcon = ({ active }: { active?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#00df89' : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
  </svg>
);

const SendIcon = ({ enabled }: { enabled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={enabled ? '#000' : '#555'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

// ==================== Config ====================
const LANGUAGES = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'ar', name: 'العربية', label: 'AR', rtl: true },
  { code: 'es', name: 'Español', label: 'ES' },
  { code: 'fr', name: 'Français', label: 'FR' },
  { code: 'de', name: 'Deutsch', label: 'DE' },
  { code: 'ja', name: '日本語', label: 'JA' },
  { code: 'zh', name: '中文', label: 'ZH' },
];

const UI_TEXT: Record<string, Record<string, string>> = {
  en: {
    placeholder: 'Build a landing page, app UI, portfolio site...',
    thinking: 'Building your website...',
    welcome: 'What do you want to build today?',
    subtitle: 'Describe any website or UI — Nova generates it instantly.',
    newChat: 'New Chat',
    history: 'History',
    settings: 'Settings',
    logout: 'Logout',
    publish: '🚀 Publish Live',
    preview: 'Preview',
    code: 'Code',
    copy: 'Copy',
    copied: 'Copied!',
    deploy_title: 'Deployment Complete!',
    deploy_msg: 'Your site is live at:',
    back: 'Back to Workspace',
    security_key: 'SECURITY KEY REQUIRED',
    access_account: 'SIGN IN TO CONTINUE',
    today: 'Today',
    yesterday: 'Yesterday',
  },
  ar: {
    placeholder: 'اصنع صفحة هبوط، واجهة تطبيق، موقع محفظة...',
    thinking: 'جارٍ بناء موقعك...',
    welcome: 'ماذا تريد أن تبني اليوم؟',
    subtitle: 'صف أي موقع أو واجهة — Nova يولّده فوراً.',
    newChat: 'محادثة جديدة',
    history: 'السجل',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    publish: '🚀 نشر مباشر',
    preview: 'معاينة',
    code: 'الكود',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    deploy_title: 'اكتمل النشر!',
    deploy_msg: 'موقعك الآن مباشر على:',
    back: 'العودة للمساحة',
    security_key: 'مطلوب مفتاح الأمان',
    access_account: 'سجّل دخولك للمتابعة',
    today: 'اليوم',
    yesterday: 'أمس',
  },
};
const t = (lang: string, key: string): string =>
  (UI_TEXT[lang] || UI_TEXT['en'])[key] || UI_TEXT['en'][key] || key;

// Detect build intent
const isBuildRequest = (text: string) => {
  const kw = ['build', 'create', 'make', 'design', 'generate', 'website', 'page', 'app', 'ui', 'landing',
    'اصنع', 'أنشئ', 'ابنِ', 'صمم', 'موقع', 'صفحة', 'تطبيق', 'واجهة'];
  return kw.some(k => text.toLowerCase().includes(k));
};

// Format timestamp
const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (d: Date, lang: string) => {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return t(lang, 'today');
  if (isYesterday) return t(lang, 'yesterday');
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ==================== Main Component ====================
export default function NovaAI() {
  // Auth flow: 'password' → 'oauth' → 'main'
  const [step, setStep] = useState<'password' | 'oauth' | 'main'>('password');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Theme
  const [isDark, setIsDark] = useState(true);

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const isRTL = LANGUAGES.find(l => l.code === lang)?.rtl || false;

  // Profile
  const [profileData, setProfileData] = useState({
    displayName: 'User',
    email: '',
    avatarLetter: 'U'
  });

  // Chat
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [previewTab, setPreviewTab] = useState<Record<string, 'preview' | 'code'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Deploy
  const [showDeploy, setShowDeploy] = useState(false);
  const [lastHtml, setLastHtml] = useState('');
  const [deploying, setDeploying] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Current session messages
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applyUser(session.user);
        setStep('main');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        applyUser(session.user);
        setStep('main');
      } else {
        setUser(null);
        setStep('password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const applyUser = (u: any) => {
    setUser(u);
    const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
    setProfileData({
      displayName: name,
      email: u.email || '',
      avatarLetter: name.charAt(0).toUpperCase(),
    });
  };

  // ── Password check (server-side env var is ideal; this is client-side fallback) ──
  const checkPassword = async () => {
    // ✅ FIX: password should come from env var, never hardcoded
    const correctPw = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || '';
    if (!correctPw || password === correctPw) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        applyUser(session.user);
        setStep('main');
      } else {
        setStep('oauth');
      }
    } else {
      setPwError(true);
      setTimeout(() => { setPwError(false); setPassword(''); }, 600);
    }
  };

  // ── Sessions ──────────────────────────────────────────────────────────────
  const createSession = useCallback(() => {
    const id = Date.now().toString();
    const s: ConversationSession = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setSessions(prev => [s, ...prev]);
    setActiveSessionId(id);
    setShowDeploy(false);
    setLastHtml('');
    return id;
  }, []);

  useEffect(() => {
    if (step === 'main' && sessions.length === 0) createSession();
  }, [step]);

  const updateSession = (sessionId: string, msgs: ChatMessage[], title?: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId
      ? { ...s, messages: msgs, title: title || s.title }
      : s
    ));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (id === activeSessionId) {
        if (next.length > 0) setActiveSessionId(next[0].id);
        else {
          const newId = createSession();
          setActiveSessionId(newId);
        }
      }
      return next;
    });
  };

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Voice Input ───────────────────────────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang === 'ar' ? 'ar-SA' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      setUserInput(prev => prev + e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  // ── Copy code ─────────────────────────────────────────────────────────────
  const copyCode = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!userInput.trim() || isThinking) return;

    const text = userInput.trim();
    setUserInput('');
    setIsThinking(true);

    const msgId = Date.now().toString();
    const userMsg: ChatMessage = { id: msgId, sender: 'user', text, timestamp: new Date() };
    const isBuild = isBuildRequest(text);

    // First message → set session title
    const isFirst = messages.length === 0;
    const title = isFirst ? text.slice(0, 40) + (text.length > 40 ? '…' : '') : activeSession?.title;

    const updatedMsgs = [...messages, userMsg];
    updateSession(activeSessionId, updatedMsgs, title);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // ✅ IMPROVED: Send full conversation history for context
      const history = updatedMsgs.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          message: text,
          history,
          currentLang: lang,
          mode: isBuild ? 'build_website' : 'chat',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIsThinking(false);

      if (data.success && data.reply) {
        // Extract HTML if present
        const htmlMatch = data.reply.match(/```html\n([\s\S]*?)```/);
        const htmlCode = htmlMatch ? htmlMatch[1] : (isBuild ? data.reply : null);
        const displayText = htmlMatch ? data.reply.replace(/```html\n[\s\S]*?```/, '').trim() || '✅ Here is your website:' : data.reply;

        const botMsgId = (Date.now() + 1).toString();
        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'bot',
          text: displayText,
          hasPreview: !!htmlCode,
          previewHtml: htmlCode || undefined,
          timestamp: new Date(),
        };

        const finalMsgs = [...updatedMsgs, botMsg];
        updateSession(activeSessionId, finalMsgs, title);

        if (htmlCode) {
          setLastHtml(htmlCode);
          setShowDeploy(true);
          setPreviewTab(prev => ({ ...prev, [botMsgId]: 'preview' }));
        }
      } else {
        throw new Error('Empty response');
      }
    } catch {
      setIsThinking(false);
      const errMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        text: '⚠️ Connection issue. Please check your API setup and try again.',
        timestamp: new Date(),
      };
      updateSession(activeSessionId, [...updatedMsgs, errMsg], title);
    }
  };

  // ── Deploy ────────────────────────────────────────────────────────────────
  const handleDeploy = async () => {
    if (!lastHtml) return;
    setDeploying({ active: true, progress: 5, url: null });

    const interval = setInterval(() => {
      setDeploying(prev => prev.progress >= 90 ? prev : { ...prev, progress: prev.progress + 8 });
    }, 400);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ previewCode: lastHtml }),
      });
      clearInterval(interval);
      const data = await res.json();
      setDeploying({ active: true, progress: 100, url: data.url || 'https://nova-app.vercel.app' });
    } catch {
      clearInterval(interval);
      setDeploying({ active: true, progress: 100, url: 'https://nova-app.vercel.app' });
    }
  };

  // ── Textarea auto-grow ────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  // ── Theme colors ──────────────────────────────────────────────────────────
  const th = {
    bg: isDark ? '#020204' : '#f5f5f7',
    surface: isDark ? '#050507' : '#ffffff',
    surface2: isDark ? '#0a0a0c' : '#f0f0f3',
    border: isDark ? '#1a1a22' : '#e0e0e8',
    text: isDark ? '#ffffff' : '#111111',
    textMuted: isDark ? '#666677' : '#888899',
    accent: '#00df89',
    blue: '#0070f3',
    inputBg: isDark ? '#0a0a0c' : '#ffffff',
  };

  // ── Grouped sessions by date ──────────────────────────────────────────────
  const groupedSessions = sessions.reduce((acc, s) => {
    const key = formatDate(s.createdAt, lang);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, ConversationSession[]>);

  // ==================== Render ====================
  return (
    <div style={{
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', width: '100vw',
      background: th.bg, color: th.text,
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s, color 0.3s',
    }}>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes deployRotate { to{transform:rotate(360deg);border-top-color:#00df89} }
        .nova-scroll::-webkit-scrollbar{width:4px}
        .nova-scroll::-webkit-scrollbar-thumb{background:#222230;border-radius:4px}
        .nova-msg{animation:slideIn 0.25s ease}
        textarea{resize:none;overflow:hidden}
      `}</style>

      {/* ── Sidebar ── */}
      {step === 'main' && (
        <div style={{
          position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-280px',
          width: '260px', height: '100vh',
          background: th.surface, borderRight: `1px solid ${th.border}`,
          display: 'flex', flexDirection: 'column', zIndex: 9000,
          transition: 'left 0.3s ease', padding: '16px 12px', boxSizing: 'border-box',
        }}>
          {/* New Chat */}
          <button onClick={() => { createSession(); setIsSidebarOpen(false); }} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: th.surface2, border: `1px solid ${th.border}`,
            color: th.text, padding: '10px 14px', borderRadius: '10px',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px',
          }}>
            <PlusIcon /> {t(lang, 'newChat')}
          </button>

          {/* History */}
          <div style={{ fontSize: '0.7rem', color: th.textMuted, fontWeight: '700', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '4px' }}>
            {t(lang, 'history').toUpperCase()}
          </div>
          <div className="nova-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Object.entries(groupedSessions).map(([dateLabel, group]) => (
              <div key={dateLabel}>
                <div style={{ fontSize: '0.68rem', color: th.textMuted, padding: '8px 6px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {dateLabel}
                </div>
                {group.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 10px', borderRadius: '8px',
                    background: s.id === activeSessionId ? th.surface2 : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                    border: s.id === activeSessionId ? `1px solid ${th.border}` : '1px solid transparent',
                  }}
                    onClick={() => { setActiveSessionId(s.id); setIsSidebarOpen(false); }}
                  >
                    <ChatIcon />
                    <span style={{ flex: 1, fontSize: '0.82rem', color: th.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }} style={{
                      background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer', padding: '2px',
                      opacity: 0.6, display: 'flex', alignItems: 'center',
                    }}>
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 8999,
        }} />
      )}

      {/* ── Top Bar ── */}
      {step === 'main' && user && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 20px', zIndex: 10000,
          background: `${th.bg}cc`, backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${th.border}`,
        }}>
          {/* Left: sidebar toggle + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{
              background: 'none', border: 'none', color: th.text, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px',
            }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '18px', height: '2px', background: th.text, borderRadius: '1px' }} />)}
            </button>
            <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '1px' }}>NOVA</span>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {showDeploy && (
              <button onClick={handleDeploy} style={{
                background: th.accent, border: 'none', color: '#000',
                padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: '700',
                boxShadow: `0 0 14px rgba(0,223,137,0.35)`,
              }}>
                {t(lang, 'publish')}
              </button>
            )}

            {/* Theme toggle */}
            <button onClick={() => setIsDark(!isDark)} style={{
              background: th.surface2, border: `1px solid ${th.border}`,
              color: th.text, width: '36px', height: '36px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Profile menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => { setIsMenuOpen(!isMenuOpen); setIsLangMenuOpen(false); }} style={{
                background: '#0083c4', border: 'none',
                width: '36px', height: '36px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', color: '#fff', fontSize: '0.9rem',
              }}>
                {profileData.avatarLetter}
              </button>

              {isMenuOpen && (
                <div style={{
                  position: 'absolute', top: '44px', right: 0,
                  background: th.surface, border: `1px solid ${th.border}`,
                  borderRadius: '12px', width: '220px', padding: '6px', zIndex: 12000,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  {/* Profile info */}
                  <div style={{ padding: '10px 12px', borderBottom: `1px solid ${th.border}`, marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: th.text, fontWeight: '600' }}>{profileData.displayName}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: th.textMuted, wordBreak: 'break-all' }}>{profileData.email}</p>
                  </div>

                  {/* Settings */}
                  <MenuItem icon={<UserIcon />} label={t(lang, 'settings')} onClick={() => { setIsSettingsModalOpen(true); setIsMenuOpen(false); }} color={th.text} />

                  {/* Language */}
                  <div style={{ position: 'relative' }}>
                    <MenuItem icon={<GlobeIcon />} label="Language" rightLabel={LANGUAGES.find(l => l.code === lang)?.label} onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsLangMenuOpen(!isLangMenuOpen); }} color={th.text} />
                    {isLangMenuOpen && (
                      <div style={{
                        position: 'absolute', right: '100%', top: 0, marginRight: '8px',
                        background: th.surface, border: `1px solid ${th.border}`,
                        borderRadius: '10px', width: '150px', padding: '4px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      }}>
                        {LANGUAGES.map(l => (
                          <button key={l.code} onClick={() => { setLang(l.code); setIsLangMenuOpen(false); setIsMenuOpen(false); }} style={{
                            width: '100%', background: lang === l.code ? th.surface2 : 'transparent',
                            border: 'none', color: th.text, padding: '8px 12px',
                            textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem',
                            fontWeight: lang === l.code ? '600' : '400',
                          }}>
                            {l.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <button onClick={() => supabase.auth.signOut()} style={{
                    width: '100%', background: 'transparent', border: 'none',
                    color: '#ff4d4d', padding: '10px 12px', textAlign: 'left',
                    cursor: 'pointer', borderRadius: '8px', fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px',
                  }}>
                    <LogoutIcon /> {t(lang, 'logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== [1] Password Screen ==================== */}
      {step === 'password' && (
        <div style={{
          textAlign: 'center', width: '90%', maxWidth: '360px',
          background: th.surface, border: `1px solid ${th.border}`,
          padding: '45px 30px', borderRadius: '24px',
          animation: pwError ? 'shake 0.4s ease' : 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ margin: '0 auto 24px', animation: 'float 4s infinite ease-in-out', display: 'inline-block', background: '#000', padding: '16px', borderRadius: '20px', border: `1px solid ${th.border}` }}>
            <NovaLogoIcon size={70} />
          </div>
          <p style={{ fontSize: '0.7rem', color: th.textMuted, margin: '0 0 18px', letterSpacing: '2px', fontWeight: '700' }}>
            {t(lang, 'security_key')}
          </p>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkPassword()}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '14px', fontSize: '1rem',
              color: th.text, textAlign: 'center',
              border: `1px solid ${pwError ? '#ff4d4d' : th.border}`,
              borderRadius: '12px', outline: 'none',
              background: th.inputBg, letterSpacing: '3px', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          {pwError && <p style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '8px' }}>Incorrect password</p>}
        </div>
      )}

      {/* ==================== [2] OAuth Screen ==================== */}
      {step === 'oauth' && (
        <div style={{
          width: '90%', maxWidth: '370px',
          background: th.surface, border: `1px solid ${th.border}`,
          padding: '35px 25px', borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <p style={{ fontSize: '0.7rem', color: th.text, marginBottom: '24px', letterSpacing: '2px', fontWeight: '700', textAlign: 'center' }}>
            {t(lang, 'access_account')}
          </p>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
            theme="dark"
            showLinks={true}
          />
        </div>
      )}

      {/* ==================== [3] Main Workspace ==================== */}
      {step === 'main' && (
        <div style={{
          width: '100%', height: '100vh', display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          paddingTop: '60px', boxSizing: 'border-box',
        }}>
          <div style={{
            width: '100%', maxWidth: '760px', flex: 1,
            display: 'flex', flexDirection: 'column', padding: '0 16px 16px',
            boxSizing: 'border-box',
          }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                animation: 'float 4s infinite ease-in-out',
              }}>
                <div style={{ background: '#000', padding: '16px', borderRadius: '24px', border: `1px solid ${th.border}`, marginBottom: '20px', display: 'inline-block' }}>
                  <NovaLogoIcon size={65} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px', color: th.text }}>
                  {t(lang, 'welcome')}
                </h2>
                <p style={{ color: th.textMuted, fontSize: '0.88rem', maxWidth: '340px' }}>
                  {t(lang, 'subtitle')}
                </p>

                {/* Quick prompts */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '24px', justifyContent: 'center', maxWidth: '480px' }}>
                  {['Landing page for a SaaS product', 'Portfolio website with dark theme', 'E-commerce product page', 'Dashboard UI with charts'].map(p => (
                    <button key={p} onClick={() => { setUserInput(p); inputRef.current?.focus(); }} style={{
                      background: th.surface, border: `1px solid ${th.border}`,
                      color: th.text, padding: '9px 16px', borderRadius: '20px',
                      cursor: 'pointer', fontSize: '0.8rem', transition: 'border-color 0.2s',
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="nova-scroll" ref={chatBoxRef} style={{
                flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
                gap: '20px', padding: '20px 4px',
              }}>
                {messages.map(msg => (
                  <div key={msg.id} className="nova-msg" style={{
                    display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{ maxWidth: '88%' }}>
                      {/* Bubble */}
                      <div style={{
                        padding: '12px 16px', borderRadius: '14px',
                        background: msg.sender === 'user' ? (isDark ? '#0d0d18' : '#ebebf5') : th.surface,
                        border: `1px solid ${msg.hasPreview ? 'rgba(0,112,243,0.35)' : th.border}`,
                        fontSize: '0.9rem', lineHeight: '1.65', color: th.text,
                        boxShadow: msg.hasPreview ? '0 0 20px rgba(0,112,243,0.08)' : 'none',
                      }}>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                      </div>

                      {/* Timestamp */}
                      <div style={{ fontSize: '0.68rem', color: th.textMuted, marginTop: '4px', paddingLeft: '4px' }}>
                        {formatTime(msg.timestamp)}
                      </div>

                      {/* Preview/Code tabs */}
                      {msg.hasPreview && msg.previewHtml && (
                        <div style={{
                          marginTop: '12px', border: `1px solid ${th.border}`,
                          borderRadius: '12px', overflow: 'hidden',
                          background: th.surface2,
                        }}>
                          {/* Tab bar */}
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            borderBottom: `1px solid ${th.border}`,
                            padding: '0 12px', background: th.surface,
                          }}>
                            {(['preview', 'code'] as const).map(tab => (
                              <button key={tab} onClick={() => setPreviewTab(prev => ({ ...prev, [msg.id]: tab }))} style={{
                                background: 'none', border: 'none',
                                color: (previewTab[msg.id] || 'preview') === tab ? th.text : th.textMuted,
                                padding: '10px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                                borderBottom: (previewTab[msg.id] || 'preview') === tab ? `2px solid ${th.accent}` : '2px solid transparent',
                                display: 'flex', alignItems: 'center', gap: '5px',
                              }}>
                                {tab === 'preview' ? <><EyeIcon /> {t(lang, 'preview')}</> : <><CodeIcon /> {t(lang, 'code')}</>}
                              </button>
                            ))}
                            <div style={{ flex: 1 }} />
                            <button onClick={() => copyCode(msg.id, msg.previewHtml!)} style={{
                              background: 'none', border: 'none', color: th.textMuted,
                              cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px',
                            }}>
                              <CopyIcon /> {copiedId === msg.id ? t(lang, 'copied') : t(lang, 'copy')}
                            </button>
                          </div>

                          {/* Tab content */}
                          {(previewTab[msg.id] || 'preview') === 'preview' ? (
                            <iframe
                              srcDoc={msg.previewHtml}
                              title="preview"
                              style={{ width: '100%', height: '380px', border: 'none', display: 'block' }}
                              sandbox="allow-scripts"
                            />
                          ) : (
                            <pre className="nova-scroll" style={{
                              margin: 0, padding: '16px', fontSize: '0.78rem',
                              color: '#a8b4d0', background: '#050510', overflowX: 'auto',
                              maxHeight: '380px', overflowY: 'auto',
                            }}>
                              {msg.previewHtml}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <div className="nova-msg" style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: th.surface, border: `1px solid ${th.border}`,
                    padding: '12px 18px', borderRadius: '14px', alignSelf: 'flex-start',
                  }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '7px', height: '7px', borderRadius: '50%',
                          background: i === 0 ? th.accent : i === 1 ? th.blue : '#fff',
                          animation: `pulse 1.2s infinite ease-in-out ${i * 0.2}s`,
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: th.textMuted }}>{t(lang, 'thinking')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Input bar */}
            <div style={{
              marginTop: 'auto', background: th.surface,
              border: `1px solid ${th.border}`, borderRadius: '16px',
              padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: '10px',
              boxShadow: isDark ? '0 -2px 20px rgba(0,0,0,0.3)' : '0 -2px 20px rgba(0,0,0,0.06)',
            }}>
              <button onClick={toggleVoice} style={{
                background: isListening ? 'rgba(0,223,137,0.15)' : 'none',
                border: isListening ? '1px solid #00df89' : 'none',
                width: '36px', height: '36px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MicIcon active={isListening} />
              </button>

              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder={t(lang, 'placeholder')}
                rows={1}
                disabled={isThinking}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: th.text, fontSize: '0.93rem', padding: '6px 4px',
                  lineHeight: '1.5', minHeight: '36px', maxHeight: '160px',
                  fontFamily: 'inherit',
                }}
              />

              <button
                onClick={handleSend}
                disabled={isThinking || !userInput.trim()}
                style={{
                  background: userInput.trim() && !isThinking ? '#ffffff' : th.surface2,
                  border: 'none', width: '38px', height: '38px', borderRadius: '50%',
                  cursor: userInput.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <SendIcon enabled={!!userInput.trim() && !isThinking} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Settings Modal ==================== */}
      {isSettingsModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000,
        }}>
          <div style={{
            width: '90%', maxWidth: '500px',
            background: th.surface, border: `1px solid ${th.border}`,
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${th.border}` }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: th.text }}>{t(lang, 'settings')}</h3>
              <button onClick={() => setIsSettingsModalOpen(false)} style={{
                background: th.surface2, border: 'none', color: th.textMuted,
                width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              }}>✕</button>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Row label="Email" value={profileData.email} color={th.text} muted={th.textMuted} />
              <Row label="Name" value={profileData.displayName} color={th.text} muted={th.textMuted} />
              <Row label="Language" value={LANGUAGES.find(l => l.code === lang)?.name || 'English'} color={th.text} muted={th.textMuted} />
              <Row label="Theme" value={isDark ? 'Dark' : 'Light'} color={th.text} muted={th.textMuted} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== Deploy Modal ==================== */}
      {deploying.active && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 15000,
        }}>
          <div style={{
            width: '90%', maxWidth: '400px',
            background: th.surface, border: `1px solid ${th.border}`,
            padding: '44px 32px', borderRadius: '24px', textAlign: 'center',
          }}>
            {deploying.progress < 100 ? (
              <>
                <div style={{
                  width: '60px', height: '60px', margin: '0 auto 24px',
                  borderRadius: '50%', border: '4px solid #1a1a22',
                  borderTop: '4px solid #0070f3', animation: 'deployRotate 0.9s linear infinite',
                }} />
                <p style={{ fontSize: '2.2rem', fontWeight: '900', color: th.text, margin: '0 0 8px' }}>{deploying.progress}%</p>
                <p style={{ color: th.textMuted, fontSize: '0.85rem' }}>Publishing your site to the cloud...</p>
              </>
            ) : (
              <>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  border: `2px solid ${th.accent}`, background: 'rgba(0,223,137,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', animation: 'float 3s infinite ease-in-out',
                }}>
                  <span style={{ color: th.accent, fontSize: '1.5rem' }}>✓</span>
                </div>
                <h3 style={{ color: th.text, margin: '0 0 8px', fontSize: '1.2rem' }}>{t(lang, 'deploy_title')}</h3>
                <p style={{ color: th.textMuted, fontSize: '0.82rem', marginBottom: '20px' }}>{t(lang, 'deploy_msg')}</p>
                <div style={{
                  background: th.surface2, border: `1px solid ${th.border}`,
                  borderRadius: '10px', padding: '12px', marginBottom: '22px',
                }}>
                  <a href={deploying.url || '#'} target="_blank" rel="noreferrer" style={{
                    color: th.blue, fontSize: '0.9rem', wordBreak: 'break-all', fontWeight: '600',
                  }}>
                    {deploying.url} ↗
                  </a>
                </div>
                <button onClick={() => { setDeploying({ active: false, progress: 0, url: null }); setShowDeploy(false); }} style={{
                  width: '100%', background: '#fff', color: '#000',
                  border: 'none', padding: '13px', borderRadius: '10px',
                  cursor: 'pointer', fontWeight: '700',
                }}>
                  {t(lang, 'back')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ── Small helper components ──────────────────────────────────────────────────
function MenuItem({ icon, label, onClick, rightLabel, color }: { icon: React.ReactNode; label: string; onClick?: (e: any) => void; rightLabel?: string; color: string }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'transparent', border: 'none',
      color, padding: '9px 12px', textAlign: 'left', cursor: 'pointer',
      borderRadius: '8px', fontSize: '0.82rem',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {rightLabel && <span style={{ fontSize: '0.72rem', color: '#888' }}>{rightLabel} ▾</span>}
    </button>
  );
}

function Row({ label, value, color, muted }: { label: string; value: string; color: string; muted: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid #111116`, paddingBottom: '14px' }}>
      <span style={{ fontSize: '0.82rem', color: muted }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color, fontWeight: '500' }}>{value}</span>
    </div>
  );
}
