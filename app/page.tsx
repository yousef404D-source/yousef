'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toPreviewUrl } from '@/lib/utils/preview';
import { detectPastedFile } from '@/lib/utils/file-detect';

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

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DesktopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const MobileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const ReloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
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
  const [deploying, setDeploying] = useState<{ active: boolean; stage: 'preparing' | 'building' | 'checking' | 'publishing' | 'verifying' | 'published'; url: string | null }>({ active: false, stage: 'preparing', url: null });

  const [editModeMessageId, setEditModeMessageId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ selector: string; tag: string; snippet: string; messageId: string } | null>(null);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const healedMessageIds = useRef<Set<string>>(new Set());

  const [attachments, setAttachments] = useState<{ id: string; filename: string; file_type: string; size_bytes: number }[]>([]);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [showSkillsPanel, setShowSkillsPanel] = useState(false);
  const [skills, setSkills] = useState<{ id: string; name: string; description: string; agents: string[]; enabled: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const [previewMode, setPreviewMode] = useState<Record<string, 'desktop' | 'mobile'>>({});
  const [previewReloadKey, setPreviewReloadKey] = useState<Record<string, number>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});

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

  // ── Skills ──
  const loadSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) setSkills(data.skills);
    } catch {
      // Non-critical — panel just stays empty/stale.
    }
  }, []);

  useEffect(() => { if (sessionReady) loadSkills(); }, [sessionReady, loadSkills]);

  const uploadSkillFile = async (file: File) => {
    const MAX_CLIENT_SKILL_SIZE = 200_000;
    if (file.size > MAX_CLIENT_SKILL_SIZE) {
      setErrorBanner(`"${file.name}" is too large for a Skill (max 200 KB).`);
      return;
    }
    const content = await file.text();
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content }),
      });
      const data = await res.json();
      if (data.success) setSkills(prev => [data.skill, ...prev]);
      else setErrorBanner(data.error || 'Could not upload the skill. Please try again.');
    } catch {
      setErrorBanner('Could not upload the skill. Please try again.');
    }
  };

  const toggleSkill = async (id: string, enabled: boolean) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
    try {
      await fetch(`/api/skills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch {
      // best-effort
    }
  };

  const deleteSkill = async (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    } catch {
      // best-effort
    }
  };

  // ── Attachments ──
  const loadAttachments = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/attachments?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.success) setAttachments(data.attachments);
    } catch {
      setAttachments([]);
    }
  }, []);

  const uploadAttachment = async (file: File) => {
    const MAX_CLIENT_FILE_SIZE = 300_000;
    if (file.size > MAX_CLIENT_FILE_SIZE) {
      setErrorBanner(`"${file.name}" is too large to attach (max 300 KB of text).`);
      return;
    }

    let conversationId = activeConversationId;
    setPendingFileName(file.name);
    try {
      if (!conversationId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: file.name }),
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error(createData.error);
        conversationId = createData.conversation.id;
        setActiveConversationId(conversationId);
        setHasEnteredChat(true);
        loadConversations();
      }

      const content = await file.text();
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, filename: file.name, fileType: file.type || 'text/plain', content }),
      });
      const data = await res.json();
      if (data.success) setAttachments(prev => [...prev, data.attachment]);
      else throw new Error(data.error);
    } catch (err) {
      setErrorBanner(err instanceof Error && err.message ? err.message : 'Could not attach the file. Please try again.');
    } finally {
      setPendingFileName(null);
    }
  };

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
    loadAttachments(activeConversationId);
    return () => { cancelled = true; };
  }, [activeConversationId, loadAttachments]);

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setShowDeploy(false);
    setIsSidebarOpen(false);
    setHasEnteredChat(false);
    setAttachments([]);
    setPreviewErrors({});
    setPreviewReloadKey({});
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
          setPreviewErrors(prev => ({ ...prev, [msgId]: data.message }));
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
        setPreviewErrors(prev => { const next = { ...prev }; delete next[messageId]; return next; });
        setPreviewReloadKey(prev => ({ ...prev, [messageId]: (prev[messageId] || 0) + 1 }));
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
    setDeploying({ active: true, stage: 'preparing', url: null });

    try {
      await new Promise(r => setTimeout(r, 300));
      setDeploying(prev => ({ ...prev, stage: 'building' }));
      await new Promise(r => setTimeout(r, 300));
      setDeploying(prev => ({ ...prev, stage: 'checking' }));

      setDeploying(prev => ({ ...prev, stage: 'publishing' }));
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: lastCode, conversationId: activeConversationId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Deployment failed');

      // The server already verified the URL is actually reachable before
      // returning success — see app/api/deploy/route.ts. This stage is
      // shown briefly for continuity with the rest of the animation.
      setDeploying(prev => ({ ...prev, stage: 'verifying' }));
      await new Promise(r => setTimeout(r, 400));

      setDeploying({ active: true, stage: 'published', url: data.url });
    } catch (err) {
      setDeploying({ active: false, stage: 'preparing', url: null });
      setErrorBanner(err instanceof Error ? err.message : 'Deployment failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  // Long-paste detection: if the user pastes what looks like a whole file
  // (code/config/log), turn it into an attachment instead of leaving it as
  // a giant wall of text in the input box.
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const detected = detectPastedFile(text);
    if (!detected) return;

    e.preventDefault();
    let conversationId = activeConversationId;
    try {
      if (!conversationId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: detected.suggestedFilename }),
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error();
        conversationId = createData.conversation.id;
        setActiveConversationId(conversationId);
        setHasEnteredChat(true);
        loadConversations();
      }
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, filename: detected.suggestedFilename, fileType: detected.language, content: text }),
      });
      const data = await res.json();
      if (data.success) setAttachments(prev => [...prev, data.attachment]);
    } catch {
      // If turning it into an attachment fails for any reason, fall back
      // to normal paste behavior so the user doesn't lose their text.
      setUserInput(prev => prev + text);
    }
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
                  onClick={() => { setActiveConversationId(c.id); setHasEnteredChat(true); setIsSidebarOpen(false); setAttachments([]); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '2px', background: th.surface3, borderRadius: '7px', padding: '2px' }}>
                            <button onClick={() => setPreviewMode(prev => ({ ...prev, [m.id]: 'desktop' }))} aria-label="Desktop preview" style={{
                              background: (previewMode[m.id] || 'desktop') === 'desktop' ? th.surface : 'none', border: 'none', borderRadius: '5px',
                              padding: '4px 7px', cursor: 'pointer', color: (previewMode[m.id] || 'desktop') === 'desktop' ? th.text : th.textFaint, display: 'flex',
                            }}>
                              <DesktopIcon />
                            </button>
                            <button onClick={() => setPreviewMode(prev => ({ ...prev, [m.id]: 'mobile' }))} aria-label="Mobile preview" style={{
                              background: previewMode[m.id] === 'mobile' ? th.surface : 'none', border: 'none', borderRadius: '5px',
                              padding: '4px 7px', cursor: 'pointer', color: previewMode[m.id] === 'mobile' ? th.text : th.textFaint, display: 'flex',
                            }}>
                              <MobileIcon />
                            </button>
                          </div>
                          <button onClick={() => { setPreviewReloadKey(prev => ({ ...prev, [m.id]: (prev[m.id] || 0) + 1 })); setPreviewErrors(prev => { const next = { ...prev }; delete next[m.id]; return next; }); }} aria-label="Reload preview" style={{
                            background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer', display: 'flex',
                          }}>
                            <ReloadIcon />
                          </button>
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
                      {previewErrors[m.id] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 13px', background: 'rgba(220,38,38,0.08)', borderBottom: `1px solid ${th.border}`, fontSize: '0.75rem', color: '#fca5a5' }}>
                          <span>⚠ Runtime error detected — Nova is fixing it automatically…</span>
                        </div>
                      )}
                      {m.previewUrl && (
                        <div style={{ display: 'flex', justifyContent: previewMode[m.id] === 'mobile' ? 'center' : 'stretch', background: previewMode[m.id] === 'mobile' ? '#000' : 'transparent', padding: previewMode[m.id] === 'mobile' ? '14px 0' : 0 }}>
                          <iframe
                            key={previewReloadKey[m.id] || 0}
                            ref={el => { iframeRefs.current[m.id] = el; }}
                            src={m.previewUrl}
                            style={{
                              width: previewMode[m.id] === 'mobile' ? '375px' : '100%',
                              height: previewMode[m.id] === 'mobile' ? '640px' : '380px',
                              border: previewMode[m.id] === 'mobile' ? `6px solid ${th.surface3}` : 'none',
                              borderRadius: previewMode[m.id] === 'mobile' ? '20px' : 0,
                              background: '#fff',
                              transition: 'width 0.2s ease, height 0.2s ease',
                            }}
                            sandbox="allow-scripts"
                          />
                        </div>
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

          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {attachments.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: th.surface2, border: `1px solid ${th.border}`,
                  borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', color: th.textMuted,
                }}>
                  <FileIcon />
                  <span style={{ color: th.text }}>{a.filename}</span>
                  <span>· {a.file_type}</span>
                  <span>· {(a.size_bytes / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
          {pendingFileName && (
            <div style={{ fontSize: '0.75rem', color: th.textMuted, marginBottom: '8px' }}>
              Attaching {pendingFileName}…
            </div>
          )}

          <div style={{
            maxWidth: showLanding ? '640px' : 'none', margin: showLanding ? '0 auto' : 0,
            background: th.surface2,
            border: `1px solid ${th.borderStrong}`, borderRadius: '18px',
            padding: '11px 12px', display: 'flex', alignItems: 'flex-end', gap: '10px',
            boxShadow: showLanding ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)' : '0 -2px 24px rgba(0,0,0,0.4)',
            position: 'relative',
          }}>
            <input
              ref={fileInputRef} type="file" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAttachment(f); e.target.value = ''; }}
            />
            <input
              ref={skillInputRef} type="file" accept=".md,.txt" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSkillFile(f); e.target.value = ''; }}
            />

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setShowAttachMenu(v => !v)} aria-label="Attach" style={{
                background: 'none', border: 'none', width: '34px', height: '34px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: th.text,
              }}>
                <PlusIcon />
              </button>
              {showAttachMenu && (
                <div style={{
                  position: 'absolute', bottom: '42px', left: 0,
                  background: th.surface2, border: `1px solid ${th.border}`, borderRadius: '10px',
                  padding: '6px', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 10,
                }}>
                  <button onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }} style={menuItemStyle(th)}>
                    <FileIcon /> Attach file
                  </button>
                  <button onClick={() => { setShowAttachMenu(false); skillInputRef.current?.click(); }} style={menuItemStyle(th)}>
                    <SparkIcon /> Add Skill (SKILL.md)
                  </button>
                  <button onClick={() => { setShowAttachMenu(false); setShowSkillsPanel(true); }} style={menuItemStyle(th)}>
                    <span style={{ width: 15, display: 'inline-block' }}>🧩</span> Manage Skills
                  </button>
                </div>
              )}
            </div>

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
              onPaste={handlePaste}
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
            {deploying.stage !== 'published' ? (
              <>
                <div style={{ width: '58px', height: '58px', margin: '0 auto 24px', borderRadius: '50%', border: `4px solid ${th.surface3}`, borderTop: `4px solid ${th.blue}`, animation: 'deployRotate 0.9s linear infinite' }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: th.text, margin: '0 0 16px' }}>
                  {{ preparing: 'Preparing…', building: 'Building…', checking: 'Checking…', publishing: 'Publishing…', verifying: 'Verifying…' }[deploying.stage]}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {(['preparing', 'building', 'checking', 'publishing', 'verifying'] as const).map(s => {
                    const order = ['preparing', 'building', 'checking', 'publishing', 'verifying'];
                    const done = order.indexOf(s) < order.indexOf(deploying.stage);
                    const active = s === deploying.stage;
                    return (
                      <div key={s} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: done || active ? th.blue : th.surface3,
                        transition: 'background 0.2s ease',
                      }} />
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', border: `2px solid ${th.blue}`, background: th.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <span style={{ color: th.blueBright, fontSize: '1.4rem' }}>✓</span>
                </div>
                <h3 style={{ color: th.text, margin: '0 0 8px', fontSize: '1.2rem' }}>Published — verified live</h3>
                <p style={{ color: th.textMuted, fontSize: '0.82rem', marginBottom: '20px' }}>Your site is live at:</p>
                <div style={{ background: th.surface2, border: `1px solid ${th.border}`, borderRadius: '10px', padding: '12px', marginBottom: '22px' }}>
                  <a href={deploying.url || '#'} target="_blank" rel="noreferrer" style={{ color: th.blueBright, fontSize: '0.9rem', wordBreak: 'break-all', fontWeight: 600 }}>
                    {deploying.url} ↗
                  </a>
                </div>
                <button onClick={() => setDeploying({ active: false, stage: 'preparing', url: null })} style={{
                  width: '100%', background: '#fff', color: '#000', border: 'none', padding: '13px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                }}>
                  Back to workspace
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Skills panel ── */}
      {showSkillsPanel && (
        <div onClick={() => setShowSkillsPanel(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 16000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', maxHeight: '70vh', background: th.surface, border: `1px solid ${th.border}`, borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: `1px solid ${th.border}` }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Skills</span>
              <button onClick={() => setShowSkillsPanel(false)} style={{ background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="nova-scroll" style={{ overflowY: 'auto', padding: '10px 14px' }}>
              {skills.length === 0 && (
                <p style={{ color: th.textMuted, fontSize: '0.82rem', padding: '20px 4px' }}>
                  No Skills installed yet. Use the + menu to add a SKILL.md file.
                </p>
              )}
              {skills.map(s => (
                <div key={s.id} style={{ padding: '10px 8px', borderBottom: `1px solid ${th.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: th.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🧩 {s.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: th.textMuted, marginTop: '2px' }}>{s.description}</div>
                      <div style={{ fontSize: '0.7rem', color: th.textFaint, marginTop: '4px' }}>{s.agents.join(' · ')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => toggleSkill(s.id, !s.enabled)} style={{
                        background: s.enabled ? th.blueSoft : th.surface3, border: `1px solid ${s.enabled ? th.blue : th.border}`,
                        color: s.enabled ? th.blueBright : th.textMuted, borderRadius: '6px', padding: '3px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600,
                      }}>
                        {s.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button onClick={() => deleteSkill(s.id)} style={{ background: 'none', border: 'none', color: th.textFaint, cursor: 'pointer' }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 14px', borderTop: `1px solid ${th.border}` }}>
              <button onClick={() => skillInputRef.current?.click()} style={{
                width: '100%', background: th.surface2, border: `1px solid ${th.border}`, color: th.text,
                padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}>
                + Add Skill (SKILL.md)
              </button>
            </div>
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

function menuItemStyle(th: any): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
    background: 'none', border: 'none', color: th.text, cursor: 'pointer',
    padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'left',
  };
}
