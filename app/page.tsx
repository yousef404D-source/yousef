'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toPreviewUrl } from '@/lib/utils/preview';

// ==================== Types ====================
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  codeBlock?: string;
  previewUrl?: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Design tokens ====================
// Black + white dominant, blue used only as an accent (user messages,
// primary actions, focus/active states) — see design brief.
const th = {
  bg: '#000000',
  surface: '#07070a',
  surface2: '#0f0f14',
  surface3: '#16161d',
  border: '#1e1e26',
  borderStrong: '#2a2a33',
  text: '#ffffff',
  textMuted: '#8b8b96',
  textFaint: '#55555f',
  blue: '#2563eb',
  blueBright: '#3b82f6',
  blueSoft: 'rgba(37,99,235,0.12)',
};

// ==================== Icons ====================
const MicIcon = ({ active }: { active?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? th.blueBright : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const SendIcon = ({ enabled }: { enabled: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={enabled ? '#fff' : '#5b5b66'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const SparkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={th.blueBright} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

// ==================== Helpers ====================
const formatDate = (d: Date) => {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const SUGGESTIONS = [
  'A modern gaming website with a dark neon theme',
  'A landing page for a coffee subscription brand',
  'A portfolio site for a photographer',
  'A SaaS pricing page with three tiers',
];

// ==================== Ambient background ====================
// A quiet, intentional field of drifting nodes — the one place motion is
// spent. Deliberately dim and slow so it reads as depth, not decoration.
function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0, raf = 0;
    let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setup = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = reduceMotion ? 0 : Math.min(60, Math.floor((width * height) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.3 + 0.5,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };

    setup();
    step();
    window.addEventListener('resize', setup);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setup);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

// ==================== Main ====================
export default function NovaAI() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  };

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Whether we've ever left the landing hero for this browser tab. Once
  // true we stay in "chat mode" even for a fresh/empty conversation — this
  // is what makes the landing → chat move a one-way transition instead of
  // something that flickers back every time messages is momentarily empty.
  const [hasEnteredChat, setHasEnteredChat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'planning' | 'building' | 'reviewing'>('idle');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [showDeploy, setShowDeploy] = useState(false);
  const [lastCode, setLastCode] = useState('');
  const [deploying, setDeploying] = useState<{ active: boolean; progress: number; url: string | null }>({ active: false, progress: 0, url: null });

  const [editModeMessageId, setEditModeMessageId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ selector: string; tag: string; snippet: string; messageId: string } | null>(null);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const healedMessageIds = useRef<Set<string>>(new Set());

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Session: sign in anonymously so there is no login screen at all.
  // This still creates a real, RLS-scoped Supabase user (auth.uid() is
  // real) — there is simply no account UI. Requires "Allow anonymous
  // sign-ins" enabled in Supabase → Authentication → Settings. This never
  // blocks the UI: the composer is interactive immediately, and only the
  // network calls that truly need a session (send, load history) wait on it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (!cancelled) setSessionReady(true);
          return;
        }
        const { data, error } = await supabase.auth.signInAnonymously();
        if (cancelled) return;
        if (error || !data.user) {
          setSessionError(
            'Could not start a session. Enable "Allow anonymous sign-ins" in Supabase → Authentication → Settings, then reload.'
          );
        }
        setSessionReady(true);
      } catch {
        if (!cancelled) {
          setSessionError('Could not connect to the server. Check your configuration and reload.');
          setSessionReady(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Load conversation list ──
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setConversations(
          data.conversations.map((c: any) => ({
            id: c.id, title: c.title, createdAt: new Date(c.created_at), updatedAt: new Date(c.updated_at),
          }))
        );
      }
    } catch {
      // Non-critical — history sidebar just stays empty/stale.
    }
  }, []);

  useEffect(() => { if (sessionReady) loadConversations(); }, [sessionReady, loadConversations]);

  // ── Load messages for the active conversation ──
  useEffect(() => {
    if (!activeConversationId) return;
    let cancelled = false;
    setLoadingMessages(true);
    fetch(`/api/conversations/${activeConversationId}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled || !data.success) return;
        const loaded = data.messages.map((m: any) => ({
          id: m.id, sender: m.sender, text: m.text,
          codeBlock: m.code_block || undefined, previewUrl: m.preview_url || undefined,
          createdAt: new Date(m.created_at),
        }));
        setMessages(loaded);
        const lastWithCode = [...loaded].reverse().find((m: ChatMessage) => m.codeBlock);
        if (lastWithCode) {
          setLastCode(lastWithCode.codeBlock!);
          setShowDeploy(true);
        } else {
          setShowDeploy(false);
        }
      })
      .finally(() => { if (!cancelled) setLoadingMessages(false); });
    return () => { cancelled = true; };
  }, [activeConversationId]);

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setShowDeploy(false);
    setIsSidebarOpen(false);
    setHasEnteredChat(false);
  };

  const deleteConversation = async (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (id === activeConversationId) startNewChat();
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    } catch {
      // best-effort
    }
  };

  // ── Scroll ──
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  // ── Voice input ──
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => { setUserInput(prev => prev + e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const copyCode = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Click-to-edit / self-heal: listen for messages from generated-site iframes ──
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'nova-element-selected' && editModeMessageId) {
        setSelectedElement({ selector: data.selector, tag: data.tag, snippet: data.snippet, messageId: editModeMessageId });
        iframeRefs.current[editModeMessageId]?.contentWindow?.postMessage({ type: 'nova-set-edit-mode', enabled: false }, '*');
        setEditModeMessageId(null);
      }

      if (data.type === 'nova-runtime-error') {
        const entry = Object.entries(iframeRefs.current).find(([, el]) => el?.contentWindow === e.source);
        if (entry) {
          const [msgId] = entry;
          if (!healedMessageIds.current.has(msgId)) {
            healedMessageIds.current.add(msgId);
            selfHeal(msgId, data.message);
          }
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModeMessageId, messages, activeConversationId]);

  const toggleEditMode = (messageId: string) => {
    const next = editModeMessageId === messageId ? null : messageId;
    if (editModeMessageId) {
      iframeRefs.current[editModeMessageId]?.contentWindow?.postMessage({ type: 'nova-set-edit-mode', enabled: false }, '*');
    }
    setEditModeMessageId(next);
    setSelectedElement(null);
    if (next) {
      iframeRefs.current[next]?.contentWindow?.postMessage({ type: 'nova-set-edit-mode', enabled: true }, '*');
    }
  };

  // ── Self-healing: silently ask Nova to fix a runtime error it detected ──
  const selfHeal = async (messageId: string, errorMessage: string) => {
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;
    const target = messages[idx];
    if (!target.codeBlock) return;

    const contextMessages = messages.slice(0, idx + 1).map(m => ({ sender: m.sender, text: m.text, codeBlock: m.codeBlock }));
    contextMessages.push({
      sender: 'user' as const,
      text: `The site produced this runtime error when loaded in the browser: "${errorMessage}". Find the cause and fix it. Return the complete corrected site.`,
      codeBlock: undefined,
    });

    try {
      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: contextMessages, conversationId: activeConversationId }),
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
      }

      const codeMatch = raw.match(/<<<NOVA_FINAL_CODE_START>>>\n([\s\S]*?)\n<<<NOVA_FINAL_CODE_END>>>/);
      const fixedCode = codeMatch ? codeMatch[1] : null;
      if (fixedCode) {
        const previewUrl = toPreviewUrl(fixedCode);
        setMessages(prev => prev.map(m => m.id === messageId
          ? { ...m, codeBlock: fixedCode, previewUrl, text: m.text + '\n\n✓ Nova detected and automatically fixed a runtime issue.' }
          : m
        ));
        setLastCode(fixedCode);
      }
    } catch (err) {
      console.error('self-heal failed', err);
    }
  };

  // ── Send message ──
  // CRITICAL PATH: everything visible — leaving the landing screen, showing
  // the user's message, showing "Thinking" — happens synchronously, before
  // any network request. Conversation creation and the AI call both run
  // afterward, asynchronously; the UI never waits on them.
  const handleSend = () => {
    const text = userInput.trim();
    if (!text || isThinking) return;

    setErrorBanner(null);
    const pointedElement = selectedElement;
    setUserInput('');
    setSelectedElement(null);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    // 1) Instant transition — no await before this point.
    if (!hasEnteredChat) {
      setIsTransitioning(true);
      setHasEnteredChat(true);
      window.setTimeout(() => setIsTransitioning(false), 420);
    }

    const userMsg: ChatMessage = { id: `local-${Date.now()}`, sender: 'user', text, createdAt: new Date() };
    const streamId = `local-${Date.now() + 1}`;

    // 2) User message + Thinking appear immediately.
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setPhase('planning');

    // 3) Everything that touches the network happens after the paint,
    // fully asynchronously — this function itself does not await anything.
    void runSend(text, userMsg, streamId, pointedElement);
  };

  const runSend = async (
    text: string,
    userMsg: ChatMessage,
    streamId: string,
    pointedElement: typeof selectedElement
  ) => {
    let conversationId = activeConversationId;

    try {
      // Kick off conversation creation and the AI request without letting
      // either block the other unnecessarily. We still need the real
      // conversationId before persistence on the server can happen, but the
      // user has already seen their message and the Thinking state.
      if (!conversationId) {
        const title = text.slice(0, 40) + (text.length > 40 ? '…' : '');
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        const createData = await createRes.json().catch(() => ({}));
        if (!createRes.ok || !createData.success) {
          throw new Error(createData.error || 'Could not start a new chat.');
        }
        conversationId = createData.conversation.id;
        setActiveConversationId(conversationId);
        setConversations(prev => [
          { id: conversationId!, title, createdAt: new Date(), updatedAt: new Date() },
          ...prev,
        ]);
      }

      const outgoingText = pointedElement
        ? `[User is pointing at this specific element in the current site — apply the requested change to it]\nSelector: ${pointedElement.selector}\nCurrent markup: ${pointedElement.snippet}\n\nRequested change: ${text}`
        : text;

      const historyForApi = [...messages, userMsg].map((m, i, arr) => ({
        sender: m.sender,
        text: i === arr.length - 1 ? outgoingText : m.text,
        codeBlock: m.codeBlock,
      }));

      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi, conversationId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      if (!res.body) throw new Error('No response from the server. Please try again.');

      setStreamingId(streamId);
      setMessages(prev => [...prev, { id: streamId, sender: 'assistant', text: '', createdAt: new Date() }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });

        const statusMatches = [...raw.matchAll(/<<<NOVA_STATUS:(\w+)>>>/g)];
        if (statusMatches.length) {
          setPhase(statusMatches[statusMatches.length - 1][1].toLowerCase() as any);
        }

        let display = raw.replace(/<<<NOVA_STATUS:\w+>>>/g, '');
        const finalStartIdx = display.indexOf('<<<NOVA_FINAL_CODE_START>>>');
        if (finalStartIdx !== -1) display = display.slice(0, finalStartIdx);
        setMessages(prev => prev.map(m => m.id === streamId ? { ...m, text: display } : m));
      }

      let textOnly = raw.replace(/<<<NOVA_STATUS:\w+>>>/g, '');
      const codeMatch = textOnly.match(/<<<NOVA_FINAL_CODE_START>>>\n([\s\S]*?)\n<<<NOVA_FINAL_CODE_END>>>/);
      let finalCode = codeMatch ? codeMatch[1] : '';
      const finalStartIdx2 = textOnly.indexOf('<<<NOVA_FINAL_CODE_START>>>');
      if (finalStartIdx2 !== -1) textOnly = textOnly.slice(0, finalStartIdx2);

      let cleanText = textOnly;
      if (!finalCode) {
        const oldMatch = textOnly.match(/```html([\s\S]*?)```/);
        if (oldMatch && oldMatch[1]) {
          finalCode = oldMatch[1].trim();
          cleanText = textOnly.replace(/```html([\s\S]*?)```/, '').trim();
        }
      } else {
        cleanText = textOnly.replace(/```html([\s\S]*?)```/, '').trim();
      }
      if (!cleanText) cleanText = finalCode ? 'Your site is ready — check the preview.' : textOnly;

      const previewUrl = finalCode ? toPreviewUrl(finalCode) : undefined;

      setMessages(prev => prev.map(m => m.id === streamId
        ? { ...m, text: cleanText, codeBlock: finalCode || undefined, previewUrl }
        : m
      ));
      setStreamingId(null);
      setIsThinking(false);
      setPhase('idle');

      if (finalCode) {
        setLastCode(finalCode);
        setShowDeploy(true);
      }

      loadConversations();
    } catch (err) {
      setIsThinking(false);
      setStreamingId(null);
      setPhase('idle');
      setErrorBanner(err instanceof Error ? err.message : 'Connection issue. Please try again.');
    }
  };

  const retryLast = () => {
    setErrorBanner(null);
    const lastUser = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUser) return;
    setIsThinking(true);
    setPhase('planning');
    const streamId = `local-${Date.now()}`;
    void runSend(lastUser.text, lastUser, streamId, null);
  };

  // ── Deploy ──
  const handleDeploy = async () => {
    if (!lastCode) return;
    setDeploying({ active: true, progress: 5, url: null });

    const interval = setInterval(() => {
      setDeploying(prev => prev.progress >= 90 ? prev : { ...prev, progress: prev.progress + 8 });
    }, 400);

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: lastCode, conversationId: activeConversationId }),
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok || !data.success) throw new Error(data.error || 'Deployment failed');
      setDeploying({ active: true, progress: 100, url: data.url });
    } catch (err) {
      clearInterval(interval);
      setDeploying({ active: false, progress: 0, url: null });
      setErrorBanner(err instanceof Error ? err.message : 'Deployment failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const groupedConversations = conversations.reduce((acc, c) => {
    const key = formatDate(c.updatedAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {} as Record<string, Conversation[]>);

  const showLanding = !hasEnteredChat && messages.length === 0;

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
      height: '100dvh', width: '100vw',
      background: th.bg, color: th.text,
      margin: 0, padding: 0, position: 'relative', overflow: 'hidden',
    }}>
      <AmbientField />
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.35;transform:scale(0.75)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-8px)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes deployRotate { to{transform:rotate(360deg);border-top-color:${th.blueBright}} }
        .nova-scroll::-webkit-scrollbar{width:5px}
        .nova-scroll::-webkit-scrollbar-thumb{background:${th.surface3};border-radius:4px}
        .nova-msg{animation:slideIn 0.28s ease}
        .nova-hero{animation:heroIn 0.5s cubic-bezier(0.16,1,0.3,1)}
        .nova-hero-exit{animation:fadeOut 0.32s ease forwards}
        textarea{resize:none;overflow:hidden}
        .nova-chip{transition:border-color 0.18s ease, color 0.18s ease, background 0.18s ease}
        .nova-chip:hover{border-color:${th.blue}66;color:#fff;background:${th.blueSoft}}
        .nova-send:not(:disabled):hover{background:${th.blueBright} !important}
        .nova-conv-row:hover{background:${th.surface2}}
        @media (prefers-reduced-motion: reduce){
          .nova-msg,.nova-hero,.nova-hero-exit{animation:none !important}
        }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{
        position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-272px',
        width: '260px', height: '100dvh',
        background: th.surface, borderRight: `1px solid ${th.border}`,
        display: 'flex', flexDirection: 'column', zIndex: 9000,
        transition: 'left 0.28s cubic-bezier(0.16,1,0.3,1)', padding: '16px 12px', boxSizing: 'border-box',
      }}>
        <button onClick={startNewChat} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: th.surface2, border: `1px solid ${th.border}`,
          color: th.text, padding: '10px 14px', borderRadius: '10px',
          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px',
        }}>
          <PlusIcon /> New chat
        </button>

        <div style={{ fontSize: '0.68rem', color: th.textFaint, fontWeight: 700, letterSpacing: '0.04em', marginBottom: '10px', paddingLeft: '4px' }}>
          HISTORY
        </div>
        <div className="nova-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Object.entries(groupedConversations).map(([dateLabel, group]) => (
            <div key={dateLabel}>
              <div style={{ fontSize: '0.68rem', color: th.textFaint, padding: '8px 6px 4px' }}>
                {dateLabel}
              </div>
              {group.map(c => (
                <div key={c.id} className="nova-conv-row" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 10px', borderRadius: '8px',
                  background: c.id === activeConversationId ? th.surface2 : 'transparent',
                  cursor: 'pointer',
                  border: c.id === activeConversationId ? `1px solid ${th.border}` : '1px solid transparent',
                }}
                  onClick={() => { setActiveConversationId(c.id); setHasEnteredChat(true); setIsSidebarOpen(false); }}
                >
                  <span style={{ color: th.textMuted, display: 'flex' }}><ChatIcon /></span>
                  <span style={{ flex: 1, fontSize: '0.82rem', color: th.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.title}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }} style={{
                    background: 'none', border: 'none', color: th.textFaint, cursor: 'pointer', padding: '2px',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '16px 8px', fontSize: '0.78rem', color: th.textFaint }}>
              No conversations yet.
            </div>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 8999 }} />
      )}

      {/* ── Top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '58px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 18px', zIndex: 10000,
        background: `${th.bg}cc`, backdropFilter: 'blur(14px)',
        borderBottom: showLanding ? '1px solid transparent' : `1px solid ${th.border}`,
        transition: 'border-color 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle history" style={{
            background: 'none', border: 'none', color: th.text, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px',
          }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: '17px', height: '2px', background: th.text, borderRadius: '1px' }} />)}
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.02rem', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            NOVA <span style={{ width: 5, height: 5, borderRadius: '50%', background: th.blueBright, boxShadow: `0 0 8px ${th.blueBright}` }} />
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {showDeploy && !showLanding && (
            <button onClick={handleDeploy} className="nova-send" style={{
              background: th.blue, border: 'none', color: '#fff',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 700,
              boxShadow: `0 0 16px ${th.blueSoft}`,
              transition: 'background 0.15s ease',
            }}>
              Publish live
            </button>
          )}
        </div>
      </div>

      {/* ── Landing hero (only before the first message of a fresh chat) ── */}
      {showLanding && (
        <div className={isTransitioning ? 'nova-hero-exit' : 'nova-hero'} style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 20px', textAlign: 'center', gap: '28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', border: `1px solid ${th.border}`, background: 'rgba(255,255,255,0.02)' }}>
            <SparkIcon />
            <span style={{ fontSize: '0.78rem', color: th.textMuted, fontWeight: 500 }}>Real websites, generated and edited live</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, margin: 0, lineHeight: 1.12, letterSpacing: '-0.02em', maxWidth: '760px' }}>
            What do you want to build today?
          </h1>
          <p style={{ color: th.textMuted, fontSize: '1rem', maxWidth: '480px', margin: 0, lineHeight: 1.6 }}>
            Describe a website. Nova writes the real code, shows you a live preview, and keeps refining it as you talk.
          </p>

          <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', pointerEvents: 'auto' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="nova-chip" onClick={() => { setUserInput(s); inputRef.current?.focus(); }} style={{
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}`, color: th.textMuted,
                padding: '8px 14px', borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat column ── */}
      <div style={{
        width: '100%', maxWidth: '760px', height: '100dvh',
        margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        paddingTop: '74px', paddingBottom: '22px', paddingInline: '20px',
        boxSizing: 'border-box', position: 'relative', zIndex: 1,
      }}>
        {sessionError && (
          <div style={{
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.28)',
            color: '#fca5a5', borderRadius: '10px', padding: '10px 14px',
            fontSize: '0.82rem', marginBottom: '12px',
          }}>
            {sessionError}
          </div>
        )}
        {errorBanner && (
          <div style={{
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.28)',
            color: '#fca5a5', borderRadius: '10px', padding: '10px 14px',
            fontSize: '0.82rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
          }}>
            <span>{errorBanner}</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={retryLast} style={{ background: 'none', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', cursor: 'pointer', borderRadius: '6px', padding: '4px 10px', fontSize: '0.76rem', fontWeight: 600 }}>
                Retry
              </button>
              <button onClick={() => setErrorBanner(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        )}

        {!showLanding && (
          loadingMessages ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: `3px solid ${th.surface3}`, borderTop: `3px solid ${th.blueBright}`, animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div ref={chatBoxRef} className="nova-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '16px' }}>
              {messages.map(m => (
                <div key={m.id} className="nova-msg" style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{
                    background: m.sender === 'user' ? th.blue : 'transparent',
                    color: m.sender === 'user' ? '#ffffff' : th.text,
                    borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : 0,
                    padding: m.sender === 'user' ? '11px 15px' : '0',
                    fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    boxShadow: m.sender === 'user' ? `0 4px 18px ${th.blueSoft}` : 'none',
                  }}>
                    {m.id === streamingId && !m.text ? (
                      <PhaseLabel phase={phase} muted={th.textMuted} />
                    ) : m.text}
                  </div>

                  {m.id === streamingId && m.text && phase === 'reviewing' && (
                    <div style={{ fontSize: '0.75rem', color: th.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: th.blueBright, animation: 'pulse 1s infinite ease-in-out' }} />
                      Reviewing the result…
                    </div>
                  )}

                  {m.codeBlock && (
                    <div style={{ border: `1px solid ${th.border}`, borderRadius: '14px', overflow: 'hidden', background: th.surface }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: th.surface2, borderBottom: `1px solid ${th.border}` }}>
                        <span style={{ fontSize: '0.74rem', color: th.textMuted, fontWeight: 600 }}>Generated site</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <button onClick={() => toggleEditMode(m.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem',
                            color: editModeMessageId === m.id ? th.blueBright : th.textMuted, fontWeight: editModeMessageId === m.id ? 700 : 500,
                          }}>
                            <SparkIcon /> {editModeMessageId === m.id ? 'Click an element…' : 'Point to edit'}
                          </button>
                          <button onClick={() => copyCode(m.id, m.codeBlock!)} style={{
                            background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem',
                          }}>
                            <CopyIcon /> {copiedId === m.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      {m.previewUrl && (
                        <iframe
                          ref={el => { iframeRefs.current[m.id] = el; }}
                          src={m.previewUrl}
                          style={{ width: '100%', height: '380px', border: 'none', background: '#fff' }}
                          sandbox="allow-scripts"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && !streamingId && (
                <div className="nova-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhaseLabel phase={phase} muted={th.textMuted} />
                </div>
              )}
            </div>
          )
        )}

        {/* ── Input bar ── */}
        <div style={{ marginTop: showLanding ? 0 : 'auto', position: showLanding ? 'absolute' : 'static', left: 0, right: 0, bottom: showLanding ? '14%' : 'auto', paddingInline: showLanding ? '20px' : 0, zIndex: 3 }}>
          {selectedElement && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
              background: th.blueSoft, border: `1px solid ${th.blue}55`,
              borderRadius: '10px', padding: '8px 12px', marginBottom: '8px', fontSize: '0.78rem',
            }}>
              <span style={{ color: th.blueBright, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SparkIcon /> Editing <code style={{ color: th.text }}>&lt;{selectedElement.tag}&gt;</code>
              </span>
              <button onClick={() => setSelectedElement(null)} style={{ background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer' }}>✕</button>
            </div>
          )}
          <div style={{
            maxWidth: showLanding ? '640px' : 'none', margin: showLanding ? '0 auto' : 0,
            background: th.surface2,
            border: `1px solid ${th.borderStrong}`, borderRadius: '18px',
            padding: '11px 12px', display: 'flex', alignItems: 'flex-end', gap: '10px',
            boxShadow: showLanding ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)' : '0 -2px 24px rgba(0,0,0,0.4)',
          }}>
            <button onClick={toggleVoice} aria-label="Voice input" style={{
              background: isListening ? th.blueSoft : 'none',
              border: isListening ? `1px solid ${th.blue}` : 'none',
              width: '34px', height: '34px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <MicIcon active={isListening} />
            </button>

            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Build a landing page, app UI, portfolio site..."
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: th.text, fontSize: '0.93rem', padding: '6px 4px',
                lineHeight: 1.5, minHeight: '34px', maxHeight: '160px',
                fontFamily: 'inherit',
              }}
            />

            <button
              onClick={handleSend}
              disabled={!userInput.trim()}
              className="nova-send"
              style={{
                background: userInput.trim() ? th.blue : th.surface3,
                border: 'none', width: '36px', height: '36px', borderRadius: '50%',
                cursor: userInput.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.15s ease',
              }}
            >
              <SendIcon enabled={!!userInput.trim()} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Deploy modal ── */}
      {deploying.active && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 15000 }}>
          <div style={{ width: '90%', maxWidth: '400px', background: th.surface, border: `1px solid ${th.border}`, padding: '44px 32px', borderRadius: '24px', textAlign: 'center' }}>
            {deploying.progress < 100 ? (
              <>
                <div style={{ width: '58px', height: '58px', margin: '0 auto 24px', borderRadius: '50%', border: `4px solid ${th.surface3}`, borderTop: `4px solid ${th.blue}`, animation: 'deployRotate 0.9s linear infinite' }} />
                <p style={{ fontSize: '2.1rem', fontWeight: 900, color: th.text, margin: '0 0 8px' }}>{deploying.progress}%</p>
                <p style={{ color: th.textMuted, fontSize: '0.85rem' }}>Publishing your site...</p>
              </>
            ) : (
              <>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', border: `2px solid ${th.blue}`, background: th.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <span style={{ color: th.blueBright, fontSize: '1.4rem' }}>✓</span>
                </div>
                <h3 style={{ color: th.text, margin: '0 0 8px', fontSize: '1.2rem' }}>Deployment complete</h3>
                <p style={{ color: th.textMuted, fontSize: '0.82rem', marginBottom: '20px' }}>Your site is live at:</p>
                <div style={{ background: th.surface2, border: `1px solid ${th.border}`, borderRadius: '10px', padding: '12px', marginBottom: '22px' }}>
                  <a href={deploying.url || '#'} target="_blank" rel="noreferrer" style={{ color: th.blueBright, fontSize: '0.9rem', wordBreak: 'break-all', fontWeight: 600 }}>
                    {deploying.url} ↗
                  </a>
                </div>
                <button onClick={() => setDeploying({ active: false, progress: 0, url: null })} style={{
                  width: '100%', background: '#fff', color: '#000', border: 'none', padding: '13px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                }}>
                  Back to workspace
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseLabel({ phase, muted }: { phase: string; muted: string }) {
  const labels: Record<string, string> = {
    planning: 'Planning the approach…',
    building: 'Building…',
    reviewing: 'Reviewing the result…',
    idle: 'Thinking…',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: th.blueBright,
            animation: `pulse 1.2s infinite ease-in-out ${i * 0.18}s`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.85rem', color: muted }}>{labels[phase] || labels.idle}</span>
    </div>
  );
}
