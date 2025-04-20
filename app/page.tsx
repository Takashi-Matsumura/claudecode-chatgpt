'use client';

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat-message";
import { Send, MessageSquare, Plus, Settings, LogOut, X } from "lucide-react";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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

// 利用可能なOpenAIモデルのリスト
const availableModels = [
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  // { id: "gpt-4", name: "GPT-4" },
  // { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-4o-mini", name: "GPT-4o-mini" },
];

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([initialChat]);
  const [currentChatId, setCurrentChatId] = useState<string>(initialChat.id);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY || "");
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // OpenAIのクライアントインスタンスを作成
  const openai = new OpenAI({
    apiKey: apiKey, // 入力されたAPI Keyを使用
    dangerouslyAllowBrowser: true // クライアントサイドで実行するための設定
  });

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
    
    const userInput = input.trim();
    
    // ユーザーメッセージを追加
    const userMessage: Message = { role: "user", content: userInput };
    
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );
    
    setInput("");
    setIsLoading(true);
    
    try {
      // OpenAI APIに送信するメッセージ履歴を作成
      const messages: ChatCompletionMessageParam[] = currentChat.messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }));
      
      // ユーザーの新しいメッセージを追加
      messages.push({ role: 'user', content: userInput });
      
      // OpenAI APIを呼び出し
      const response = await openai.chat.completions.create({
        model: selectedModel, // 選択されたモデルを使用
        messages: messages,
        temperature: 0.7,
      });
      
      // AIの応答を取得
      const aiMessage: Message = {
        role: "assistant",
        content: response.choices[0]?.message?.content || "すみません、応答を生成できませんでした。"
      };
      
      // チャット履歴にAIの応答を追加
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChatId 
            ? { 
                ...chat, 
                // タイトルが初期値の場合、最初のユーザー入力を基にタイトルを更新
                title: chat.title === "新しいチャット" ? userInput.slice(0, 20) + (userInput.length > 20 ? "..." : "") : chat.title,
                messages: [...chat.messages, aiMessage] 
              }
            : chat
        )
      );
    } catch (error) {
      console.error("OpenAI API error:", error);
      
      // エラーの種類に応じたメッセージを表示
      let errorContent = "申し訳ありません。AI応答の生成中にエラーが発生しました。後でもう一度お試しください。";
      
      // APIキーエラーの場合
      if (error instanceof Error) {
        console.log('Error message:', error.message);
        
        if (error.message.includes('API key')) {
          errorContent = "OpenAI APIキーが無効です。設定から正しいAPIキーを入力してください。";
        } else if (error.message.includes('model')) {
          errorContent = "選択されたモデルが利用できません。別のモデルを選択するか、APIキーの権限を確認してください。";
        } else if (error.message.includes('billing') || error.message.includes('quota')) {
          errorContent = "OpenAIアカウントの支払い設定またはクォータに問題があります。OpenAIダッシュボードで確認してください。";
        }
      }
      
      // エラーメッセージをアシスタントの応答として追加
      const errorMessage: Message = {
        role: "assistant",
        content: errorContent
      };
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
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
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const handleSaveSettings = () => {
    // 設定を保存し、設定パネルを閉じる
    // localStorage に保存することも可能
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_model', selectedModel);
    toggleSettings();
  };
  
  // コンポーネントマウント時に保存済み設定を読み込む
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('openai_model');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

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
          <button 
            onClick={toggleSettings}
            className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#1f2937] transition"
          >
            <Settings size={16} className={!apiKey ? "text-red-400" : ""} />
            <span>設定</span>
            {!apiKey && <span className="ml-1 text-xs text-red-400">*</span>}
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
            <p className="text-xs text-center text-gray-500">
              使用中のモデル: {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
            </p>
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
      
      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">設定</h2>
              <button onClick={toggleSettings} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API キー
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  AI モデル
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="pt-2">
                <Button onClick={handleSaveSettings} className="w-full">
                  保存
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}