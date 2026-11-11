import React, { useState, useEffect, useMemo } from 'react';
import { FALLBACK_LEADS } from '../mockData';

function LeadsHub({ apiUrl }) {
  const [leads, setLeads] = useState(FALLBACK_LEADS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [prefFilter, setPrefFilter] = useState('ALL');
  
  // Modal states
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const [waMessageText, setWaMessageText] = useState('');
  const [sendingWa, setSendingWa] = useState(false);

  // New Lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    customerName: '',
    customerPhone: '',
    targetDevice: '',
    budgetRange: '₹20,000 - ₹40,000',
    purchasePreference: 'Visit Showroom',
    notesText: ''
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/leads`, {
        headers: { 'x-requested-from': 'internal-dashboard' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads) && data.leads.length > 0) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.warn('Backend leads API not ready yet, using CRM buyer pipeline:', err.message);
      setLeads(FALLBACK_LEADS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [apiUrl]);

  // Status badge colors
  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'new':
        return 'bg-blue-500/15 text-blue-700 border-blue-300';
      case 'assigned':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      case 'contacted':
        return 'bg-purple-500/15 text-purple-700 border-purple-300';
      case 'converted':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300';
      case 'lost':
        return 'bg-gray-400/15 text-gray-600 border-gray-300';
      default:
        return 'bg-blue-500/15 text-blue-700 border-blue-300';
    }
  };

  // Update lead status
  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => l.leadId === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead && selectedLead.leadId === leadId) {
          setSelectedLead(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Add note to lead
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/${selectedLead.leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({ noteText: newNote.trim() })
      });
      const data = await res.json();
      if (data.success) {
        const updatedNotes = [...(selectedLead.notes || []), { text: newNote.trim(), author: 'Admin', createdAt: new Date() }];
        setSelectedLead({ ...selectedLead, notes: updatedNotes });
        setLeads(prev => prev.map(l => l.leadId === selectedLead.leadId ? { ...l, notes: updatedNotes } : l));
        setNewNote('');
      }
    } catch (err) {
      alert('Failed to add note');
    }
  };

  // Create manual lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.customerPhone || !newLeadForm.customerName) {
      alert('Customer Name and Mobile are required.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify(newLeadForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Sales lead created and assigned successfully!');
        setShowCreateModal(false);
        setNewLeadForm({
          customerName: '',
          customerPhone: '',
          targetDevice: '',
          budgetRange: '₹20,000 - ₹40,000',
          purchasePreference: 'Visit Showroom',
          notesText: ''
        });
        fetchLeads();
      } else {
        alert(data.error || 'Failed to create lead');
      }
    } catch (err) {
      alert('Network error creating lead');
    }
  };

  // Send WhatsApp message to lead
  const handleSendWa = async (e) => {
    e.preventDefault();
    if (!waMessageText.trim() || !selectedLead) return;

    setSendingWa(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/${selectedLead.leadId}/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({ messageText: waMessageText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ WhatsApp message sent to ${selectedLead.customerName}!`);
        setShowWaModal(false);
        setWaMessageText('');
      } else {
        alert(data.error || 'Failed to send WhatsApp message');
      }
    } catch (err) {
      alert('Error sending WhatsApp message');
    } finally {
      setSendingWa(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: leads.length,
      newCount: leads.filter(l => (l.status || '').toLowerCase() === 'new').length,
      assignedCount: leads.filter(l => (l.status || '').toLowerCase() === 'assigned' || (l.status || '').toLowerCase() === 'contacted').length,
      convertedCount: leads.filter(l => (l.status || '').toLowerCase() === 'converted').length,
      lostCount: leads.filter(l => (l.status || '').toLowerCase() === 'lost').length,
    };
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        (lead.leadId && lead.leadId.toLowerCase().includes(q)) ||
        (lead.customerName && lead.customerName.toLowerCase().includes(q)) ||
        (lead.customerPhone && lead.customerPhone.includes(q)) ||
        (lead.targetDevice && lead.targetDevice.toLowerCase().includes(q))
      );

      const matchStatus = statusFilter === 'ALL' || (lead.status || '').toUpperCase() === statusFilter;
      const matchPref = prefFilter === 'ALL' || (lead.purchasePreference || '').toLowerCase().includes(prefFilter.toLowerCase());

      return matchSearch && matchStatus && matchPref;
    });
  }, [leads, searchQuery, statusFilter, prefFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-5 gap-4">
      {/* Top Banner & KPI Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🎯</span> Sales Leads & Commerce Pipeline
            <span className="text-xs font-semibold bg-wa-teal/10 text-wa-teal px-2 py-0.5 rounded-full border border-wa-teal/20">
              Pillar 1, 3 & 4 Lead Intake
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-captured from WhatsApp mobile buyer wizard, EMI inquiries, and accessory orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-wa-teal hover:bg-wa-teal/90 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>➕</span>
            <span>Manual Lead Entry</span>
          </button>
          <button
            onClick={fetchLeads}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1"
            title="Refresh Leads"
          >
            <span>↻</span>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Leads</span>
          <span className="text-2xl font-black text-gray-800 mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">New Inquiries</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{stats.newCount}</span>
        </div>
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{stats.assignedCount}</span>
        </div>
        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Converted Sales</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.convertedCount}</span>
        </div>
        <div className="bg-gray-100/70 p-3.5 rounded-xl border border-gray-300 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">Archived / Lost</span>
          <span className="text-2xl font-black text-gray-600 mt-1 block">{stats.lostCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by customer name, mobile, lead ID, or model..."
            className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white text-gray-800"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-400 font-semibold mr-1">Status:</span>
          {['ALL', 'NEW', 'ASSIGNED', 'CONTACTED', 'CONVERTED', 'LOST'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                statusFilter === st
                  ? 'bg-wa-teal text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Preference filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-400 font-semibold">Preference:</span>
          <select
            value={prefFilter}
            onChange={(e) => setPrefFilter(e.target.value)}
            className="text-[11px] p-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium text-gray-700 focus:border-wa-green"
          >
            <option value="ALL">All Preferences</option>
            <option value="Showroom">Showroom Visit</option>
            <option value="Delivery">Home Delivery</option>
            <option value="Callback">Request Callback</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table / Grid */}
      <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-gray-400">
            <span>⏳ Loading sales pipeline leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-sm font-semibold text-gray-700">No sales leads found matching criteria</p>
            <p className="text-xs text-gray-400 mt-1">Customers browsing phones on WhatsApp will automatically populate here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200 text-[10px]">
                <th className="p-3">Lead Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Interested In</th>
                <th className="p-3">Preference</th>
                <th className="p-3">Assigned Rep</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map(lead => (
                <tr key={lead.leadId} className="hover:bg-slate-50/70 transition-colors">
                  {/* Lead ID */}
                  <td className="p-3">
                    <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                      {lead.leadId}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-1">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                  </td>

                  {/* Customer Info */}
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{lead.customerName}</div>
                    <a
                      href={`https://wa.me/${lead.customerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wa-teal hover:underline font-mono text-[11px] flex items-center gap-1 mt-0.5"
                    >
                      <span>💬</span> +{lead.customerPhone}
                    </a>
                  </td>

                  {/* Target Device */}
                  <td className="p-3">
                    <div className="font-semibold text-gray-800">{lead.targetDevice || 'Mobile Purchase'}</div>
                    <div className="text-[10px] text-gray-500">
                      Budget: {lead.budgetRange || 'Not specified'} · {lead.targetDevicePrice ? `₹${lead.targetDevicePrice.toLocaleString()}` : ''}
                    </div>
                  </td>

                  {/* Preference */}
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {lead.purchasePreference?.includes('Showroom') ? '📍 Showroom' :
                       lead.purchasePreference?.includes('Delivery') ? '🚚 Delivery' : '📞 Callback'}
                    </span>
                  </td>

                  {/* Assigned Executive */}
                  <td className="p-3">
                    <div className="font-medium text-gray-800">{lead.assignedExecutive?.name || 'Karthik Raja'}</div>
                    <div className="text-[10px] text-gray-400 font-mono">+{lead.assignedExecutive?.phone || '919342400879'}</div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-3">
                    <select
                      value={(lead.status || 'New').toLowerCase()}
                      onChange={(e) => handleUpdateStatus(lead.leadId, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${getStatusBadge(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="assigned">Assigned</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setWaMessageText(`Hi ${lead.customerName}! This is ${lead.assignedExecutive?.name || 'Karthik'} from iTechnic Mobiles regarding your interest in the ${lead.targetDevice || 'mobile phone'}. Would you like to schedule a visit to our showroom today?`);
                        setShowWaModal(true);
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold px-2.5 py-1 rounded-md text-[11px] transition-all"
                      title="Send WhatsApp Follow-up"
                    >
                      WhatsApp 🚀
                    </button>
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2.5 py-1 rounded-md text-[11px] transition-all"
                      title="View Details & Notes"
                    >
                      Details & Notes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Details & Notes Drawer / Modal */}
      {selectedLead && !showWaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="bg-wa-teal text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>📱</span> Lead Dossier: {selectedLead.leadId}
                </h3>
                <p className="text-[11px] opacity-80">{selectedLead.customerName} · +{selectedLead.customerPhone}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-white/80 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Summary details */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Interest Category</span>
                  <span className="font-semibold text-gray-800">{selectedLead.interestType || 'Mobile Purchase'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Preferred Model</span>
                  <span className="font-bold text-wa-teal">{selectedLead.targetDevice || 'Open'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Budget Bracket</span>
                  <span className="font-medium text-gray-700">{selectedLead.budgetRange || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Fulfillment Preference</span>
                  <span className="font-medium text-gray-700">{selectedLead.purchasePreference || 'Visit Showroom'}</span>
                </div>
              </div>

              {/* Status and rep assignment */}
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Assigned Executive</span>
                  <span className="font-semibold text-gray-800">{selectedLead.assignedExecutive?.name} (+{selectedLead.assignedExecutive?.phone})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">Pipeline Status</span>
                  <select
                    value={(selectedLead.status || 'New').toLowerCase()}
                    onChange={(e) => handleUpdateStatus(selectedLead.leadId, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded border outline-none ${getStatusBadge(selectedLead.status)}`}
                  >
                    <option value="new">New</option>
                    <option value="assigned">Assigned</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              {/* Notes History */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <span>📝</span> Internal Notes & Follow-up Log
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                    <p className="text-gray-400 italic text-[11px]">No notes logged yet.</p>
                  ) : (
                    selectedLead.notes.map((note, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                          <span className="font-semibold text-gray-600">{note.author || 'Executive'}</span>
                          <span>{note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                        </div>
                        <p className="text-gray-800">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new update note..."
                    className="flex-1 text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-wa-green text-gray-800"
                  />
                  <button
                    type="submit"
                    className="bg-wa-teal hover:bg-wa-teal/90 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <a
                href={`https://wa.me/${selectedLead.customerPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <span>💬</span> Open WhatsApp
              </a>
              <button
                onClick={() => setSelectedLead(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1.5 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Modal */}
      {showWaModal && selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-emerald-600 text-white p-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>💬</span> Send WhatsApp Follow-up
              </h3>
              <p className="text-[11px] opacity-85 mt-0.5">
                To: {selectedLead.customerName} (+{selectedLead.customerPhone})
              </p>
            </div>

            <form onSubmit={handleSendWa} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Message Content
                </label>
                <textarea
                  rows="4"
                  required
                  value={waMessageText}
                  onChange={(e) => setWaMessageText(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-wa-green resize-none text-gray-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWaModal(false)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingWa}
                  className="px-4 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {sendingWa ? 'Sending...' : 'Send Message 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Lead Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-wa-teal text-white p-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>➕</span> Manual Sales Lead Capture
              </h3>
              <p className="text-[11px] opacity-85 mt-0.5">
                Register walk-in, phone inquiry, or trade-in lead.
              </p>
            </div>

            <form onSubmit={handleCreateLead} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Babu"
                  value={newLeadForm.customerName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, customerName: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Customer Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 919342400879"
                  value={newLeadForm.customerPhone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, customerPhone: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Target Phone Model</label>
                <input
                  type="text"
                  placeholder="e.g. Apple iPhone 16 Pro 256GB"
                  value={newLeadForm.targetDevice}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, targetDevice: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Budget</label>
                  <select
                    value={newLeadForm.budgetRange}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budgetRange: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white"
                  >
                    <option value="Under ₹15,000">Under ₹15,000</option>
                    <option value="₹15,000 - ₹25,000">₹15,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹45,000">₹25,000 - ₹45,000</option>
                    <option value="Above ₹45,000">Above ₹45,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Preference</label>
                  <select
                    value={newLeadForm.purchasePreference}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, purchasePreference: e.target.value })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white"
                  >
                    <option value="Visit Showroom">Visit Showroom</option>
                    <option value="Home Delivery">Home Delivery</option>
                    <option value="Request Callback">Request Callback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Initial Notes</label>
                <textarea
                  rows="2"
                  placeholder="Customer requirements, trade-in details..."
                  value={newLeadForm.notesText}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notesText: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-wa-teal hover:bg-wa-teal/90 rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Save Lead & Assign 🎯
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadsHub;

