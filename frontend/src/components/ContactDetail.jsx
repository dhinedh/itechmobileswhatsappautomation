import React, { useState, useRef, useEffect } from 'react';
import { formatDate, formatTime, formatLastSeen } from '../utils/formatters';
import logoImg from '../assets/logo.png';
import ExecutiveDashboard from './ExecutiveDashboard';

const CANNED_RESPONSES = [
  { label: '📍 Store Location', text: '📍 iTechnic Mobiles Service Center: TV Malai Road, Tirukannur, Pondicherry - 605501. Near Bus Stop.' },
  { label: '⏰ Working Hours', text: '⏰ Our service center is open Monday through Saturday from 10:00 AM to 8:00 PM.' },
  { label: '💳 UPI Payment', text: '💳 You can pay securely via UPI to ID: itechnicmobiles@upi or scan our store QR code.' },
  { label: '🛡️ 90-Day Warranty', text: '🛡️ All certified display and battery repairs at iTechnic Mobiles include a 90-Day Comprehensive Warranty with free testing.' },
  { label: '🚚 Doorstep Pickup', text: '🚚 Doorstep device pickup & return is available across Pondicherry. Reply with your location or preferred time!' }
];

const TEMPLATE_OPTIONS = [
  {
    id: 'repair_booking_confirmed',
    name: 'Repair Booking Confirmed',
    category: 'UTILITY',
    vars: ['Customer Name', 'Job ID', 'Device', 'Service', 'Turnaround'],
    defaults: (c) => [c.name || 'Customer', 'REP-' + Math.floor(1000 + Math.random() * 9000), c.device_model || 'Apple iPhone 13', 'Screen Replacement', 'Same Day']
  },
  {
    id: 'repair_status_update',
    name: 'Repair Status Update',
    category: 'UTILITY',
    vars: ['Customer Name', 'Job ID', 'Device', 'Status'],
    defaults: (c) => [c.name || 'Customer', 'REP-1024', c.device_model || 'iPhone', 'In Repair (Technician diagnosing display)']
  },
  {
    id: 'repair_ready_pickup',
    name: 'Device Ready for Pickup',
    category: 'UTILITY',
    vars: ['Customer Name', 'Device', 'Job ID', 'Total Amount (₹)'],
    defaults: (c) => [c.name || 'Customer', c.device_model || 'iPhone 13', 'REP-1024', '3500']
  },
  {
    id: 'doorstep_pickup_confirmed',
    name: 'Doorstep Pickup Scheduled',
    category: 'UTILITY',
    vars: ['Customer Name', 'Request ID', 'Device', 'Slot', 'Address'],
    defaults: (c) => [c.name || 'Customer', 'PU-' + Math.floor(100 + Math.random() * 900), c.device_model || 'OnePlus 11', 'Today, 3:00 PM – 5:00 PM', 'Pondicherry']
  },
  {
    id: 'service_quotation_estimate',
    name: 'Service Quotation',
    category: 'UTILITY',
    vars: ['Customer Name', 'Device', 'Job ID', 'Issue', 'Quoted Cost (₹)'],
    defaults: (c) => [c.name || 'Customer', c.device_model || 'Samsung S21', 'REP-1024', 'Display Touch Replacement', '4500']
  },
  {
    id: 'itechnic_welcome_greeting',
    name: 'Welcome Greeting',
    category: 'MARKETING',
    vars: ['Customer Name'],
    defaults: (c) => [c.name || 'Customer']
  },
  {
    id: 'customer_feedback_review',
    name: 'Customer Feedback / Review',
    category: 'MARKETING',
    vars: ['Customer Name', 'Device', 'Job ID'],
    defaults: (c) => [c.name || 'Customer', c.device_model || 'iPhone 13', 'REP-1024']
  },
  {
    id: 'promotional_offer_broadcast',
    name: 'Promotional Offer Broadcast',
    category: 'MARKETING',
    vars: ['Customer Name', 'Offer Title', 'Discount %', 'Valid Until'],
    defaults: (c) => [c.name || 'Customer', 'Weekend Mega Repair Discount', '25%', 'this Sunday']
  },
  {
    id: 'festival_discount_promo',
    name: 'Festival Discount Promo',
    category: 'MARKETING',
    vars: ['Customer Name', 'Discount Desc', 'Promo Code', 'Valid Until'],
    defaults: (c) => [c.name || 'Customer', 'Flat 20%', 'FESTIVE20', '31st October']
  },
  {
    id: 'service_discount_broadcast',
    name: 'Express Service Discount',
    category: 'MARKETING',
    vars: ['Customer Name', 'Starting Price', 'Offer Detail'],
    defaults: (c) => [c.name || 'Customer', '499', 'Free Tempered Glass with screen replacement']
  }
];

