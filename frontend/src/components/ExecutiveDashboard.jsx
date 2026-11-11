import React from 'react';
import logoImg from '../assets/logo.png';
import { formatLastSeen } from '../utils/formatters';

function ExecutiveDashboard({
  analytics = {},
  contacts = [],
  onSelectContact,
  onNavigateTab,
  onOpenBroadcast,
  isCompact = false
}) {
  const revenue = analytics.totalRevenue || 11193.9;
  const activeOrdersCount = analytics.activeOrders !== undefined ? analytics.activeOrders : 6;
  const consentRate = analytics.consentRate || 86;
  const openTickets = analytics.openTickets || 0;
  const totalContactsCount = contacts.length || analytics.totalContacts || 7;

  // Recent 4 active contacts with activity
  const recentContacts = contacts.slice(0, 4);

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto ${isCompact ? 'p-4 gap-4' : 'p-6 gap-6'} bg-slate-50/70`}>
      
      {/* 1. Header Banner & Store Status */}
      <div className="bg-gradient-to-r from-wa-teal via-teal-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-teal-700/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={logoImg} 
            alt="iTechnic Mobiles" 
            className="w-14 h-14 rounded-full bg-white object-contain p-1 border-2 border-emerald-400 shadow-md shrink-0" 
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">iTechnic Mobiles Operations Control Center</h2>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Meta Verified API Live
              </span>
            </div>
            <p className="text-xs text-teal-100/80 mt-1">
              TV Malai Road, Tirukannur, Pondicherry - 605501 · WABA ID: <code>1758570912097342</code> · Hotline: +91 9361863063
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>📢</span> WhatsApp Broadcast
            </button>
          )}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('apidocs')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-2 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>⚡</span> AiSensy API
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Performance Metrics (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Sales Revenue</span>
            <span className="text-emerald-600 bg-emerald-50 p-1 rounded-md text-sm">💰</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
              ₹{Number(revenue).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>↑ Verified Sales</span> · <span>Store & Delivery</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Repairs & Orders</span>
            <span className="text-teal-600 bg-teal-50 p-1 rounded-md text-sm">🔧</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
              {activeOrdersCount}
            </div>
            <div className="text-[11px] text-teal-700 font-medium mt-1">
              Live in Service Desk
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Customer Opt-In Rate</span>
            <span className="text-blue-600 bg-blue-50 p-1 rounded-md text-sm">📈</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
              {consentRate}%
            </div>
            <div className="text-[11px] text-blue-700 font-medium mt-1">
              {totalContactsCount} Total WhatsApp Contacts
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Open Tickets & SLA</span>
            <span className="text-rose-600 bg-rose-50 p-1 rounded-md text-sm">🎫</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {openTickets}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span>✓ 100% Resolved SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Pipelines: Repair Lifecycle & Sales Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Repair Desk Lifecycle Stepper */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>🔧</span> Repair Service Desk Pipeline
              </h3>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                5-Stage Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Every stage automatically triggers pre-approved WhatsApp notification templates to customers.
            </p>

            {/* Stepper Progress */}
            <div className="grid grid-cols-5 gap-1.5 mt-4 text-center">
              {[
                { stage: 'Received', count: 1, color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
                { stage: 'Diagnosing', count: 1, color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
                { stage: 'In Repair', count: 2, color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
                { stage: 'Testing QA', count: 1, color: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
                { stage: 'Ready Pickup', count: 1, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' }
              ].map((step, idx) => (
                <div key={idx} className={`p-2 rounded-xl border ${step.color} flex flex-col items-center justify-between`}>
                  <div className={`w-2 h-2 rounded-full ${step.dot} mb-1`}></div>
                  <span className="text-base font-extrabold">{step.count}</span>
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5 leading-tight">{step.stage}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Next Pickup Slot: Today 4:00 PM – 5:00 PM</span>
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('orders')}
                className="text-teal-700 hover:text-teal-800 font-bold hover:underline flex items-center gap-1"
              >
                View Repair Cards &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Retail Order Fulfillment Stepper */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>📦</span> Retail Orders & Doorstep Dispatch
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Courier AWB
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Dispatch orders with live courier airway bill tracking, rider phone number, and digital invoice.
            </p>

            {/* Stepper Progress */}
            <div className="grid grid-cols-5 gap-1.5 mt-4 text-center">
              {[
                { stage: 'Confirmed', count: 1, color: 'bg-slate-100 text-slate-800 border-slate-200' },
                { stage: 'Processing', count: 1, color: 'bg-blue-50 text-blue-800 border-blue-200' },
                { stage: 'Shipped', count: 0, color: 'bg-amber-50 text-amber-800 border-amber-200' },
                { stage: 'Out Delivery', count: 1, color: 'bg-purple-50 text-purple-800 border-purple-200' },
                { stage: 'Delivered', count: 1, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
              ].map((step, idx) => (
                <div key={idx} className={`p-2 rounded-xl border ${step.color} flex flex-col items-center justify-between`}>
                  <span className="text-base font-extrabold">{step.count}</span>
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5 leading-tight">{step.stage}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Assigned Rider: Karthik Raja (+91 9361863063)</span>
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('orders')}
                className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
              >
                Track Shipments &rarr;
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 4. Active Inquiries & Recent Customer Activity */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>💬</span> Recent Customer WhatsApp Inquiries
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any customer card to open their two-way live chat and manage repair job cards.
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs text-wa-teal font-bold hover:underline"
            >
              View All Inquiries & Leads &rarr;
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {recentContacts.map(c => {
            const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
            return (
              <div
                key={c.phone}
                onClick={() => onSelectContact && onSelectContact(c.phone)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-wa-teal hover:shadow-sm transition-all cursor-pointer bg-slate-50/50 hover:bg-white flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-wa-teal text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-wa-teal transition-colors">
                          {c.name || c.phone}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">+{c.phone}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                      {c.lead_status || 'Customer'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 bg-white p-2 rounded-lg border border-slate-100">
                    {lastMsg ? lastMsg.text : 'No messages logged yet'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatLastSeen(c.lastSeen)}</span>
                  <span className="text-wa-teal font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Open Chat &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Shortcut Station to Platform Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {[
          { label: 'Sales Leads', icon: '🎯', tab: 'leads', desc: 'Buyer pipeline' },
          { label: 'Orders & Tracking', icon: '📦', tab: 'orders', desc: 'Courier AWB' },
          { label: 'Catalog & Stock', icon: '🏷️', tab: 'catalog', desc: 'iPhone stock' },
          { label: 'Support Roster', icon: '👨‍💼', tab: 'agents', desc: 'Live agents' },
          { label: 'Meta Templates', icon: '📱', tab: 'templates', desc: 'Approved msgs' },
          { label: 'AiSensy API Hub', icon: '⚡', tab: 'apidocs', desc: 'POST /campaign' }
        ].map(item => (
          <button
            key={item.tab}
            onClick={() => onNavigateTab && onNavigateTab(item.tab)}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-wa-teal hover:shadow-xs transition-all text-left flex flex-col justify-between group"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-wa-teal">{item.label}</div>
              <div className="text-[10px] text-slate-400">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}

export default ExecutiveDashboard;
