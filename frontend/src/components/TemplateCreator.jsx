import React, { useState, useMemo } from 'react';

const PRESETS = [
  {
    name: 'repair_delivery_dispatched',
    category: 'UTILITY',
    header: 'Device Out for Delivery',
    body: 'Hello {{1}}, great news! Your repaired {{2}} (Job ID: {{3}}) has been dispatched for doorstep delivery with our courier.\n\nEstimated Delivery: {{4}}\nDelivery Executive: {{5}}\n\nPlease keep the payment ready upon receipt.',
    samples: ['Murali', 'Apple iPhone 13', 'REP-1024', 'Today before 6:00 PM', 'Karthik (+91 9361863063)'],
    footer: 'iTechnic Mobiles Doorstep Express',
    buttons: [{ type: 'QUICK_REPLY', text: 'Track Delivery' }]
  },
  {
    name: 'battery_replacement_promo',
    category: 'MARKETING',
    header: 'Battery Health Alert',
    body: 'Hello {{1}}! Is your {{2}} battery draining fast or switching off unexpectedly? 🔋\n\nUpgrade to a 100% Genuine Certified High-Capacity Battery with a 6-Month Warranty at just ₹{{3}}.\n\nOffer valid till: {{4}}!\nVisit our service center at Tirukannur today.',
    samples: ['Customer', 'iPhone', '1299', 'Sunday'],
    footer: 'iTechnic Mobiles • Reply STOP to opt out',
    buttons: [{ type: 'QUICK_REPLY', text: 'Book Battery Swap' }, { type: 'QUICK_REPLY', text: 'Check Compatibility' }]
  },
  {
    name: 'service_invoice_receipt',
    category: 'UTILITY',
    header: 'Service Invoice & Warranty',
    body: 'Hello {{1}}, thank you for your payment of ₹{{2}} for {{3}} service on your {{4}}.\n\nInvoice No: {{5}}\nWarranty: 90 Days Comprehensive Warranty active from today.\n\nThank you for choosing iTechnic Mobiles!',
    samples: ['Murali', '3500', 'Display Replacement', 'iPhone 13', 'INV-8892'],
    footer: 'iTechnic Mobiles • We Repair. You Relax.',
    buttons: [{ type: 'QUICK_REPLY', text: 'Download Invoice' }]
  }
];

