'use client';

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat-message";
import { Send, MessageSquare, Plus, Settings, LogOut } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

// 初期チャット
const initialChat: Chat = {
  id: "1",
  title: "新しいチャット",
  messages: [
    {
      role: "assistant",
      content: "こんにちは！お手伝いできることがあれば、お気軽にお尋ねください。"
    }
  ]
};

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([initialChat]);
  const [currentChatId, setCurrentChatId] = useState<string>(initialChat.id);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 現在のチャットを取得
  const currentChat = chats.find(chat => chat.id === currentChatId) || initialChat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // ユーザーメッセージを追加
    const userMessage: Message = { role: "user", content: input };
    
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );
    
    setInput("");
    setIsLoading(true);
    
    // AIレスポンスをシミュレート
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: `あなたのメッセージ「${input}」を受け取りました。実際のAIはここで回答を生成します。`
      };
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChatId 
            ? { 
                ...chat, 
                // タイトルが初期値の場合、最初のユーザー入力を基にタイトルを更新
                title: chat.title === "新しいチャット" ? input.slice(0, 20) + (input.length > 20 ? "..." : "") : chat.title,
                messages: [...chat.messages, aiMessage] 
              }
            : chat
        )
      );
      
      setIsLoading(false);
    }, 1000);
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "新しいチャット",
      messages: [
        {
          role: "assistant",
          content: "こんにちは！お手伝いできることがあれば、お気軽にお尋ねください。"
        }
      ]
    };
    
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* サイドバー */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-[#111827] text-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
        {/* 新規チャットボタン */}
        <div className="p-3">
          <button 
            onClick={createNewChat}
            className="flex items-center gap-2 w-full p-3 rounded border border-[#374151] hover:bg-[#1f2937] transition"
          >
            <Plus size={16} />
            <span>新しいチャット</span>
          </button>
        </div>
        
        {/* チャット履歴 */}
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`flex items-center gap-2 w-full p-2 my-1 text-left rounded text-sm truncate hover:bg-[#1f2937] transition ${
                chat.id === currentChatId ? 'bg-[#1f2937]' : ''
              }`}
            >
              <MessageSquare size={16} />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>
        
        {/* サイドバーフッター */}
        <div className="p-3 border-t border-[#374151]">
          <button className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#1f2937] transition">
            <Settings size={16} />
            <span>設定</span>
          </button>
          <button className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#1f2937] transition">
            <LogOut size={16} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-[#e5e7eb] flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-3 text-[#6b7280] hover:text-[#111827]"
          >
            {showSidebar ? "≪" : "≫"}
          </button>
          <div className="flex-1 px-4 py-3">
            <h1 className="text-xl font-bold text-center">{currentChat.title}</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <div>
            {currentChat.messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="py-4 bg-[#f9fafb]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center flex-shrink-0 text-xs font-medium text-white">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-12 bg-[#e5e7eb] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        <footer className="border-t border-[#e5e7eb] bg-white py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}