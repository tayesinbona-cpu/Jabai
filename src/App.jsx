/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, RefreshCw, Trash2, Info, 
  Plus, MessageSquare, Menu, X, ChevronRight, Settings,
  History, Sparkles, MoreVertical, Copy, Check, 
  BookOpen, Zap, Heart, Globe, Moon, Sun,
  Image as ImageIcon, FileText, Video, Paperclip, Trash
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

// Utility for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'jabai_conversations_v4';

const SUGGESTED_PROMPTS = [
  { icon: <Zap size={18} />, text: "Akkaataa interneetiin maallaqa itti hojjannu naaf ibsi.", label: "Business" },
  { icon: <Globe size={18} />, text: "Teeknoolojii AI maal akka ta'e fi faayidaa isaa naaf ibsi.", label: "Tech" },
  { icon: <Zap size={18} />, text: "Akkaataa weebsaayitii salphaa itti hojjannu naaf ibsi.", label: "Tech" },
  { icon: <Globe size={18} />, text: "Daldala onlaayinii (E-commerce) akkamitti jalqabna?", label: "Business" },
];

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [theme, setTheme] = useState('light');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
      }
    };
    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('jabai_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    const hasSeenOnboarding = localStorage.getItem('jabai_onboarding_v2');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        } else {
          createNewChat();
        }
      } catch (e) {
        console.error("Failed to parse conversations", e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('jabai_onboarding_v2', 'true');
    setShowOnboarding(false);
  };

  const clearHistory = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'Haasawa Haaraa',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setConversations([newChat]);
    setActiveId(newChat.id);
    localStorage.removeItem(STORAGE_KEY);
    setIsSidebarOpen(false);
    setIsClearConfirmOpen(false);
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('jabai_theme', newTheme);
  };

  const onboardingSteps = [
    {
      title: "Baga Nagaan Dhufte!",
      desc: "Jabai botii haasawaa Afaan Oromoo isa jalqabaati. Teeknoolojii fi daldalaan si gargaaruuf qophaa'eera.",
      icon: <Bot size={40} className="text-emerald-500" />,
    },
    {
      title: "Maal irratti xiyyeeffanna?",
      desc: "Teeknoolojii, AI, Daldala Onlaayinii fi Pirogiraamiingii irratti gaaffii qabdu hunda nu gaafachuu dandeessu.",
      icon: <Zap size={40} className="text-amber-500" />,
    },
    {
      title: "Akkamitti tajaajilamtu?",
      desc: "Gaaffii kee barreessi ykn fakkeenya qophaa'an fayyadami. Haasawa haaraa jalqabuuf mallattoo '+' fayyadami.",
      icon: <MessageSquare size={40} className="text-stone-500" />,
    },
  ];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const activeChat = conversations.find(c => c.id === activeId);
  const isNewChat = !activeChat || activeChat.messages.length === 0;

  const createNewChat = () => {
    // Prevent creating multiple empty chats
    const emptyChat = conversations.find(c => c.messages.length === 0);
    if (emptyChat) {
      setActiveId(emptyChat.id);
      setIsSidebarOpen(false);
      return;
    }

    const newChat = {
      id: Date.now().toString(),
      title: 'Haasawa Haaraa',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveId(newChat.id);
    setIsSidebarOpen(false);
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result).split(',')[1];
      setSelectedFile({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textOverride) => {
    const messageText = textOverride || input;
    if (!messageText.trim() && !selectedFile) return;
    if (isLoading || !activeId) return;

    const userMessage = {
      role: 'user',
      content: messageText + (selectedFile ? `\n\n[Fayila: ${selectedFile.name}]` : ''),
      timestamp: new Date().toISOString(),
    };

    const fileToUpload = selectedFile;
    setSelectedFile(null);

    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        const isFirstMessage = c.messages.length === 0;
        return {
          ...c,
          title: isFirstMessage ? (messageText.length > 25 ? messageText.substring(0, 25) + '...' : (fileToUpload ? fileToUpload.name : messageText)) : c.title,
          messages: [...c.messages, userMessage],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const history = activeChat?.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) || [];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageText,
          history,
          fileToUpload: fileToUpload ? {
            data: fileToUpload.data,
            mimeType: fileToUpload.mimeType
          } : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from server');
      }

      const data = await response.json();
      const responseText = data.text;

      const botMessage = {
        role: 'bot',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: [...c.messages, botMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      }));
    } catch (error) {
      console.error("Error calling Gemini:", error);
      let errorMessageContent = "Dhiifama, rakkoon uumameera.";
      if (error?.message?.includes('429')) errorMessageContent = "Dhiifama, Jabai yeroo ammaa baay'ee hojii qaba.";
      
      const errorMessage = {
        role: 'bot',
        content: errorMessageContent,
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => prev.map(c => {
        if (c.id === activeId) return { ...c, messages: [...c.messages, errorMessage] };
        return c;
      }));
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={cn(
      "flex h-screen font-sans overflow-hidden transition-colors duration-300",
      theme === 'dark' ? "bg-[#0a0a0a] text-stone-100" : "bg-white text-stone-900"
    )}>
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8 text-center transition-colors duration-300",
                theme === 'dark' ? "bg-[#171717] text-white border border-stone-800" : "bg-white text-stone-900"
              )}
            >
              <div className="mb-8 flex justify-center">
                <motion.div
                  key={onboardingStep}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "p-6 rounded-[32px] transition-colors",
                    theme === 'dark' ? "bg-stone-900" : "bg-stone-50"
                  )}
                >
                  {onboardingSteps[onboardingStep].icon}
                </motion.div>
              </div>

              <h2 className={cn("text-2xl font-bold mb-4", theme === 'dark' ? "text-white" : "text-stone-800")}>
                {onboardingSteps[onboardingStep].title}
              </h2>
              <p className={cn("leading-relaxed mb-10", theme === 'dark' ? "text-stone-400" : "text-stone-500")}>
                {onboardingSteps[onboardingStep].desc}
              </p>

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1.5">
                  {onboardingSteps.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === onboardingStep 
                          ? (theme === 'dark' ? "w-6 bg-white" : "w-6 bg-stone-900") 
                          : (theme === 'dark' ? "w-1.5 bg-stone-800" : "w-1.5 bg-stone-200")
                      )}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    if (onboardingStep < onboardingSteps.length - 1) {
                      setOnboardingStep(prev => prev + 1);
                    } else {
                      completeOnboarding();
                    }
                  }}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-xl",
                    theme === 'dark' 
                      ? "bg-white text-black hover:bg-stone-200 shadow-white/5" 
                      : "bg-stone-900 text-white hover:bg-black shadow-stone-200"
                  )}
                >
                  {onboardingStep === onboardingSteps.length - 1 ? "Jalqabi" : "Itti fufi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border transition-colors duration-300",
                theme === 'dark' ? "bg-[#171717] border-stone-800 text-stone-100" : "bg-white border-stone-100 text-stone-900"
              )}
            >
              <div className={cn(
                "p-6 border-b flex items-center justify-between",
                theme === 'dark' ? "border-stone-800 bg-stone-900/20" : "border-stone-50 bg-white"
              )}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Settings size={18} className="text-stone-400" />
                  Qindaa'ina
                </h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    theme === 'dark' ? "hover:bg-stone-800" : "hover:bg-stone-50"
                  )}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <section>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Bifa (Theme)</h3>
                  <div className={cn(
                    "grid grid-cols-2 gap-3 p-1 rounded-2xl border",
                    theme === 'dark' ? "bg-stone-900/50 border-stone-800" : "bg-stone-50 border-stone-100"
                  )}>
                    <button
                      onClick={() => toggleTheme('light')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                        theme === 'light' 
                          ? "bg-white text-stone-900 shadow-sm" 
                          : "text-stone-400 hover:text-stone-200"
                      )}
                    >
                      <Sun size={16} />
                      Ifa
                    </button>
                    <button
                      onClick={() => toggleTheme('dark')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                        theme === 'dark' 
                          ? "bg-stone-800 text-white shadow-sm" 
                          : "text-stone-400 hover:text-stone-600"
                      )}
                    >
                      <Moon size={16} />
                      Dukkana
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Waa'ee Jabai</h3>
                  <div className={cn(
                    "rounded-2xl p-5 border transition-colors",
                    theme === 'dark' ? "bg-stone-900/50 border-stone-800" : "bg-stone-50/50 border-stone-100"
                  )}>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      theme === 'dark' ? "text-stone-400" : "text-stone-600"
                    )}>
                      Jabai botii haasawaa Afaan Oromoo isa jalqabaati. Teeknoolojii, AI, daldala onlaayinii fi pirogiraamiingii irratti si gargaaruuf kan qophaa'edha.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Misoomsaa</h3>
                  <div className={cn(
                    "flex items-center gap-4 rounded-2xl p-5 border transition-colors",
                    theme === 'dark' ? "bg-stone-900/50 border-stone-800" : "bg-stone-50/50 border-stone-100"
                  )}>
                    <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-stone-200">
                      GT
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-stone-900")}>Geda Taye</p>
                      <p className="text-xs text-stone-500">Full Stack Developer & AI Enthusiast</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Dandeettiiwwan</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { icon: <Zap size={14} />, title: "Saffisaa fi Sirrii", desc: "Deebii saffisaa fi qulqullina qabu." },
                      { icon: <History size={14} />, title: "Seenaa Haasawaa", desc: "Haasawa kee hunda ni kuusa." },
                      { icon: <Globe size={14} />, title: "Afaan Oromoo", desc: "Afaan Oromoo qulqulluu dubbata." },
                    ].map((feat, i) => (
                      <div key={i} className={cn(
                        "flex items-start gap-4 p-4 rounded-2xl transition-colors group",
                        theme === 'dark' ? "hover:bg-stone-800/50" : "hover:bg-stone-50"
                      )}>
                        <div className={cn(
                          "p-2.5 border text-stone-400 group-hover:text-emerald-500 group-hover:border-emerald-100 rounded-xl transition-all",
                          theme === 'dark' ? "bg-stone-900 border-stone-800" : "bg-white border-stone-100"
                        )}>
                          {feat.icon}
                        </div>
                        <div>
                          <p className={cn("text-sm font-bold", theme === 'dark' ? "text-stone-200" : "text-stone-800")}>{feat.title}</p>
                          <p className="text-xs text-stone-500">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className={cn(
                "p-6 border-t text-center",
                theme === 'dark' ? "bg-stone-900/50 border-stone-800" : "bg-stone-50/50 border-stone-100"
              )}>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Version 1.0.0 • Made with ❤️ for Oromia
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear History Confirmation Modal */}
      <AnimatePresence>
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8 text-center transition-colors duration-300",
                theme === 'dark' ? "bg-[#171717] text-white border border-stone-800" : "bg-white text-stone-900"
              )}
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-red-500/10 rounded-2xl text-red-500">
                  <Trash2 size={32} />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-3">Seenaa Haquu?</h2>
              <p className={cn("text-sm mb-8 leading-relaxed", theme === 'dark' ? "text-stone-400" : "text-stone-500")}>
                Seenaa haasawaa kee hunda haquu barbaadduu? Kun deebi'ee hin dhuftu.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsClearConfirmOpen(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-all active:scale-95",
                    theme === 'dark' ? "bg-stone-800 text-stone-300 hover:bg-stone-700" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  Dhiisi
                </button>
                <button 
                  onClick={clearHistory}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  Haqi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-[260px] z-50 transition-all duration-300 lg:relative lg:translate-x-0 flex flex-col",
        theme === 'dark' ? "bg-[#0d0d0d] text-stone-200 border-r border-stone-900" : "bg-[#171717] text-white",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-3 flex flex-col h-full">
          <button 
            onClick={createNewChat}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all text-sm font-medium mb-6",
              theme === 'dark' ? "hover:bg-white/5" : "hover:bg-white/10"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
              theme === 'dark' ? "bg-stone-800 text-white" : "bg-white/10 text-white"
            )}>
              <Plus size={16} />
            </div>
            Haasawa Haaraa
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
            <h2 className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Seenaa</h2>
            {conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveId(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all group relative",
                  activeId === chat.id 
                    ? (theme === 'dark' ? "bg-stone-800 text-white" : "bg-white/10 text-white") 
                    : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                )}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate text-left flex-1">{chat.title}</span>
                <Trash2 
                  size={14} 
                  className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 transition-all"
                  onClick={(e) => deleteConversation(chat.id, e)}
                />
              </button>
            ))}
          </div>

          <div className={cn(
            "pt-4 border-t mt-4 space-y-0.5",
            theme === 'dark' ? "border-stone-900" : "border-white/5"
          )}>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:bg-white/5 transition-all"
            >
              <Settings size={16} />
              Qindaa'ina
            </button>
            <div className={cn(
              "px-3 py-4 mt-2 flex items-center gap-3 rounded-2xl border transition-colors",
              theme === 'dark' ? "bg-stone-900/50 border-stone-800" : "bg-white/5 border-white/5"
            )}>
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
                <Bot size={18} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs font-bold truncate", theme === 'dark' ? "text-stone-200" : "text-white")}>Jabai</p>
                <p className="text-[10px] text-stone-500 truncate">Tech, AI & Code</p>
              </div>
            </div>
            <button 
              onClick={() => setIsClearConfirmOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all mt-2"
            >
              <Trash2 size={16} />
              Seenaa Haqi
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className={cn(
        "flex-1 flex flex-col relative min-w-0 transition-colors duration-300",
        theme === 'dark' ? "bg-[#0a0a0a]" : "bg-white"
      )}>
        {/* Header */}
        <header className={cn(
          "h-14 flex items-center justify-between px-4 sticky top-0 z-30 backdrop-blur-md transition-colors duration-300",
          theme === 'dark' ? "bg-[#0a0a0a]/80 border-b border-stone-800" : "bg-white/80 border-b border-stone-50"
        )}>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              theme === 'dark' ? "text-stone-400 hover:bg-stone-800" : "text-stone-500 hover:bg-stone-50"
            )}>
              <Menu size={20} />
            </button>
            <div className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg transition-colors cursor-default",
              theme === 'dark' ? "hover:bg-stone-800" : "hover:bg-stone-50"
            )}>
              <span className={cn("text-sm font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-stone-800")}>Jabai</span>
              <ChevronRight size={14} className="text-stone-300" />
              <span className="text-xs font-medium text-stone-400 truncate max-w-[120px]">
                {activeChat?.title || 'Haasawa Haaraa'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={createNewChat}
            className={cn(
              "p-2 rounded-xl transition-all",
              theme === 'dark' ? "text-stone-400 hover:text-white hover:bg-stone-800" : "text-stone-400 hover:text-stone-900 hover:bg-stone-50"
            )}
            title="Haasawa Haaraa"
          >
            <Plus size={20} />
          </button>
        </header>

        {/* Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
        >
          <AnimatePresence mode="wait">
            {isNewChat ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto"
              >
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-colors",
                    theme === 'dark' ? "bg-white text-black" : "bg-stone-900 text-white"
                  )}
                >
                  <Bot size={20} />
                </motion.div>
                <h1 className={cn("text-2xl font-bold tracking-tight mb-2", theme === 'dark' ? "text-white" : "text-black")}>Akkam, Jabai dha!</h1>
                <p className="text-sm text-stone-400 mb-10 max-w-xs">
                  Har'a teeknoolojii, AI, daldala onlaayinii fi pirogiraamiingii irratti maal si gargaaruu danda'a?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.text)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                        theme === 'dark' 
                          ? "border-stone-800 hover:border-stone-600 hover:bg-stone-900/50" 
                          : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-all",
                        theme === 'dark' ? "bg-stone-800 text-stone-400" : "bg-stone-50 text-stone-400",
                        "group-hover:text-stone-900 group-hover:bg-white"
                      )}>
                        {prompt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("block text-sm font-medium truncate", theme === 'dark' ? "text-white" : "text-black")}>{prompt.text}</span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">{prompt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {activeChat?.messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={cn(
                      "flex gap-4 sm:gap-6",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[80%]",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "prose prose-sm max-w-none break-words relative group transition-colors",
                        msg.role === 'user' 
                          ? (theme === 'dark' ? "bg-stone-800 text-white" : "bg-[#f4f4f4] text-black") + " px-5 py-3 rounded-[24px] rounded-tr-none" 
                          : (theme === 'dark' ? "text-white" : "text-black") + " leading-relaxed pt-1"
                      )}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        <div className={cn(
                          "flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all",
                          msg.role === 'user' ? "justify-end" : "justify-start"
                        )}>
                          <button 
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className={cn(
                              "p-1.5 rounded-lg transition-all",
                              theme === 'dark' ? "text-stone-500 hover:text-stone-300 hover:bg-stone-800" : "text-stone-300 hover:text-stone-600 hover:bg-stone-50"
                            )}
                            title="Copy"
                          >
                            {copiedId === idx ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                          {msg.role === 'bot' && (
                            <button className={cn(
                              "p-1.5 rounded-lg transition-all",
                              theme === 'dark' ? "text-stone-500 hover:text-stone-300 hover:bg-stone-800" : "text-stone-300 hover:text-stone-600 hover:bg-stone-50"
                            )} title="Regenerate">
                              <RefreshCw size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 sm:gap-6">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-1.5 py-3">
                      {[0, 1, 2].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} 
                          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} 
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-32" />
              </div>
            )}
          </AnimatePresence>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => scrollToBottom()}
                className={cn(
                  "fixed bottom-32 right-8 p-3 rounded-full shadow-2xl z-40 transition-all active:scale-90",
                  theme === 'dark' ? "bg-white text-black" : "bg-stone-900 text-white"
                )}
              >
                <ChevronRight size={20} className="rotate-90" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className={cn(
          "p-4 sm:p-6 transition-colors duration-300",
          theme === 'dark' ? "bg-[#0a0a0a]" : "bg-white"
        )}>
          <div className="max-w-3xl mx-auto relative">
            {selectedFile && (
              <div className={cn(
                "absolute bottom-full left-0 mb-4 p-3 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2",
                theme === 'dark' ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-100"
              )}>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  {selectedFile.mimeType.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-xs font-medium truncate max-w-[150px]", theme === 'dark' ? "text-white" : "text-black")}>{selectedFile.name}</p>
                  <p className="text-[10px] text-stone-500">Ready to send</p>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-red-500/10 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className={cn(
              "relative flex items-end gap-2 rounded-[28px] p-2 pl-2 transition-all shadow-sm",
              theme === 'dark' 
                ? "bg-stone-900 focus-within:bg-stone-800 focus-within:ring-1 focus-within:ring-stone-700" 
                : "bg-[#f4f4f4] focus-within:bg-white focus-within:ring-1 focus-within:ring-stone-200"
            )}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "p-3 rounded-full transition-all active:scale-90",
                  theme === 'dark' ? "text-stone-400 hover:text-white hover:bg-stone-800" : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                )}
                title="Upload file"
              >
                <Paperclip size={20} />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Jabai gaafadhu..."
                className={cn(
                  "flex-1 bg-transparent border-none py-3 text-[15px] focus:outline-none resize-none min-h-[48px] max-h-48 custom-scrollbar leading-relaxed",
                  theme === 'dark' ? "text-white" : "text-black"
                )}
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedFile) || isLoading}
                className={cn(
                  "p-2.5 rounded-full transition-all shrink-0 mb-0.5 mr-0.5",
                  (input.trim() || selectedFile) && !isLoading 
                    ? (theme === 'dark' ? "bg-white text-black hover:bg-stone-200" : "bg-stone-900 text-white hover:bg-black") + " active:scale-95" 
                    : (theme === 'dark' ? "bg-stone-800 text-stone-600" : "bg-stone-200 text-stone-400") + " cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-center text-stone-400 mt-3 font-medium">
              Jabai dogoggora uumuu danda'a. Odeeffannoo barbaachisaa ta'e mirkaneeffadhu.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
        .prose { color: inherit !important; max-width: none; }
        .prose * { color: inherit !important; }
        .prose a { text-decoration: underline; }
        .prose p { margin-bottom: 0.75rem; }
        .prose p:last-child { margin-bottom: 0; }
        .prose ul, .prose ol { margin-bottom: 0.75rem; padding-left: 1.25rem; }
        .prose li { margin-bottom: 0.25rem; }
        .prose pre { background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 1rem; }
      `}</style>
    </div>
  );
}
