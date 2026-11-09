import React, { useState, useEffect } from 'react';
import { formatDate, formatLastSeen } from '../utils/formatters';

function CustomerSidebar({
  contact,
  apiUrl,
  onUpdateContact,
  onOpenRepairModal,
  onOpenTemplateModal,
  onUpdateLeadStatus,
  isOpen = true,
  onToggle
}) {
  // Inline edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  const [isEditingDevice, setIsEditingDevice] = useState(false);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');

  // Private agent notes state
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Promotional dispatch state
  const [sendingPromo, setSendingPromo] = useState(null);

  // Loyalty points state
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    if (contact) {
      setEditName(contact.name || '');
      setEditBrand(contact.device_brand || 'Apple');
      setEditModel(contact.device_model || '');
      setNotes(contact.notes || '');
      setLoyaltyPoints(contact.loyaltyPoints || 0);
      setIsEditingName(false);
      setIsEditingDevice(false);
    }
  }, [contact]);

  if (!contact) return null;

  // Save profile updates (Name, Device, Loyalty, Notes)
  const saveProfileUpdates = async (updates) => {
    try {
      const res = await fetch(`${apiUrl}/crm/${contact.phone}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpdateContact) onUpdateContact();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  // Handle Save Name
  const handleSaveName = async () => {
    if (!editName.trim()) return;
    const ok = await saveProfileUpdates({ name: editName.trim() });
    if (ok) setIsEditingName(false);
  };

  // Handle Save Device
  const handleSaveDevice = async () => {
    const ok = await saveProfileUpdates({
      device_brand: editBrand.trim(),
      device_model: editModel.trim()
    });
    if (ok) setIsEditingDevice(false);
  };

  // Handle Save Notes
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const ok = await saveProfileUpdates({ notes });
    if (ok) {
      alert('✅ Internal note saved to customer profile!');
    }
    setSavingNotes(false);
  };

  // Handle Adjust Loyalty Points
  const handleAdjustPoints = async (delta) => {
    const newPoints = Math.max(0, loyaltyPoints + delta);
    setLoyaltyPoints(newPoints);
    await saveProfileUpdates({ loyaltyPoints: newPoints });
  };

  // 1-Click Send Promotional Meta Template to Customer
  const handleSendPromotionalOffer = async (promoType) => {
    if (sendingPromo) return;
    setSendingPromo(promoType);

    let templateName = 'promotional_offer_broadcast';
    let bodyVariables = [];

    const custName = contact.name || 'Customer';

    if (promoType === 'weekend_repair') {
      templateName = 'promotional_offer_broadcast';
      bodyVariables = [custName, 'Weekend Mega Repair Discount', '25%', 'this Sunday'];
    } else if (promoType === 'festive_promo') {
      templateName = 'festival_discount_promo';
      bodyVariables = [custName, 'Flat 20%', 'FESTIVE20', '31st October'];
    } else if (promoType === 'express_deal') {
      templateName = 'service_discount_broadcast';
      bodyVariables = [custName, '499', 'Free Tempered Glass with screen replacement'];
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/messages/send-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({
          to: contact.phone,
          templateName,
          bodyVariables
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 Promotional offer dispatched to +${contact.phone} on WhatsApp!`);
        if (onUpdateContact) onUpdateContact();
      } else {
        alert(`❌ Failed: ${data.error?.message || data.error || 'Failed to dispatch offer'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSendingPromo(null);
    }
  };

  // Calculate LTV / Revenue
  const calculateTotalLtv = () => {
    let total = 0;
    (contact.repairs || []).forEach(r => {
      if (r.status === 'Delivered' || r.status === 'Ready for Pickup') {
        total += (r.quotedCost || r.estimatedCost || 0);
      }
    });
    (contact.orders || []).forEach(o => {
      total += (o.total || o.totalAmount || 0);
    });
    return total;
  };

  // Collapsed Sidebar View
  if (!isOpen) {
    return (
      <div className="w-12 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col items-center py-4 gap-4 transition-all">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
          title="Expand Customer Intelligence Sidebar"
        >
          <span className="text-sm font-bold">◀</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-wa-teal/10 text-wa-teal flex items-center justify-center font-bold text-xs">
          {contact.name ? contact.name.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="rotate-90 whitespace-nowrap text-xs font-bold text-slate-400 mt-10 tracking-wider">
          CUSTOMER SIDEBAR
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 xl:w-88 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all shrink-0">
      
      {/* Top Sidebar Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">👤</span>
          <h3 className="font-bold text-xs tracking-tight uppercase text-slate-200">
            Customer Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors text-xs"
            title="Collapse Sidebar"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Scrollable Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs divide-y divide-slate-100">

        {/* 1. Customer Profile Card */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md">
              {contact.name ? contact.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-emerald-400 rounded focus:outline-none"
                    placeholder="Enter customer name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm truncate" title={contact.name}>
                    {contact.name || 'Unnamed Customer'}
                  </h4>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-emerald-600 p-0.5 text-[11px]"
                    title="Edit Name"
                  >
                    ✎
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-slate-600 text-[11px]">
                  +{contact.phone}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(contact.phone);
                    alert(`Copied +${contact.phone} to clipboard!`);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-[10px]"
                  title="Copy Phone Number"
                >
                  📋
                </button>
                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px]"
                  title="Open WhatsApp Web"
                >
                  ↗ Chat
                </a>
              </div>
            </div>
          </div>

          {/* Quick Status & Consent Badges */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Lead Stage:</span>
              <select
                value={contact.lead_status || 'New'}
                onChange={(e) => onUpdateLeadStatus && onUpdateLeadStatus(contact.phone, e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-[11px] text-emerald-800 outline-none cursor-pointer"
              >
                <option value="New">🟢 New Lead</option>
                <option value="Inquired">💬 Inquired</option>
                <option value="Repair Booked">📅 Repair Booked</option>
                <option value="In Repair">⚙️ In Repair</option>
                <option value="Ready for Pickup">🎉 Ready for Pickup</option>
                <option value="Delivered">✅ Delivered</option>
                <option value="Dropped">❌ Dropped</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200/60 pt-1.5">
              <span>Marketing Opt-in:</span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                contact.consent !== false
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {contact.consent !== false ? '✓ Opted In' : '✕ Opted Out'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Preferred Language:</span>
              <span className="font-semibold text-slate-800">
                {contact.language === 'ta' ? '🇮🇳 Tamil' : '🇬🇧 English'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Device & Diagnostics Profile */}
        <div className="space-y-2.5 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span>📱</span> Device & Diagnostics
            </span>
            {!isEditingDevice && (
              <button
                onClick={() => setIsEditingDevice(true)}
                className="text-[10px] text-emerald-700 hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingDevice ? (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">Brand</label>
                <select
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="Apple">Apple iPhone</option>
                  <option value="Samsung">Samsung</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Xiaomi">Xiaomi / Redmi</option>
                  <option value="Vivo / Oppo">Vivo / Oppo</option>
                  <option value="Google Pixel">Google Pixel</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">Model</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setIsEditingDevice(false)}
                  className="px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDevice}
                  className="px-2.5 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-bold"
                >
                  Save Device
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Device Model:</span>
                <span className="font-bold text-slate-900">
                  {contact.device_brand || 'Smartphone'} {contact.device_model || ''}
                </span>
              </div>
              {contact.issue_description && (
                <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span className="text-[10px] text-slate-400 block font-semibold">Reported Problem:</span>
                  <p className="mt-0.5 font-medium">{contact.issue_description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Promotional WhatsApp Broadcasts (1-Click Dispatch) */}
        <div className="space-y-2.5 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span>📢</span> 1-Click Promotional Offers
            </span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
              Meta Approved
            </span>
          </div>

          <p className="text-[10px] text-slate-500">
            Send approved high-converting promotional broadcasts directly to this customer's WhatsApp:
          </p>

          <div className="space-y-2">
            {/* Promo 1: Weekend Mega Discount */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="min-w-0">
                <p className="font-bold text-amber-900 text-[11px] truncate">
                  🎉 Weekend Mega Repair Deal
                </p>
                <p className="text-[10px] text-amber-700">Up to 25% OFF screen & battery</p>
              </div>
              <button
                disabled={sendingPromo !== null}
                onClick={() => handleSendPromotionalOffer('weekend_repair')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] shrink-0 transition-colors shadow-xs disabled:opacity-50"
              >
                {sendingPromo === 'weekend_repair' ? 'Sending...' : 'Send Deal'}
              </button>
            </div>

            {/* Promo 2: Festive Season Discount */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="min-w-0">
                <p className="font-bold text-purple-900 text-[11px] truncate">
                  🪔 Festive Savings (FESTIVE20)
                </p>
                <p className="text-[10px] text-purple-700">Flat 20% discount on all repairs</p>
              </div>
              <button
                disabled={sendingPromo !== null}
                onClick={() => handleSendPromotionalOffer('festive_promo')}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] shrink-0 transition-colors shadow-xs disabled:opacity-50"
              >
                {sendingPromo === 'festive_promo' ? 'Sending...' : 'Send Deal'}
              </button>
            </div>

            {/* Promo 3: Express Service Discount */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="min-w-0">
                <p className="font-bold text-teal-900 text-[11px] truncate">
                  ⚡ Express Deal (₹499+)
                </p>
                <p className="text-[10px] text-teal-700">Free 9D Glass with screen swap</p>
              </div>
              <button
                disabled={sendingPromo !== null}
                onClick={() => handleSendPromotionalOffer('express_deal')}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px] shrink-0 transition-colors shadow-xs disabled:opacity-50"
              >
                {sendingPromo === 'express_deal' ? 'Sending...' : 'Send Deal'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Quick CRM Service Actions */}
        <div className="space-y-2 pt-3">
          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡</span> Fast Actions
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenRepairModal}
              className="p-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-slate-700 hover:text-emerald-800 text-left transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>🛠️</span>
              <span className="font-semibold text-[11px] truncate">+ New Repair</span>
            </button>

            <button
              onClick={onOpenTemplateModal}
              className="p-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-800 text-left transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>📱</span>
              <span className="font-semibold text-[11px] truncate">Send Template</span>
            </button>
          </div>
        </div>

        {/* 5. Lifetime Value & Customer Stats */}
        <div className="space-y-2 pt-3">
          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <span>📊</span> Customer Metrics
          </span>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Lifetime Value</span>
              <span className="text-sm font-extrabold text-emerald-700">₹{calculateTotalLtv().toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Repairs Logged</span>
              <span className="text-sm font-extrabold text-slate-800">{contact.repairs?.length || 0}</span>
            </div>
          </div>

          {/* Loyalty Points Manager */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Loyalty Balance</span>
              <span className="text-sm font-extrabold text-amber-900">🎁 {loyaltyPoints} pts</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAdjustPoints(50)}
                className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold rounded"
                title="Add 50 points"
              >
                +50
              </button>
              <button
                onClick={() => handleAdjustPoints(-50)}
                className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold rounded"
                title="Deduct 50 points"
              >
                -50
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
            <p>First Contacted: <strong className="text-slate-600">{formatDate(contact.firstSeen)}</strong></p>
            <p>Last Active: <strong className="text-slate-600">{formatLastSeen(contact.lastSeen)}</strong></p>
          </div>
        </div>

        {/* 6. Internal Private Agent / Technician Notes */}
        <div className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span>📝</span> Private Technician Notes
            </span>
            <span className="text-[9px] text-slate-400 italic">Not visible to user</span>
          </div>

          <textarea
            rows={3}
            placeholder="Add internal notes about this customer (e.g. Requested original OLED, prefers calls after 6 PM)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white resize-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
            >
              {savingNotes ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerSidebar;
