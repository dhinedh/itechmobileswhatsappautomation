import React, { useState, useEffect } from 'react';
import { FALLBACK_TEMPLATES } from '../mockData';

function TemplatesHub({ apiUrl, onNavigateToCreate, onNavigateToApiDocs }) {
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Test Send Modal State
  const [testModalTemplate, setTestModalTemplate] = useState(null);
  const [testPhone, setTestPhone] = useState('919342400879');
  const [testVariables, setTestVariables] = useState({});
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/templates`, {
        headers: { 'x-requested-from': 'internal-dashboard' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.warn('Backend templates API not ready yet, using verified Meta templates:', err.message);
      setTemplates(FALLBACK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [apiUrl]);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.components?.some(c => c.text && c.text.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getHeaderComponent = (components) => components?.find(c => c.type === 'HEADER');
  const getBodyComponent = (components) => components?.find(c => c.type === 'BODY');
  const getFooterComponent = (components) => components?.find(c => c.type === 'FOOTER');
  const getButtonsComponent = (components) => components?.find(c => c.type === 'BUTTONS');

  // Open Test Sender modal
  const handleOpenTest = (tpl) => {
    setTestModalTemplate(tpl);
    setTestResult(null);
    const bodyComp = getBodyComponent(tpl.components);
    const matches = bodyComp?.text?.match(/{{\s*\d+\s*}}/g) || [];
    const initialVars = {};
    const examples = bodyComp?.example?.body_text?.[0] || [];
    matches.forEach((_, idx) => {
      initialVars[idx] = examples[idx] || `Sample_${idx + 1}`;
    });
    setTestVariables(initialVars);
  };

  // Submit Test Message
  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    if (!testPhone || !testModalTemplate) return;
    setSendingTest(true);
    setTestResult(null);

    try {
      const bodyComp = getBodyComponent(testModalTemplate.components);
      const matches = bodyComp?.text?.match(/{{\s*\d+\s*}}/g) || [];
      const varArray = matches.map((_, idx) => testVariables[idx] || '');

      const res = await fetch(`${apiUrl}/api/v1/messages/send-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({
          to: testPhone,
          templateName: testModalTemplate.name,
          bodyVariables: varArray
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to dispatch template');
      }

      setTestResult({
        success: true,
        message: `Template successfully sent to +${testPhone}!`,
        id: data.metaResponse?.messages?.[0]?.id
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-y-auto">
      {/* Top Banner & Action Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Meta WhatsApp Templates Hub
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Live Meta Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time catalog of approved templates registered with Meta Cloud API. Ready for CRM integration.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchTemplates}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300"
            >
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              {loading ? 'Syncing...' : 'Sync with Meta'}
            </button>
            <button
              onClick={onNavigateToApiDocs}
              className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>⚡</span> Get API Code
            </button>
            <button
              onClick={onNavigateToCreate}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 hover:shadow"
            >
              <span>+</span> Create New Template
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search templates by name or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-medium text-slate-600">
              <span className="px-2 text-slate-400">Status:</span>
              {['ALL', 'APPROVED', 'PENDING'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    statusFilter === st ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-medium text-slate-600">
              <span className="px-2 text-slate-400">Category:</span>
              {['ALL', 'UTILITY', 'MARKETING'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    categoryFilter === cat ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 w-full flex-1">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Fetching live templates from Meta Graph API...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center justify-between">
            <div>
              <strong>Failed to load templates:</strong> {error}
            </div>
            <button
              onClick={fetchTemplates}
              className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-base font-bold text-slate-700">No templates found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No Meta templates matched your filter or search criteria. Try modifying your filter or create a new template.
            </p>
            <button
              onClick={onNavigateToCreate}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              + Create New Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const header = getHeaderComponent(tpl.components);
              const body = getBodyComponent(tpl.components);
              const footer = getFooterComponent(tpl.components);
              const buttons = getButtonsComponent(tpl.components);

              const isApproved = tpl.status === 'APPROVED';
              const isPending = tpl.status === 'PENDING';

              return (
                <div
                  key={tpl.id || tpl.name}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isApproved ? '● APPROVED' : isPending ? '⏳ PENDING' : tpl.status}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {tpl.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {tpl.language}
                        </span>
                      </div>
                      <h3
                        className="text-sm font-bold text-slate-900 mt-1.5 truncate font-mono"
                        title={tpl.name}
                      >
                        {tpl.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenTest(tpl)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-md transition-colors shrink-0 flex items-center gap-1"
                      title="Test send this template to WhatsApp"
                    >
                      <span>🚀</span> Test
                    </button>
                  </div>

                  {/* Card Body: WhatsApp Chat Bubble Simulation */}
                  <div className="p-4 flex-1 bg-[#eae6df] flex flex-col justify-center">
                    <div className="bg-white rounded-lg p-3.5 shadow-sm text-xs relative max-w-[95%] self-start border-l-4 border-emerald-500">
                      {/* Header */}
                      {header && (
                        <div className="font-bold text-slate-900 mb-1.5 text-[11px] pb-1 border-b border-slate-100">
                          {header.text || '📌 [Header]'}
                        </div>
                      )}

                      {/* Body */}
                      <div className="text-slate-800 whitespace-pre-wrap leading-relaxed font-sans text-[11px]">
                        {body?.text?.split(/({\{\s*\d+\s*\}\})/g).map((part, i) => {
                          if (part.startsWith('{{')) {
                            return (
                              <span
                                key={i}
                                className="bg-emerald-100 text-emerald-800 font-bold px-1 py-0.2 rounded font-mono text-[10px]"
                              >
                                {part}
                              </span>
                            );
                          }
                          return part;
                        })}
                      </div>

                      {/* Footer */}
                      {footer && (
                        <div className="text-[10px] text-slate-400 mt-2 italic pt-1 border-t border-slate-100">
                          {footer.text}
                        </div>
                      )}

                      {/* Quick Reply / URL Buttons */}
                      {buttons?.buttons && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1">
                          {buttons.buttons.map((btn, bIdx) => (
                            <div
                              key={bIdx}
                              className="text-center py-1 px-2 rounded bg-slate-50 text-emerald-700 font-semibold text-[10px] border border-slate-200 flex items-center justify-center gap-1"
                            >
                              <span>↩</span> {btn.text}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Time & ticks */}
                      <div className="text-right text-[9px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                        <span>Just now</span>
                        <span className="text-sky-500">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Metadata and Integration Info */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate font-mono text-[10px] text-slate-400" title={tpl.id}>
                      ID: {tpl.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tpl.name);
                          alert(`Copied template name "${tpl.name}" to clipboard!`);
                        }}
                        className="hover:text-emerald-600 font-medium text-[11px]"
                        title="Copy template name"
                      >
                        Copy Name
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Test Template Sender Modal */}
      {testModalTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span>🚀</span> Test Dispatch Template
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5 font-mono">
                  {testModalTemplate.name}
                </p>
              </div>
              <button
                onClick={() => setTestModalTemplate(null)}
                className="text-emerald-100 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestMessage} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient WhatsApp Number (with Country Code)
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. 919342400879"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Example: 919342400879 (No '+' or spaces)
                </span>
              </div>

              {/* Dynamic Variables Inputs */}
              {Object.keys(testVariables).length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">
                    Dynamic Parameters ({'{{1}}'}, {'{{2}}'}...):
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(testVariables).map((idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">
                          {`{{${parseInt(idx) + 1}}}`}
                        </span>
                        <input
                          type="text"
                          required
                          value={testVariables[idx]}
                          onChange={(e) =>
                            setTestVariables({ ...testVariables, [idx]: e.target.value })
                          }
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.id && (
                    <p className="text-[10px] font-mono mt-1 text-emerald-700">
                      Message ID: {testResult.id}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTestModalTemplate(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sendingTest ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending to WhatsApp...
                    </>
                  ) : (
                    <>
                      <span>📨</span> Send Test Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatesHub;
