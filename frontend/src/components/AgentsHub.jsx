import React, { useState, useEffect } from 'react';

function AgentsHub({ apiUrl }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/v1/agents`, {
        headers: { 'x-requested-from': 'internal-dashboard' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [apiUrl]);

  // Toggle online/offline status
  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/agents/${agentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({ isOnline: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAgents(prev => prev.map(a => a.agentId === agentId ? { ...a, isOnline: !currentStatus } : a));
      }
    } catch (err) {
      alert('Failed to update agent status');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-5 gap-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>👨‍💼</span> Human Agent Desk & Live Support Roster
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Pillar 5 Human Handoff Engine
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Controls real-time live chat availability. When an agent is <strong>Online</strong>, customers on WhatsApp are routed to live chat. When <strong>Offline</strong>, the bot captures Callback Tickets (<code>CB-XXXX</code>).
          </p>
        </div>

        <button
          onClick={fetchAgents}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>↻</span>
          <span>Sync Status</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200 p-3.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h4 className="font-bold text-gray-900">Live WhatsApp Chat Routing Rules</h4>
            <p className="text-gray-600 text-[11px] mt-0.5">
              • <strong>Online:</strong> Customer receives direct contact card and live agent WhatsApp link.<br />
              • <strong>Offline:</strong> Bot automatically records customer details, creates a CRM Callback Ticket with SLA, and notifies the manager.
            </p>
          </div>
        </div>
      </div>

      {/* Agents Roster Cards */}
      <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-sm text-gray-400">
            <span>⏳ Fetching store agents roster...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400">
            No agents found.
          </div>
        ) : (
          agents.map(agent => (
            <div
              key={agent.agentId}
              className={`bg-white rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between ${
                agent.isOnline ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-gray-200'
              }`}
            >
              <div>
                {/* Status indicator and department badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wa-teal bg-wa-teal/10 px-2 py-0.5 rounded border border-wa-teal/20">
                    {agent.department}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    agent.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    {agent.isOnline ? 'LIVE ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                {/* Agent Profile */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-lg font-black text-gray-700">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{agent.name}</h3>
                    <div className="text-[11px] text-gray-500">{agent.role || 'Support Representative'}</div>
                    <a
                      href={`https://wa.me/${agent.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wa-teal hover:underline font-mono text-[11px] flex items-center gap-1 mt-0.5"
                    >
                      <span>💬</span> +{agent.phone}
                    </a>
                  </div>
                </div>

                {/* Chat Concurrency Meter */}
                <div className="mt-4 bg-slate-50 p-2.5 rounded-lg border border-gray-100 text-xs">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-500">Active Conversations:</span>
                    <span className="font-bold text-gray-800">{agent.activeChats || 0} / {agent.maxConcurrent || 5}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (agent.activeChats || 0) >= (agent.maxConcurrent || 5) ? 'bg-rose-500' : 'bg-wa-teal'
                      }`}
                      style={{ width: `${Math.min(100, (((agent.activeChats || 0) / (agent.maxConcurrent || 5)) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Toggle Switch */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">{agent.agentId}</span>
                <button
                  onClick={() => handleToggleStatus(agent.agentId, agent.isOnline)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                    agent.isOnline
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <span>{agent.isOnline ? '🔴 Go Offline' : '🟢 Go Online'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AgentsHub;

