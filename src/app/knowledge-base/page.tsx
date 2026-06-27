'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { PageHeader, Button, Card, EmptyState } from '@/components/ui';
import { kbApi } from '@/lib/api';

interface Article { id: string; category: string; title: string; content: string; tags: string[]; updated_at: string; }

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{ category: string; article_count: string }[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ category: '', title: '', content: '' });

  const fetchArticles = async () => {
    const params: Record<string, string> = {};
    if (selected) params.category = selected;
    if (search) params.search = search;
    const [artRes, catRes] = await Promise.all([kbApi.list(params), kbApi.categories()]);
    setArticles(artRes.data);
    setCategories(catRes.data);
  };

  useEffect(() => { fetchArticles(); }, [selected, search]);

  const createArticle = async () => {
    await kbApi.create(form);
    setCreating(false);
    setForm({ category: '', title: '', content: '' });
    fetchArticles();
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await kbApi.delete(id);
    fetchArticles();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Knowledge base"
        subtitle="Articles the AI uses to answer customer questions"
        actions={<Button variant="primary" size="sm" onClick={() => setCreating(true)}>+ Add article</Button>}
      />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile: horizontal scrolling category pills */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0 scrollbar-hide">
          <button
            onClick={() => setSelected('')}
            className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border flex-shrink-0 ${!selected ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}
          >
            All ({articles.length})
          </button>
          {categories.map(c => (
            <button
              key={c.category}
              onClick={() => setSelected(c.category)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border flex-shrink-0 ${selected === c.category ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}
            >
              {c.category} ({c.article_count})
            </button>
          ))}
        </div>

        {/* Desktop: vertical sidebar */}
        <div className="hidden md:block w-52 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-3">
          <button
            onClick={() => setSelected('')}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-1 ${!selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All articles ({articles.length})
          </button>
          {categories.map(c => (
            <button
              key={c.category}
              onClick={() => setSelected(c.category)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-1 ${selected === c.category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {c.category} <span className="text-gray-400 ml-1">({c.article_count})</span>
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {creating && (
            <Card className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-3">New article</h3>
              <div className="space-y-3">
                <input placeholder="Category (e.g. Warranty FAQ)" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <textarea placeholder="Content (the AI will read this to answer customer questions)" value={form.content}
                  onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={createArticle}>Save article</Button>
                  <Button size="sm" onClick={() => setCreating(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {articles.length === 0 ? (
            <EmptyState icon="📚" title="No articles yet" description="Add articles to help the AI answer customer questions." />
          ) : (
            <div className="space-y-3">
              {articles.map(a => (
                <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{a.category}</span>
                        <span className="text-xs text-gray-400">{new Date(a.updated_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">{a.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                    </div>
                    <button onClick={() => deleteArticle(a.id)} className="text-gray-300 hover:text-red-500 text-sm flex-shrink-0">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