function TemplateCreator({ apiUrl, onTemplateCreated, onBackToHub }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('UTILITY');
  const [language, setLanguage] = useState('en_US');
  const [headerType, setHeaderType] = useState('TEXT');
  const [headerText, setHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [buttons, setButtons] = useState([
    { type: 'QUICK_REPLY', text: 'Contact Support' }
  ]);
  const [sampleValues, setSampleValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);

  // Extract {{1}}, {{2}} variables from bodyText
  const detectedVariables = useMemo(() => {
    const matches = bodyText.match(/{{\s*\d+\s*}}/g) || [];
    return matches.map((m, idx) => ({
      tag: m,
      index: idx,
      sample: sampleValues[idx] || `Sample_${idx + 1}`
    }));
  }, [bodyText, sampleValues]);

  // Insert variable into bodyText at cursor
  const handleInsertVariable = (varIndex) => {
    const tag = `{{${varIndex}}}`;
    setBodyText(prev => prev + ' ' + tag);
  };

  // Load preset
  const handleLoadPreset = (preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setHeaderType(preset.header ? 'TEXT' : 'NONE');
    setHeaderText(preset.header || '');
    setBodyText(preset.body);
    setFooterText(preset.footer || '');
    setButtons(preset.buttons || []);
    const sMap = {};
    (preset.samples || []).forEach((val, idx) => {
      sMap[idx] = val;
    });
    setSampleValues(sMap);
    setResponseStatus(null);
  };

  // Add Button
  const handleAddButton = () => {
    if (buttons.length >= 3) {
      alert('Meta supports a maximum of 3 quick reply buttons per template.');
      return;
    }
    setButtons([...buttons, { type: 'QUICK_REPLY', text: `Action ${buttons.length + 1}` }]);
  };

  // Remove Button
  const handleRemoveButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  // Update Button Text
  const handleUpdateButtonText = (index, text) => {
    const updated = [...buttons];
    updated[index].text = text;
    setButtons(updated);
  };

  // Submit Template to Meta
  const handleSubmitToMeta = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a template name.');
      return;
    }
    if (!bodyText.trim()) {
      alert('Please enter template body text.');
      return;
    }

    setSubmitting(true);
    setResponseStatus(null);

    // Format sample values array
    const samplesArr = detectedVariables.map(v => v.sample);

    try {
      const res = await fetch(`${apiUrl}/api/v1/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({
          name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          category,
          language,
          headerType,
          headerText: headerType === 'TEXT' ? headerText : null,
          bodyText,
          footerText: footerText.trim() || null,
          buttons: buttons.filter(b => b.text && b.text.trim()),
          sampleValues: samplesArr
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit template to Meta');
      }

      setResponseStatus({
        success: true,
        message: data.message || 'Template successfully submitted to Meta!',
        data: data.data
      });

      if (onTemplateCreated) onTemplateCreated();
    } catch (err) {
      console.error('Error submitting template to Meta:', err);
      setResponseStatus({
        success: false,
        message: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Compute live preview text with sample values replaced
  const previewBodyText = useMemo(() => {
    let text = bodyText;
    detectedVariables.forEach((v) => {
      text = text.replace(new RegExp(v.tag.replace(/[{}]/g, '\\$&'), 'g'), v.sample);
    });
    return text;
  }, [bodyText, detectedVariables]);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-y-auto">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              ← Back to Templates
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span>✨</span> Create Template & Submit to Meta
              </h2>
              <p className="text-xs text-slate-500">
                Design custom message templates and instantly dispatch them to Meta Graph API for automated approval.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Quick Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors border border-slate-200"
              >
                {p.header}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace (Split View) */}
      <div className="max-w-7xl mx-auto p-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Builder (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <form onSubmit={handleSubmitToMeta} className="space-y-5">
              
              {/* Template Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. repair_delivery_confirmed"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Lowercase letters and underscores only (e.g. `order_update`)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="UTILITY">UTILITY (Transactional, confirmations, alerts)</option>
                    <option value="MARKETING">MARKETING (Promotions, discounts, newsletters)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Utility templates get approved faster by Meta
                  </span>
                </div>
              </div>

              {/* Language selection */}
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Language Code
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="en_US">English (US) - en_US</option>
                  <option value="en">English (UK) - en</option>
                  <option value="ta">Tamil - ta</option>
                  <option value="hi">Hindi - hi</option>
                </select>
              </div>

              {/* Header Configuration */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Header (Optional)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="headerType"
                        checked={headerType === 'NONE'}
                        onChange={() => setHeaderType('NONE')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>None</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="headerType"
                        checked={headerType === 'TEXT'}
                        onChange={() => setHeaderType('TEXT')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Text Header</span>
                    </label>
                  </div>
                </div>

                {headerType === 'TEXT' && (
                  <input
                    type="text"
                    placeholder="e.g. Device Ready for Pickup"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    maxLength={60}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                )}
              </div>

              {/* Body Text */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Message Body <span className="text-rose-500">*</span>
                  </label>
                  {/* Variable Helper Chips */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Insert tag:</span>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInsertVariable(num)}
                        className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      >
                        {`+ {{${num}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  required
                  rows={6}
                  placeholder="Hello {{1}}, your repair booking {{2}} has been confirmed for {{3}}..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Use {`{{1}}`}, {`{{2}}`} for customer name, repair IDs, prices, dates, etc.
                </span>
              </div>

              {/* Sample Values for Meta Approval (CRITICAL) */}
              {detectedVariables.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-700 font-bold text-xs">
                      ⚠️ Sample Variable Values (Required by Meta for Review)
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mb-3">
                    Meta requires real examples for each variable to approve your template.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {detectedVariables.map((v) => (
                      <div key={v.index} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-white text-emerald-800 font-bold px-2 py-1 rounded border border-amber-300">
                          {v.tag}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Sample value for ${v.tag}`}
                          value={sampleValues[v.index] || ''}
                          onChange={(e) =>
                            setSampleValues({
                              ...sampleValues,
                              [v.index]: e.target.value
                            })
                          }
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Configuration */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Footer (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. iTechnic Mobiles • We Repair. You Relax."
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  maxLength={60}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600"
                />
              </div>

              {/* Buttons Builder */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Interactive Buttons ({buttons.length}/3)
                  </label>
                  {buttons.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddButton}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      + Add Button
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {buttons.map((btn, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        Button {idx + 1}:
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Book Repair"
                        value={btn.text}
                        maxLength={25}
                        onChange={(e) => handleUpdateButtonText(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 text-sm font-bold"
                        title="Remove button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Alert */}
              {responseStatus && (
                <div
                  className={`p-4 rounded-xl text-xs border ${
                    responseStatus.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <span>{responseStatus.success ? '🎉' : '❌'}</span>
                    {responseStatus.message}
                  </p>
                  {responseStatus.data?.id && (
                    <p className="mt-1 font-mono text-[11px] text-emerald-700">
                      Meta Template ID: {responseStatus.data.id} | Status: {responseStatus.data.status || 'PENDING'}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onBackToHub}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting to Meta API...
                    </>
                  ) : (
                    <>
                      <span>🚀</span> Submit to Meta for Approval
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Phone Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                📱 Live WhatsApp Phone Preview
              </span>
            </div>

            {/* Smartphone Frame */}
            <div className="w-[320px] bg-slate-900 rounded-[42px] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Speaker / Camera notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 mr-2"></div>
                <div className="w-10 h-1 rounded-full bg-slate-700"></div>
              </div>

              {/* WhatsApp Screen */}
              <div className="bg-[#efeae2] rounded-[32px] overflow-hidden flex flex-col h-[520px]">
                {/* WhatsApp Chat Top Bar */}
                <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center gap-2 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-emerald-800 shadow-xs">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold truncate">iTechnic Mobiles</p>
                      <span className="text-[10px] text-emerald-300" title="Verified Business">
                        ✓
                      </span>
                    </div>
                    <p className="text-[9px] text-emerald-100">Official Business Account</p>
                  </div>
                </div>

                {/* Chat Scroll Window */}
                <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end">
                  {/* Date Pill */}
                  <div className="text-center mb-2">
                    <span className="bg-white/80 text-slate-500 text-[9px] font-medium px-2 py-0.5 rounded-full shadow-xs">
                      TODAY
                    </span>
                  </div>

                  {/* WhatsApp Message Bubble */}
                  <div className="bg-white rounded-lg p-3 shadow-sm text-xs relative max-w-[95%] self-start border-l-3 border-[#25D366]">
                    {/* Header */}
                    {headerType === 'TEXT' && headerText && (
                      <div className="font-bold text-slate-900 mb-1.5 text-xs pb-1 border-b border-slate-100">
                        {headerText}
                      </div>
                    )}

                    {/* Body */}
                    <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
                      {previewBodyText || (
                        <span className="text-slate-400 italic">
                          Your message body will appear here in real-time as you type...
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    {footerText && (
                      <div className="text-[10px] text-slate-400 mt-2 italic pt-1 border-t border-slate-100">
                        {footerText}
                      </div>
                    )}

                    {/* Time & Read Receipts */}
                    <div className="text-right text-[9px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                      <span>11:45 AM</span>
                      <span className="text-sky-500 font-bold">✓✓</span>
                    </div>

                    {/* Buttons */}
                    {buttons.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1">
                        {buttons.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className="text-center py-1.5 px-2 rounded-md bg-slate-50 text-[#075e54] font-semibold text-[10px] border border-slate-200 flex items-center justify-center gap-1 shadow-2xs hover:bg-slate-100 cursor-pointer"
                          >
                            <span>↩</span> {b.text || `Action ${bIdx + 1}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mock Phone Bottom Input Bar */}
                <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200 text-slate-400 text-xs">
                  <span className="p-1">😊</span>
                  <div className="flex-1 bg-white rounded-full py-1 px-3 text-[10px] text-slate-400">
                    Type a message
                  </div>
                  <span className="p-1">🎤</span>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TemplateCreator;
