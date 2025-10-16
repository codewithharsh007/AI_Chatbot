import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Trash2, Menu, User, Edit2, Check, X } from 'lucide-react';

export default function ChatGPTClone() {
  const [conversations, setConversations] = useState([
    { id: 1, title: 'New Chat', messages: [] }
  ]);
  const [currentConvId, setCurrentConvId] = useState(1);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const currentConv = conversations.find(c => c.id === currentConvId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConv?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConvId) {
        const newMessages = [...conv.messages, { role: 'user', content: userMessage }];
        const newTitle = conv.messages.length === 0 ? userMessage.slice(0, 30) : conv.title;
        return { ...conv, messages: newMessages, title: newTitle };
      }
      return conv;
    }));

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: currentConv.messages 
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, { role: 'assistant', content: data.response }] };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error:', error);
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }] };
        }
        return conv;
      }));
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const createNewChat = () => {
    const newId = Math.max(...conversations.map(c => c.id)) + 1;
    setConversations(prev => [...prev, { id: newId, title: 'New Chat', messages: [] }]);
    setCurrentConvId(newId);
  };

  const deleteConversation = (id) => {
    if (conversations.length === 1) return;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConvId === id) {
      setCurrentConvId(conversations[0].id);
    }
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (id) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, title: editTitle } : c
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-3 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`group relative flex items-center gap-2 px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                currentConvId === conv.id ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              {editingId === conv.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-gray-700 text-white text-sm px-2 py-1 rounded outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(conv.id)} className="text-green-400 hover:text-green-300">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div
                    onClick={() => setCurrentConvId(conv.id)}
                    className="flex-1 text-sm truncate"
                  >
                    {conv.title}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={() => startEditing(conv.id, conv.title)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteConversation(conv.id)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm">User Account</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-gray-800">ChatBud</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {currentConv?.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">ChatBud</h1>
                <p className="text-gray-500">How can I help you today?</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6">
              {currentConv?.messages.map((msg, idx) => (
                <div key={idx} className={`mb-8 ${msg.role === 'assistant' ? 'bg-gray-50' : ''} -mx-4 px-4 py-6`}>
                  <div className="max-w-3xl mx-auto flex gap-6">
                    <div className="flex-shrink-0">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center text-white font-bold text-sm">
                          AI
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-gray-800 leading-7 whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-8 bg-gray-50 -mx-4 px-4 py-6">
                  <div className="max-w-3xl mx-auto flex gap-6">
                    <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input data */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm px-4 py-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message ChatBud..."
                disabled={loading}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none max-h-32 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                className="p-2 bg-grey-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              Your ChatBud can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}