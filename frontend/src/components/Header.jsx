import React from 'react';
import logoImg from '../assets/logo.png';

function Header({
  activeTab,
  onTabChange,
  contactCount,
  onRefresh,
  onOpenBroadcast,
  onUpdateDp,
  dpSyncing
}) {
  const navTabs = [
    { id: 'crm', label: 'CRM & Chats', icon: '💬' },
    { id: 'templates', label: 'Meta Templates', icon: '📱' },
    { id: 'creator', label: 'Create Template', icon: '✨' },
    { id: 'apidocs', label: 'API & Developer Hub', icon: '⚡' }
  ];

  return (
    <header className="bg-wa-teal text-white py-2.5 px-5 flex flex-wrap justify-between items-center shadow-md gap-3 border-b border-white/10">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <img 
          src={logoImg} 
          alt="iTechnic Mobiles Logo" 
          className="w-10 h-10 rounded-full bg-white object-contain p-0.5 border-2 border-white/30 shadow-md"
        />
        <div>
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            iTechnic Mobiles
            <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40">
              API & CRM Platform
            </span>
          </h1>
          <p className="text-[11px] opacity-85">{contactCount} customer contacts · WhatsApp Business API</p>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/10">
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-wa-teal shadow-md font-bold scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Buttons */}
      <div className="flex gap-2 items-center">
        <button 
          onClick={onUpdateDp}
          disabled={dpSyncing}
          className="bg-white/10 hover:bg-white/20 border border-white/20 py-1.5 px-3 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          title="Sync official WhatsApp Business Profile picture (DP) with iTechnic Mobiles Logo"
        >
          <img src={logoImg} alt="Logo" className="w-3.5 h-3.5 rounded-full bg-white object-contain p-0.5" />
          <span className="hidden sm:inline">{dpSyncing ? 'Syncing...' : 'Sync DP'}</span>
        </button>

        {activeTab === 'crm' && (
          <button 
            onClick={onOpenBroadcast}
            className="bg-white/10 hover:bg-white/20 border border-white/20 py-1.5 px-3 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <span>📣</span>
            <span className="hidden sm:inline">Broadcast</span>
          </button>
        )}

        <button 
          onClick={onRefresh}
          className="bg-white hover:bg-gray-100 text-wa-teal border-none py-1.5 px-3 rounded-lg transition-all text-xs font-bold shadow-sm flex items-center gap-1"
          title="Refresh current view"
        >
          <span>↻</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