function ContactDetail({ 
  contact, 
  apiUrl,
  analytics,
  contacts,
  onSelectContact,
  onNavigateTab,
  onOpenBroadcast,
  onDelete, 
  onToggleBot, 
  onResolveTicket, 
  onUpdateOrderStatus,
  onUpdateRepairStatus,
  onSendRepairQuote,
  onSendWarranty,
  onSendMessage,
  onUpdateLeadStatus,
  onCreateRepair,
  onRefreshContact,
  isSidebarOpen,
  onToggleSidebar,
  loading 
}) {
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef(null);

  // Direct Message Sending State
  const [messageInput, setMessageInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showCanned, setShowCanned] = useState(false);

  // Send Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_OPTIONS[0]);
  const [templateVars, setTemplateVars] = useState([]);
  const [sendingTemplate, setSendingTemplate] = useState(false);

  // New Repair Modal State
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairData, setRepairData] = useState({
    deviceBrand: 'Apple',
    deviceModel: '',
    serviceName: 'Display Replacement',
    issueDescription: 'Cracked screen / Touch not working',
    estimatedCost: '3500',
    turnaroundTime: 'Same Day'
  });
  const [creatingRepair, setCreatingRepair] = useState(false);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current && activeTab === 'chat') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contact?.messages, activeTab]);

  // When opening template modal, initialize default variables
  const handleOpenTemplateModal = () => {
    const tpl = TEMPLATE_OPTIONS[0];
    setSelectedTemplate(tpl);
    setTemplateVars(tpl.defaults(contact || {}));
    setShowTemplateModal(true);
  };

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setTemplateVars(tpl.defaults(contact || {}));
  };

  // Submit direct message
  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sendingMsg) return;
    setSendingMsg(true);
    const success = await onSendMessage(contact.phone, messageInput.trim());
    if (success) {
      setMessageInput('');
    }
    setSendingMsg(false);
  };

  // Submit Template to WhatsApp
  const handleDispatchTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || sendingTemplate) return;
    setSendingTemplate(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/messages/send-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({
          to: contact.phone,
          templateName: selectedTemplate.id,
          bodyVariables: templateVars
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ Template "${selectedTemplate.name}" dispatched to +${contact.phone}!`);
        setShowTemplateModal(false);
        if (onRefreshContact) onRefreshContact();
      } else {
        alert(`❌ Failed: ${data.error?.message || data.error || 'Failed to dispatch template'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSendingTemplate(false);
    }
  };

  // Submit New Repair
  const handleCreateNewRepair = async (e) => {
    e.preventDefault();
    if (creatingRepair) return;
    setCreatingRepair(true);
    const success = await onCreateRepair(contact.phone, repairData);
    if (success) {
      setShowRepairModal(false);
      setActiveTab('repairs');
    }
    setCreatingRepair(false);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-xl flex items-center justify-center border border-gray-100 h-[600px] md:h-auto z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-wa-green border-t-transparent rounded-full animate-spin"></div>
          <div className="font-bold text-wa-teal text-base">Retrieving Contact details...</div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex-1 bg-white rounded-xl flex flex-col relative shadow-sm border border-gray-100 h-[600px] md:h-auto overflow-hidden z-10">
        <ExecutiveDashboard
          analytics={analytics}
          contacts={contacts}
          onSelectContact={onSelectContact}
          onNavigateTab={onNavigateTab}
          onOpenBroadcast={onOpenBroadcast}
          isCompact={true}
        />
      </div>
    );
  }

  const repairsCount = contact.repairs?.length || 0;
  const pickupsCount = contact.pickup_requests?.length || 0;
  const tradeinsCount = contact.tradein_evaluations?.length || 0;

  return (
    <div className="flex-1 bg-white rounded-xl flex flex-col relative shadow-sm border border-gray-100 h-[600px] md:h-auto overflow-hidden">
      
      {/* Customer Summary Header */}
      <div className="bg-white px-5 py-3.5 border-b border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-3 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-wa-teal/10 text-wa-teal flex items-center justify-center font-bold text-lg shrink-0 border border-wa-teal/20 shadow-xs">
            {contact.name ? contact.name.charAt(0).toUpperCase() : 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-gray-900">{contact.name || contact.phone}</h2>
              {contact.is_paused && (
                <span className="flex h-2 w-2 relative" title="Bot Paused - Human Takeover Active">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span>+{contact.phone}</span>
              <span>•</span>
              <span className="text-[11px] text-gray-400">
                Last seen: {formatLastSeen(contact.lastSeen)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lead Status Selector */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
            <select
              value={contact.lead_status || 'New'}
              onChange={(e) => onUpdateLeadStatus && onUpdateLeadStatus(contact.phone, e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="New">New Lead</option>
              <option value="Inquired">Inquired</option>
              <option value="Repair Booked">Repair Booked</option>
              <option value="In Repair">In Repair</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Delivered">Delivered</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>

          {/* Quick WhatsApp Web Chat Link */}
          <a
            href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
            title="Open in WhatsApp Web"
          >
            <span>💬</span> WhatsApp Web
          </a>

          {/* New Repair Button */}
          <button
            onClick={() => {
              setRepairData(prev => ({
                ...prev,
                deviceModel: contact.device_model || '',
                deviceBrand: contact.device_brand || 'Apple'
              }));
              setShowRepairModal(true);
            }}
            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
            title="Register a new repair ticket"
          >
            <span>🛠️</span> + Repair
          </button>

          {/* Instant Template Dispatcher */}
          <button
            onClick={handleOpenTemplateModal}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
            title="Send pre-approved Meta Template message"
          >
            <span>📱</span> Send Template
          </button>

          {/* Toggle Sidebar Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs ${
                isSidebarOpen
                  ? 'bg-slate-800 text-white border-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Toggle Customer Intelligence Sidebar"
            >
              <span>👤</span>
              <span className="hidden xl:inline">{isSidebarOpen ? 'Hide Sidebar' : 'Customer Info'}</span>
            </button>
          )}

          {/* Pause / Resume Bot */}
          {contact.is_paused ? (
            <button
              onClick={() => onToggleBot(contact.phone, true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            >
              ▶ Resume Bot
            </button>
          ) : (
            <button
              onClick={() => onToggleBot(contact.phone, false)}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              title="Pause AI Bot to talk to customer manually"
            >
              ⏸ Pause Bot (Takeover)
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selection Bar */}
      <div className="bg-gray-50 px-4 border-b border-gray-100 flex gap-1 scrollbar-none overflow-x-auto z-10">
        {[
          { id: 'chat', label: '💬 Chat' },
          { id: 'repairs', label: `🔧 Repairs (${repairsCount})` },
          { id: 'pickups', label: `🚚 Pickups (${pickupsCount})` },
          { id: 'tradeins', label: `📱 Trade-Ins (${tradeinsCount})` },
          { id: 'cart', label: `🛒 Cart (${contact.cart?.length || 0})` },
          { id: 'orders', label: `📦 Orders (${contact.orders?.length || 0})` },
          { id: 'tickets', label: `🎫 Tickets (${contact.tickets?.filter(t => t.status === 'Open').length || 0})` },
          { id: 'profile', label: '👤 CRM Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3.5 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-wa-teal border-wa-teal bg-white/50' 
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-gray-50">
        
        {/* TAB 1: CHAT HISTORY & LIVE AGENT INPUT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col relative bg-[#efeae2] h-full overflow-hidden">
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: 'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23075E54" fill-rule="evenodd"/%3E%3C/svg%3E\')' }}
            ></div>

            {/* Top Bot Header Banner */}
            <div className="bg-white/90 backdrop-blur-xs px-4 py-2 border-b border-gray-200/80 flex items-center justify-between z-10 shadow-xs">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="iTechnic Mobiles DP" className="w-6 h-6 rounded-full bg-white object-contain p-0.5 border border-wa-teal/30 shadow-xs" />
                <span className="font-bold text-xs text-wa-teal">iTechnic Mobiles WhatsApp Bot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                  contact.is_paused 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${contact.is_paused ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  {contact.is_paused ? 'Human Takeover Active' : 'AI Bot Active'}
                </span>
              </div>
            </div>

            {/* Chat Messages Scroll Window */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 z-10">
              {contact.messages && contact.messages.map((msg, idx) => {
                const isCustomer = msg.fromCustomer !== false;
                const isSystemAction = msg.text && (msg.text.startsWith('btn_') || msg.text.startsWith('cat_') || msg.text.startsWith('opt_') || msg.text.startsWith('srv_') || msg.text.startsWith('brand_') || msg.text.startsWith('quote_'));
                const isPhoto = msg.text === '[Photo/Image Sent]' || msg.mediaType === 'image';
                
                if (isSystemAction) {
                  return (
                    <div key={idx} className="max-w-[70%] px-3.5 py-1.5 rounded-2xl text-[11px] shadow-sm self-end bg-wa-teal/10 border border-wa-teal/20 text-wa-teal font-semibold relative text-center mb-1">
                      ⚡ Action: {msg.text}
                      <span className="block text-[8px] opacity-60 text-right mt-0.5">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  );
                }

                if (isPhoto) {
                  return (
                    <div 
                      key={idx}
                      className={`max-w-[75%] p-3 rounded-2xl text-xs shadow-sm relative ${
                        isCustomer 
                          ? 'self-start bg-white text-gray-800 rounded-tl-xs border border-gray-100' 
                          : 'self-end bg-[#d9fdd3] text-gray-800 rounded-tr-xs border border-[#c1eec1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-2xl">📷</span>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">Customer Attached Photo</p>
                          <p className="text-[10px] text-slate-500">Device / Fault Image Received</p>
                        </div>
                      </div>
                      <span className="block text-[9px] opacity-50 text-right mt-1 font-medium">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div 
                    key={idx}
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs shadow-sm relative leading-relaxed ${
                      isCustomer 
                        ? 'self-start bg-white text-gray-800 rounded-tl-xs border border-gray-100' 
                        : 'self-end bg-[#d9fdd3] text-gray-800 rounded-tr-xs border border-[#c1eec1]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] opacity-50 text-right mt-1 font-medium">
                      {formatTime(msg.time)}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Canned Responses Bar */}
            {showCanned && (
              <div className="bg-white border-t border-slate-200 p-2.5 z-20 shadow-md">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600">Quick Canned Replies:</span>
                  <button onClick={() => setShowCanned(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CANNED_RESPONSES.map((cr, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessageInput(cr.text);
                        setShowCanned(false);
                      }}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-md transition-colors text-slate-700"
                    >
                      {cr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Message Input Bar */}
            <form onSubmit={handleSendDirectMessage} className="bg-white p-2.5 border-t border-slate-200 flex items-center gap-2 z-20 shadow-xs">
              <button
                type="button"
                onClick={() => setShowCanned(!showCanned)}
                className="p-2 text-slate-500 hover:text-wa-teal hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Quick canned answers"
              >
                <span>⚡</span>
                <span className="hidden sm:inline text-[11px]">Quick Replies</span>
              </button>

              <button
                type="button"
                onClick={handleOpenTemplateModal}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Send pre-approved WhatsApp Template"
              >
                <span>📱</span>
                <span className="hidden sm:inline text-[11px]">Template</span>
              </button>

              <input
                type="text"
                placeholder={`Type WhatsApp reply to ${contact.name || contact.phone}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={sendingMsg || !messageInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {sendingMsg ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Send</span>
                    <span>➤</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REPAIR JOB CARDS */}
        {activeTab === 'repairs' && (
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <span>🔧</span> Repair Job Cards & Status Tracking
              </h3>
              <button
                onClick={() => setShowRepairModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                <span>+</span> New Repair
              </button>
            </div>

            {!contact.repairs || contact.repairs.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                <p>No repair job cards registered for this customer yet.</p>
                <button
                  onClick={() => setShowRepairModal(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                >
                  Create First Repair Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {contact.repairs.map((r) => {
                  const statusColors = {
                    'Received': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Diagnosing': 'bg-purple-50 text-purple-700 border-purple-200',
                    'In Repair': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Testing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    'Ready for Pickup': 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
                    'Delivered': 'bg-gray-100 text-gray-700 border-gray-200',
                    'Cancelled': 'bg-red-50 text-red-700 border-red-200'
                  };

                  return (
                    <div key={r.repairId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-50 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-wa-teal bg-wa-teal/10 px-2.5 py-1 rounded-md">{r.repairId}</span>
                          <span className="font-bold text-sm text-gray-800">{r.deviceBrand} {r.deviceModel}</span>
                        </div>
                        <span className={`text-[11px] font-bold py-1 px-3 rounded-full border ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
                          ● {r.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Service</span>
                          <span className="font-semibold text-gray-700">{r.serviceName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Estimated Cost</span>
                          <span className="font-bold text-gray-800">₹{r.quotedCost || r.estimatedCost}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Turnaround</span>
                          <span className="font-semibold text-gray-700">{r.turnaroundTime || 'Same Day'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Quote Status</span>
                          <span className="font-semibold text-gray-700">{r.quoteStatus || 'None'}</span>
                        </div>
                      </div>

                      {r.issueDescription && (
                        <p className="text-xs text-gray-600 bg-gray-50/50 p-2.5 rounded border border-gray-100">
                          <strong className="text-gray-700">Reported Issue:</strong> {r.issueDescription}
                        </p>
                      )}

                      {/* Technician Workflow Controls */}
                      <div className="pt-2 flex flex-wrap gap-2 items-center justify-between border-t border-gray-50">
                        <div className="flex flex-wrap gap-1.5">
                          {['Diagnosing', 'In Repair', 'Testing', 'Ready for Pickup', 'Delivered'].map((st) => (
                            <button
                              key={st}
                              disabled={r.status === st}
                              onClick={() => onUpdateRepairStatus && onUpdateRepairStatus(contact.phone, r.repairId, st)}
                              className={`text-[10px] font-bold py-1 px-2.5 rounded transition-all ${
                                r.status === st 
                                  ? 'bg-wa-teal text-white shadow-xs' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const amount = prompt("Enter quotation amount in ₹:", r.estimatedCost);
                              if (amount) {
                                const notes = prompt("Enter repair notes / component details:", "Original Screen Replacement");
                                onSendRepairQuote && onSendRepairQuote(contact.phone, r.repairId, amount, notes);
                              }
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            💰 Send Quote
                          </button>

                          <button
                            onClick={() => onSendWarranty && onSendWarranty(contact.phone, r.repairId)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            🛡️ Send Warranty
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOORSTEP PICKUP REQUESTS */}
        {activeTab === 'pickups' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>🚚</span> Doorstep Device Pickup & Drop Requests
            </h3>

            {!contact.pickup_requests || contact.pickup_requests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No doorstep pickup requests logged for this customer.
              </div>
            ) : (
              <div className="space-y-3">
                {contact.pickup_requests.map((p) => (
                  <div key={p.pickupId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-wa-teal bg-wa-teal/10 px-2 py-0.5 rounded">{p.pickupId}</span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">{p.status}</span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <p><strong>Device:</strong> {p.deviceBrand} {p.deviceModel}</p>
                      <p><strong>Pickup Address:</strong> {p.address}</p>
                      <p><strong>Preferred Time Slot:</strong> {p.timeSlot}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Requested: {new Date(p.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRADE-IN VALUATIONS */}
        {activeTab === 'tradeins' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>📱</span> Old Mobile Trade-In & Exchange Valuations
            </h3>

            {!contact.tradein_evaluations || contact.tradein_evaluations.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No old phone trade-in valuations evaluated.
              </div>
            ) : (
              <div className="space-y-3">
                {contact.tradein_evaluations.map((tr) => (
                  <div key={tr.evalId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{tr.evalId}</span>
                      <span className="font-extrabold text-emerald-600 text-sm">₹{tr.estimatedLow} – ₹{tr.estimatedHigh}</span>
                    </div>
                    <div className="text-xs text-gray-700">
                      <p><strong>Model:</strong> {tr.deviceModel || tr.deviceBrand}</p>
                      <p><strong>Physical Condition:</strong> {tr.conditionTier}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Evaluated: {new Date(tr.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CART */}
        {activeTab === 'cart' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>🛒</span> Active Shopping Cart
            </h3>
            {!contact.cart || contact.cart.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                Customer cart is currently empty.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                <div className="divide-y divide-gray-100">
                  {contact.cart.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-gray-400 text-[10px]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>📦</span> Product Orders & Accessory Sales
            </h3>
            {!contact.orders || contact.orders.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No accessory orders placed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {contact.orders.map((ord) => (
                  <div key={ord.orderId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{ord.orderId}</span>
                      <span className="font-bold text-emerald-600 text-xs">₹{ord.totalAmount}</span>
                    </div>
                    <p className="text-xs text-gray-600">Status: <strong>{ord.status}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>🎫</span> Customer Support Tickets
            </h3>
            {!contact.tickets || contact.tickets.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No support tickets raised for this contact.
              </div>
            ) : (
              <div className="space-y-3">
                {contact.tickets.map((t) => (
                  <div key={t.ticketId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{t.ticketId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'Open' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700"><strong>Subject:</strong> {t.subject}</p>
                    {t.status === 'Open' && (
                      <button
                        onClick={() => onResolveTicket && onResolveTicket(contact.phone, t.ticketId)}
                        className="mt-2 text-xs font-bold text-wa-teal hover:underline"
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: CRM PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>👤</span> Customer Master CRM Profile
            </h3>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">Language Preference</span>
                  <span className="font-bold text-gray-700 text-sm">
                    {contact.language === 'ta' ? '🇮🇳 Tamil / தமிழ்' : '🇬🇧 English'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">Loyalty Rewards Club</span>
                  <span className="font-extrabold text-amber-600 text-sm flex items-center gap-1">
                    🎁 {contact.loyaltyPoints || 0} pts <span className="text-[10px] text-gray-400 font-normal">(Value: ₹{contact.loyaltyPoints || 0})</span>
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">Lead Status Tag</span>
                  <span className="font-bold text-gray-700 text-sm">
                    {contact.lead_status || 'New'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">First Contacted</span>
                  <span className="text-gray-600">{formatDate(contact.firstSeen)}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">Last Interaction</span>
                  <span className="text-gray-600">{formatLastSeen(contact.lastSeen)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer bar */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between z-10 text-xs">
        <span className="text-slate-400 text-[11px]">
          Customer ID: <code className="font-mono text-slate-600">+{contact.phone}</code>
        </span>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this contact? This will delete all repair history and tickets!")) {
              onDelete(contact.phone);
            }
          }}
          className="bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold"
        >
          Delete Customer Contact
        </button>
      </div>

      {/* MODAL 1: SEND WHATSAPP TEMPLATE */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-wa-teal text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span>📱</span> Send Meta Approved Template
                </h3>
                <p className="text-xs opacity-85 mt-0.5">
                  To: +{contact.phone} ({contact.name || 'Customer'})
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-white/80 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Template:
                </label>
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const found = TEMPLATE_OPTIONS.find(t => t.id === e.target.value);
                    if (found) handleSelectTemplate(found);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Dynamic Variables Inputs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Template Parameters:
                </span>
                {selectedTemplate.vars.map((varName, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 w-32 shrink-0 truncate">
                      {`{{${idx + 1}}}`} {varName}:
                    </span>
                    <input
                      type="text"
                      required
                      value={templateVars[idx] || ''}
                      onChange={(e) => {
                        const updated = [...templateVars];
                        updated[idx] = e.target.value;
                        setTemplateVars(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTemplate}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sendingTemplate ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending to WhatsApp...
                    </>
                  ) : (
                    <>
                      <span>📨</span> Send to Customer WhatsApp
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW REPAIR JOB CARD */}
      {showRepairModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span>🛠️</span> Create Repair Job Card
                </h3>
                <p className="text-xs opacity-85 mt-0.5">
                  For: +{contact.phone} ({contact.name || 'Customer'})
                </p>
              </div>
              <button
                onClick={() => setShowRepairModal(false)}
                className="text-white/80 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewRepair} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <select
                    value={repairData.deviceBrand}
                    onChange={(e) => setRepairData({ ...repairData, deviceBrand: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Apple">Apple iPhone</option>
                    <option value="Samsung">Samsung</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi / Redmi">Xiaomi / Redmi</option>
                    <option value="Vivo / Oppo">Vivo / Oppo</option>
                    <option value="Google Pixel">Google Pixel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 Pro"
                    value={repairData.deviceModel}
                    onChange={(e) => setRepairData({ ...repairData, deviceModel: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                <select
                  value={repairData.serviceName}
                  onChange={(e) => setRepairData({ ...repairData, serviceName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Display Replacement">Display Replacement</option>
                  <option value="Battery Replacement">Battery Replacement</option>
                  <option value="Back Glass Replacement">Back Glass Replacement</option>
                  <option value="Charging Port Repair">Charging Port Repair</option>
                  <option value="Camera Lens Repair">Camera Lens Repair</option>
                  <option value="Motherboard Chip Level">Motherboard Chip Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  rows={2}
                  value={repairData.issueDescription}
                  onChange={(e) => setRepairData({ ...repairData, issueDescription: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={repairData.estimatedCost}
                    onChange={(e) => setRepairData({ ...repairData, estimatedCost: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround</label>
                  <select
                    value={repairData.turnaroundTime}
                    onChange={(e) => setRepairData({ ...repairData, turnaroundTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Same Day">Same Day</option>
                    <option value="Within 2 Hours">Within 2 Hours</option>
                    <option value="1-2 Days">1-2 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRepairModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRepair}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creatingRepair ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>✓</span> Create & Notify Customer
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

export default ContactDetail;
