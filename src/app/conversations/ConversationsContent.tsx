'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Bot, Zap, User, Users } from 'lucide-react';
import { ScorePill, Button } from '@/components/ui';
import { conversationsApi } from '@/lib/api';
import { PageHeader } from '@/components/ui';

interface Conversation {
  id: string; lead_name: string; phone: string; interest_score: number;
  score_tier: string; channel: string; ai_active: boolean; last_message: string;
  last_message_at: string; lead_id: string;
}

interface Message {
  id: string; direction: string; sender_type: string; sender_name: string;
  content: string; created_at: string;
}

export default function ConversationsContent() {
  const searchParams = useSearchParams();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [aiReplying, setAiReplying] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationsApi.list().then(({ data }) => {
      setConvos(data);
      const leadId = searchParams.get('leadId');
      if (leadId) {
        const match = data.find((c: Conversation) => c.lead_id === leadId);
        if (match) selectConvo(match);
      }
    });
  }, []);

  const selectConvo = async (c: Conversation) => {
    setSelected(c);
    setMobileView('chat');
    const { data } = await conversationsApi.messages(c.id);
    setMessages(data.messages);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!selected || !newMsg.trim()) return;
    setSending(true);
    try {
      const { data } = await conversationsApi.sendMessage(selected.id, newMsg, selected.channel);
      setMessages((m) => [...m, data]);
      setNewMsg('');
    } finally { setSending(false); }
  };

  const triggerAIReply = async () => {
    if (!selected) return;
    setAiReplying(true);
    try {
      const { data } = await conversationsApi.aiReply(selected.id);
      setMessages((m) => [...m, data]);
    } finally { setAiReplying(false); }
  };

  const toggleAI = async () => {
    if (!selected) return;
    const { data } = await conversationsApi.update(selected.id, { ai_active: !selected.ai_active });
    setSelected((s) => s ? { ...s, ai_active: data.ai_active } : s);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Conversations" />
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list — full-width on mobile when mobileView='list', hidden when chat open */}
        <div className={`
          flex-col border-r border-gray-200 overflow-y-auto bg-white
          w-full md:w-72 md:flex-shrink-0
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        `}>
          {convos.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No conversations yet</div>
          )}
          {convos.map((c) => (
            <button key={c.id} onClick={() => selectConvo(c)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900 truncate">{c.lead_name}</span>
                <ScorePill score={c.interest_score} />
              </div>
              <div className="text-xs text-gray-500 truncate">{c.last_message || 'No messages yet'}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">{c.channel}</span>
                {c.ai_active && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded">AI on</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Chat pane — full-width on mobile when mobileView='chat' */}
        {selected ? (
          <div className={`
            flex-1 flex-col overflow-hidden
            ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
          `}>
            <div className="px-3 md:px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                className="md:hidden text-gray-500 hover:text-gray-800 mr-1"
                onClick={() => setMobileView('list')}
                aria-label="Back to conversations"
              ><ArrowLeft className="w-5 h-5" /></button>
              <span className="font-medium text-sm text-gray-900 truncate">{selected.lead_name}</span>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <ScorePill score={selected.interest_score} />
              <div className="ml-auto flex gap-1.5 md:gap-2 flex-shrink-0">
                <Button size="sm" variant={selected.ai_active ? 'secondary' : 'primary'} onClick={toggleAI}>
                  <Bot className="w-3.5 h-3.5" />{selected.ai_active ? 'Take over' : 'Hand back to AI'}
                </Button>
                <Button size="sm" onClick={triggerAIReply} disabled={aiReplying}>
                  <Zap className="w-3.5 h-3.5" />{aiReplying ? 'Thinking…' : 'AI reply'}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50">
              {messages.map((m) => {
                const isOutbound = m.direction === 'outbound';
                const isAI = m.sender_type === 'ai';
                const isButtonReply = !isOutbound && (
                  m.content === 'Accept your quote' ||
                  m.content === 'Ask questions' ||
                  m.content === 'Book a meeting'
                );
                return (
                  <div key={m.id} className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
                      {isAI ? <><Bot className="w-3 h-3" />AI</> : isOutbound ? <><User className="w-3 h-3" />You</> : <><Users className="w-3 h-3" />Customer</>}
                      <span>·</span>{new Date(m.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      {isButtonReply && <span className="ml-1 text-[10px] text-green-600 font-medium">Button tap</span>}
                    </div>
                    {isButtonReply ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {m.content === 'Accept your quote' && '✅ '}
                        {m.content === 'Book a meeting' && '📅 '}
                        {m.content === 'Ask questions' && '💬 '}
                        {m.content}
                      </div>
                    ) : (
                      <div className={`max-w-[85%] md:max-w-sm px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        isOutbound ? (isAI ? 'bg-purple-100 text-purple-900' : 'bg-blue-600 text-white')
                          : 'bg-white border border-gray-200 text-gray-800'}`}>
                        {m.content}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
              <textarea value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder="Type a message…"
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" rows={2} />
              <Button variant="primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
                {sending ? '…' : 'Send'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">
            Select a conversation to start
          </div>
        )}
      </div>
    </div>
  );
}
