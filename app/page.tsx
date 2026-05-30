"use client";

import React, { useState, useRef } from "react";
import { 
  Bot, 
  MessageSquare, 
  Wand2, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Send, 
  Lock, 
  Globe, 
  ArrowRight,
  RefreshCw
} from "lucide-react";

const QUESTIONNAIRE_STEPS = [
  {
    id: 1,
    title: "AI Processing Services",
    question: "Which provider would you like for AI video/image enhancement?",
    options: [
      { id: "fal", label: "fal.ai (specialized in image/video AI models)" },
      { id: "replicate", label: "Replicate (wide range of AI models)" },
      { id: "other", label: "Other service you prefer?", isCustom: true },
      { id: "something_else", label: "Something else", isCustom: true }
    ]
  },
  {
    id: 2,
    title: "Design & Theme Style",
    question: "What visual identity style best represents your brand layout?",
    options: [
      { id: "modern_neon", label: "Modern Dark Neon (Futuristic, Glow Elements)" },
      { id: "minimalist", label: "Clean Minimalist (Spacious, Elegant, Pastel)" },
      { id: "other_style", label: "Other service you prefer?", isCustom: true },
      { id: "something_else_style", label: "Something else", isCustom: true }
    ]
  },
  {
    id: 3,
    title: "Core Features",
    question: "Which primary functional components must be integrated?",
    options: [
      { id: "ecommerce", label: "E-commerce Shopping Cart & Product Grid" },
      { id: "auth_sys", label: "User Authentication & Dashboard Panel" },
      { id: "other_feat", label: "Other service you prefer?", isCustom: true },
      { id: "something_else_feat", label: "Something else", isCustom: true }
    ]
  }
];

