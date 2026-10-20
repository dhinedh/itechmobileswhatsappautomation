import React, { useState, useRef, useEffect } from 'react';
import { formatDate, formatTime, formatLastSeen } from '../utils/formatters';
import logoImg from '../assets/logo.png';

function ContactDetail({ 
  contact, 
  onDelete, 
  onToggleBot, 
  onResolveTicket, 
  onUpdateOrderStatus,
  onUpdateRepairStatus,
  onSendRepairQuote,
  onSendWarranty,
  loading 
}) {
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current && activeTab === 'chat') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contact?.messages, activeTab]);

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
      <div className="flex-1 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 h-[600px] md:h-auto text-gray-400 text-center p-6 z-10">
        <img src={logoImg} alt="iTechnic Mobiles Logo" className="w-20 h-20 mb-4 rounded-full bg-white object-contain p-2 shadow-md animate-pulse" />
        <h2 className="text-xl font-bold mb-2 text-gray-700">No Customer Selected</h2>
        <p className="text-sm max-w-xs text-gray-400">Click on a contact from the list to manage their chat, repairs, doorstep pickups, and support tickets.</p>
      </div>
    );
  }

  const cartSubtotal = contact.cart ? contact.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const repairsCount = contact.repairs?.length || 0;
  const pickupsCount = contact.pickup_requests?.length || 0;
  const tradeinsCount = contact.tradein_evaluations?.length || 0;

  return (
    <div className="flex-1 bg-white rounded-xl flex flex-col relative shadow-sm border border-gray-100 h-[600px] md:h-auto overflow-hidden">
      
      {/* Customer Summary Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-wa-teal/10 text-wa-teal flex items-center justify-center font-bold text-lg shrink-0 border border-wa-teal/20">
            {contact.name ? contact.name.charAt(0).toUpperCase() : 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-gray-800">{contact.name || contact.phone}</h2>
              {contact.is_paused && (
                <span className="flex h-2 w-2 relative" title="Bot Paused - Human Takeover">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">+{contact.phone}</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          {contact.is_paused ? (
            <button
              onClick={() => onToggleBot(contact.phone, true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all"
            >
              ▶ Resume Chatbot
            </button>
          ) : (
            <button
              onClick={() => onToggleBot(contact.phone, false)}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all animate-pulse"
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
            className={`py-3 px-3.5 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap ${
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
        
        {/* TAB 1: CHAT HISTORY */}
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
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Bot Active
              </span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-2.5 z-10">
              {contact.messages && contact.messages.map((msg, idx) => {
                const isCustomer = msg.fromCustomer !== false;
                const isSystemAction = msg.text && (msg.text.startsWith('btn_') || msg.text.startsWith('cat_') || msg.text.startsWith('opt_') || msg.text.startsWith('srv_') || msg.text.startsWith('brand_') || msg.text.startsWith('quote_'));
                
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
          </div>
        )}

        {/* TAB 2: REPAIR JOB CARDS */}
        {activeTab === 'repairs' && (
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <span>🔧</span> Repair Job Cards & Status Tracking
              </h3>
            </div>

            {!contact.repairs || contact.repairs.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No repair job cards registered for this customer yet.
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

        {/* TAB 5: ACCESSORIES CART */}
        {activeTab === 'cart' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>🛒</span> Active Shopping Cart
            </h3>
            
            {!contact.cart || contact.cart.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                Customer's shopping cart is currently empty.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {contact.cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.price}</td>
                        <td className="p-3 text-right font-bold">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/50 font-bold">
                      <td colSpan="3" className="p-3 text-right text-gray-500 uppercase tracking-wider">Subtotal:</td>
                      <td className="p-3 text-right text-wa-teal text-sm">₹{cartSubtotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: STORE ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <span>📦</span> Accessories Store Orders
            </h3>
            
            {!contact.orders || contact.orders.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No store orders placed by this customer yet.
              </div>
            ) : (
              <div className="space-y-4">
                {contact.orders.map((order) => (
                  <div key={order.orderId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-50 pb-3">
                      <div>
                        <span className="font-bold text-sm text-gray-800">{order.orderId}</span>
                        <span className="text-[10px] text-gray-400 ml-2">({new Date(order.createdAt).toLocaleDateString('en-GB')})</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold uppercase ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 py-0.5 px-2 rounded-full">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items && order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-medium text-gray-800">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">Total Amount:</span>
                      <span className="font-extrabold text-sm text-wa-teal">₹{order.total}</span>
                    </div>

                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <div className="pt-2 flex gap-2 justify-end border-t border-gray-50">
                        {order.status === 'Placed' && (
                          <button
                            onClick={() => onUpdateOrderStatus(contact.phone, order.orderId, 'Dispatched')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            🚚 Mark Dispatched
                          </button>
                        )}
                        {order.status === 'Dispatched' && (
                          <button
                            onClick={() => onUpdateOrderStatus(contact.phone, order.orderId, 'Delivered')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            ✔ Mark Delivered
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateOrderStatus(contact.phone, order.orderId, 'Cancelled')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold py-1 px-2.5 rounded transition-all"
                        >
                          ❌ Cancel Order
                        </button>
                      </div>
                    )}
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
              <span>🎫</span> Support Tickets
            </h3>
            
            {!contact.tickets || contact.tickets.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                No support tickets raised by this customer.
              </div>
            ) : (
              <div className="space-y-3">
                {contact.tickets.map((t) => (
                  <div key={t.ticketId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-gray-100 text-gray-600 py-0.5 px-2 rounded">{t.ticketId}</span>
                        <span className={`text-[9px] font-bold uppercase py-0.5 px-1.5 rounded ${
                          t.status === 'Open' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 pt-1">{t.subject}</p>
                      <p className="text-[10px] text-gray-400">Created: {new Date(t.createdAt).toLocaleString('en-IN')}</p>
                    </div>

                    {t.status === 'Open' && (
                      <button
                        onClick={() => onResolveTicket(contact.phone, t.ticketId)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-1 px-3 rounded-lg border border-emerald-100 transition-colors shrink-0"
                      >
                        ✔ Resolve
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
              <span>👤</span> Customer CRM Metadata
            </h3>
            
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider">Marketing Consent</span>
                  <span className={`inline-block font-bold text-xs py-1 px-2.5 rounded-full ${
                    contact.consent === true ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    contact.consent === false ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-gray-50 text-gray-500 border border-gray-100'
                  }`}>
                    {contact.consent === true ? '✅ Subscribed' : contact.consent === false ? '🚫 Guest Mode' : '❓ Unknown'}
                  </span>
                </div>
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

      {/* Delete Contact Footer bar */}
      <div className="p-4 bg-white border-t border-gray-100 text-right z-10">
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this contact? This will delete all repair history and tickets!")) {
              onDelete(contact.phone);
            }
          }}
          className="bg-white text-danger border border-danger hover:bg-danger hover:text-white px-4 py-2 rounded-lg transition-colors text-xs font-semibold"
        >
          Delete Customer Contact
        </button>
      </div>
    </div>
  );
}

export default ContactDetail;