export default function UltimateBuilderPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const SUPER_SECRET_PASSWORD = "112233445566778899100000011223344556677889910";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SUPER_SECRET_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("كلمة المرور غير صحيحة، تأكد من الرمز وحاول مجدداً.");
    }
  };

  const [activeMode, setActiveMode] = useState<"builder" | "chat">("builder"); 
  const [botStatus, setBotStatus] = useState<"idle" | "thinking" | "success">("idle"); 
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; image?: string }>>([
    { sender: "bot", text: "مرحباً بك في لوحة تحكم Nova AI. اكتب فكرتك وسأقوم بمعالجتها وبنائها وتحديث شاشة العرض فوراً." }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [previewCode, setPreviewCode] = useState<string>(
    `<html lang="ar" dir="rtl">
      <head><script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-[#0f1115] text-slate-400 flex flex-col items-center justify-center h-screen font-sans p-6 text-center">
        <div class="text-6xl mb-4">🖥️</div>
        <h2 class="text-xl font-bold text-white mb-2">شاشة المعاينة الحية جاهزة</h2>
        <p class="text-sm text-slate-500 max-w-sm">أرسل فكرة الموقع من صندوق المحادثة المطور للبدء في البناء التفاعلي المباشر.</p>
      </body>
    </html>`
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showWizard, setShowWizard] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [customTextInputs, setCustomTextInputs] = useState<Record<string, string>>({});

  const toggleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setBotStatus("thinking");
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage("قم ببناء منصة تجارة إلكترونية متطورة ومتكاملة");
        setBotStatus("idle");
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !uploadedImage) return;

    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: "user", text: userText, image: uploadedImage || undefined }]);
    setInputMessage("");
    setUploadedImage(null);

    if (activeMode === "builder") {
      setBotStatus("thinking");
      setTimeout(() => {
        setShowWizard(true);
        setCurrentStepIndex(0);
        setSelectedOptions({});
        setCustomTextInputs({});
        setBotStatus("idle");
      }, 600);
    } else {
      setBotStatus("thinking");
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: "bot", text: `تحليل ذكي لطلبك: استلمت فكرتك حول "${userText}". كيف ترغب في تخطيط الهيكل البرمجي الخاص بها؟` }]);
        setBotStatus("success");
      }, 1000);
    }
  };

  const handleCheckboxChange = (optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  };

  const handleAutoAnswer = () => {
    const currentStep = QUESTIONNAIRE_STEPS[currentStepIndex];
    const firstOption = currentStep.options[0].id;
    setSelectedOptions(prev => ({ ...prev, [firstOption]: true }));
    handleNextStep();
  };

  const handleNextStep = () => {
    if (currentStepIndex < QUESTIONNAIRE_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setShowWizard(false);
      setBotStatus("thinking");

      setTimeout(() => {
        const chatHistoryString = messages.map(m => m.text).join(" ").toLowerCase();
        let generatedHtml = "";

        if (chatHistoryString.includes("أكل") || chatHistoryString.includes("مطعم") || chatHistoryString.includes("food") || chatHistoryString.includes("commerce")) {
          generatedHtml = `
            <html>
              <head><script src="https://cdn.tailwindcss.com"></script></head>
              <body class="bg-[#0b0c10] text-slate-100 font-sans p-8">
                <div class="max-w-4xl mx-auto bg-[#1f2833] rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                  <h1 class="text-3xl font-black text-cyan-400 mb-2">Nova Cyber Store</h1>
                  <p class="text-sm text-slate-400 mb-6">تم توليد واجهة المتجر الإلكتروني بنجاح بناءً على الخيارات والمدخلات المخصصة بالاستبيان.</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-[#0b0c10] p-4 rounded-xl border border-slate-800">
                      <h3 class="font-bold text-white">منتجات الجيل القادم</h3>
                      <p class="text-xs text-slate-500 mt-1">أنظمة تفاعلية مدمجة كلياً.</p>
                    </div>
                    <div class="bg-[#0b0c10] p-4 rounded-xl border border-slate-800">
                      <h3 class="font-bold text-white">لوحة تحكم مستقرة</h3>
                      <p class="text-xs text-slate-500 mt-1">تتبع ذكي للمبيعات وحركة السيرفر الحية.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>`;
        } else {
          generatedHtml = `
            <html>
              <head><script src="https://cdn.tailwindcss.com"></script></head>
              <body class="bg-slate-950 text-slate-100 p-8 text-center h-screen flex flex-col justify-center items-center">
                <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">تم بناء تطبيقك المخصص</h1>
                <p class="text-sm text-slate-400 max-w-md">تم معالجة وضخ جميع البيانات والمواصفات التي حددتها في معالج الاستبيان بدقة وبدون أخطاء تكرارية.</p>
              </body>
            </html>`;
        }

        setPreviewCode(generatedHtml);
        setMessages(prev => [...prev, { sender: "bot", text: "🚀 اكتمل الاستبيان التفاعلي بنجاح! تم دمج الإجابات المخصصة وتحديث المعاينة الحية فوراً." }]);
        setBotStatus("success");
      }, 1500);
    }
  };

  const handleDeployProject = () => {
    setIsDeploying(true);
    setBotStatus("thinking");
    setTimeout(() => {
      setIsDeploying(false);
      setDeployUrl(`https://nova-deployed-app-${Math.floor(Math.random() * 90000) + 10000}.vercel.app`);
      setBotStatus("success");
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-[#12141c] border border-cyan-500/20 rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#0b0c10] border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-black text-white">NOVA LIVE WORKSPACE</h2>
            <p className="text-xs text-slate-500 mt-1">يرجى إدخال رمز الوصول لفتح المنظومة البرمجية</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="أدخل الباسورد الطويل المدمج..." 
              className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-cyan-400 transition-all"
            />
            {authError && <p className="text-red-400 text-[11px] text-center">{authError}</p>}
            <button type="submit" className="w-full bg-cyan-400 text-[#0b0c10] py-3 rounded-xl font-black text-xs hover:bg-cyan-300 transition-all flex items-center justify-center gap-2">
              دخول المنصة <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen min-h-screen bg-[#0a0b0d] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      <header className="h-14 border-b border-slate-900 bg-[#0d0e12]/90 backdrop-blur px-6 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
            botStatus === "thinking" ? "bg-purple-950/40 border-purple-500 animate-pulse" : botStatus === "success" ? "bg-emerald-950/40 border-emerald-500" : "bg-cyan-950/40 border-cyan-400"
          }`}>
            <Bot className={`w-4 h-4 ${botStatus === "thinking" ? "text-purple-400" : botStatus === "success" ? "text-emerald-400" : "text-cyan-400"}`} />
          </div>
          <div>
            <h1 className="font-black text-xs tracking-wider text-white">NOVA LIVE WORKSPACE</h1>
          </div>
        </div>

        <div className="flex bg-[#12141a] p-0.5 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveMode("builder")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeMode === "builder" ? "bg-cyan-400 text-[#0a0b0d]" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wand2 className="w-3 h-3" /> محرك البناء
          </button>
          <button 
            onClick={() => setActiveMode("chat")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeMode === "chat" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3 h-3" /> محادثة فائقة
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden w-full h-[calc(100vh-56px)]">
        
        {/* اليسار: المعاينة الحية */}
        <section className="w-1/2 h-full bg-[#0e1014] p-4 flex flex-col border-r border-slate-900/60 overflow-hidden">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> LIVE SANDBOX ENVIRONMENT
            </div>
            <div className="flex items-center gap-2">
              {deployUrl && (
                <a href={deployUrl} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-900 px-2.5 py-1 rounded-lg hover:underline">
                  رابط الموقع المباشر 🔗
                </a>
              )}
              <button 
                onClick={handleDeployProject}
                disabled={isDeploying}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-[#0b0c10] px-3 py-1.5 rounded-xl text-[10px] font-black hover:opacity-90 transition-all flex items-center gap-1"
              >
                {isDeploying ? <RefreshCw className="w-3 h-3 animate-spin" /> : "🚀 نشر / Deploy"}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl overflow-hidden flex items-center justify-center relative shadow-2xl">
            <iframe 
              srcDoc={previewCode}
              title="Sandbox Screen"
              className="h-full bg-white border-none w-full"
            />
          </div>
        </section>

        {/* اليمين: الشات والاستبيان */}
        <section className="w-1/2 h-full flex flex-col bg-[#0a0b0d] p-4 overflow-hidden justify-between">
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 custom-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end text-right" : "items-start text-left"}`}>
                  <div className={`max-w-[90%] rounded-2xl p-3 text-[11px] leading-relaxed shadow-md ${
                    msg.sender === "user" 
                      ? "bg-slate-800 text-slate-100 rounded-tr-none" 
                      : "bg-[#12151c] border border-slate-800 text-slate-300 rounded-tl-none"
                  }`}>
                    {msg.image && <img src={msg.image} alt="Sketch input" className="w-full max-h-24 object-cover rounded-xl mb-1.5 border border-slate-700" />}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}

              {showWizard && (
                <div className="bg-[#11141b] border border-cyan-500/20 rounded-2xl p-4 shadow-2xl my-2 text-left animate-fade-in">
                  <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
                    {QUESTIONNAIRE_STEPS[currentStepIndex].title}
                  </div>
                  <h3 className="text-[11px] font-bold text-slate-200 mb-3 leading-normal">
                    {QUESTIONNAIRE_STEPS[currentStepIndex].question}
                  </h3>

                  <div className="space-y-1.5 mb-4">
                    {QUESTIONNAIRE_STEPS[currentStepIndex].options.map((opt) => {
                      const isChecked = !!selectedOptions[opt.id];
                      return (
                        <div key={opt.id} className="flex flex-col">
                          <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked ? "bg-[#161b26] border-cyan-400 text-white" : "bg-[#141720] border-slate-800/80 text-slate-400 hover:bg-[#181c28]"
                          }`}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(opt.id)}
                              className="rounded border-slate-700 text-cyan-400 focus:ring-0 bg-[#0b0c10] w-3.5 h-3.5"
                            />
                            <span className="text-[11px]">{opt.label}</span>
                          </label>

                          {opt.isCustom && isChecked && (
                            <div className="mt-1.5 pl-2">
                              <textarea
                                value={customTextInputs[opt.id] || ""}
                                onChange={(e) => setCustomTextInputs(prev => ({ ...prev, [opt.id]: e.target.value }))}
                                placeholder="اكتب الخيار المخصص أو الذي يناسبك هنا بحرية..."
                                className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl p-2.5 text-[11px] text-white focus:outline-none focus:border-cyan-400 min-h-[50px] resize-none"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] text-slate-500 font-medium">
                      Question {currentStepIndex + 1} of {QUESTIONNAIRE_STEPS.length}
                    </span>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={handleAutoAnswer} className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-700">
                        Auto-answer
                      </button>
                      <button type="button" onClick={handleNextStep} className="bg-cyan-400 text-[#0a0b0d] text-[10px] font-black px-3.5 py-1.5 rounded-lg hover:bg-cyan-300">
                        {currentStepIndex === QUESTIONNAIRE_STEPS.length - 1 ? "Finish & Build" : "Next"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="bg-[#111317] border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-2 shrink-0 shadow-lg">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Build me a high performance store..."
              rows={2}
              className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-600 resize-none focus:outline-none"
            />
            
            <div className="flex justify-between items-center border-t border-slate-800/60 pt-2">
              <div className="flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-1.5 rounded-lg transition ${uploadedImage ? "bg-cyan-950 text-cyan-400" : "text-slate-500 hover:bg-slate-800"}`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                <button 
                  type="button" 
                  onClick={toggleVoiceRecording}
                  className={`p-1.5 rounded-lg transition ${isRecording ? "bg-red-950 text-red-400" : "text-slate-500 hover:bg-slate-800"}`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                {uploadedImage && <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded">Attached</span>}
              </div>

              <button type="submit" className="bg-slate-800 text-slate-300 p-1.5 rounded-lg hover:bg-cyan-400 hover:text-[#0b0c10] transition-all">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>

        </section>
      </div>
    </div>
  );
}