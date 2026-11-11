import React, { useState, useEffect, useMemo } from 'react';

const ORDER_STAGES = [
  { id: 'order_confirmed', label: 'Confirmed', icon: '📝' },
  { id: 'processing', label: 'Processing', icon: '⚙️' },
  { id: 'shipped', label: 'Shipped', icon: '📦' },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', icon: '✅' }
];

function OrdersHub({ apiUrl }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Edit modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    orderStatus: '',
    trackingNumber: '',
    courierPartner: '',
    assignedRider: { name: '', phone: '' }
  });
  const [sendingNotification, setSendingNotification] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/v1/orders`, {
        headers: { 'x-requested-from': 'internal-dashboard' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [apiUrl]);

  // Stage index helper (0 to 4)
  const getStageIndex = (status) => {
    const norm = (status || '').toLowerCase().replace(/\s+/g, '_');
    const idx = ORDER_STAGES.findIndex(s => s.id === norm);
    return idx !== -1 ? idx : 0;
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const norm = (status || '').toLowerCase().replace(/\s+/g, '_');
    switch (norm) {
      case 'order_confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'processing':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Quick update status
  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // Save full order fulfillment details
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/orders/${selectedOrder.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Order dispatch details updated!');
        setOrders(prev => prev.map(o => o.orderId === selectedOrder.orderId ? { ...o, ...editForm } : o));
        setSelectedOrder(null);
      }
    } catch (err) {
      alert('Error updating order details');
    }
  };

  // Send WhatsApp order status update notification to customer
  const handleSendStatusWhatsApp = async (order) => {
    if (!window.confirm(`Send WhatsApp tracking update to ${order.customerName} (${order.customerPhone})?`)) {
      return;
    }

    setSendingNotification(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/orders/${order.orderId}/send-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        }
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ WhatsApp tracking timeline sent to ${order.customerName}!`);
      } else {
        alert(data.error || 'Failed to send WhatsApp update');
      }
    } catch (err) {
      alert('Network error sending WhatsApp update');
    } finally {
      setSendingNotification(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    return {
      total: orders.length,
      confirmed: orders.filter(o => (o.orderStatus || '').toLowerCase().includes('confirm')).length,
      processing: orders.filter(o => (o.orderStatus || '').toLowerCase().includes('process')).length,
      shipped: orders.filter(o => (o.orderStatus || '').toLowerCase().includes('ship')).length,
      outForDelivery: orders.filter(o => (o.orderStatus || '').toLowerCase().includes('out')).length,
      delivered: orders.filter(o => (o.orderStatus || '').toLowerCase().includes('deliver')).length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        (order.orderId && order.orderId.toLowerCase().includes(q)) ||
        (order.customerName && order.customerName.toLowerCase().includes(q)) ||
        (order.customerPhone && order.customerPhone.includes(q)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q))
      );

      const norm = (order.orderStatus || '').toLowerCase().replace(/\s+/g, '_');
      const matchStatus = statusFilter === 'ALL' || norm.includes(statusFilter.toLowerCase());

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-5 gap-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📦</span> Order Tracking & Logistics Desk
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Pillar 2 WhatsApp Fulfillment
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            5-stage live milestone tracker, courier airway bill sync, and instant WhatsApp status dispatcher.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>↻</span>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
          <span className="text-2xl font-black text-gray-800 mt-0.5 block">{stats.total}</span>
        </div>
        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">1. Confirmed</span>
          <span className="text-2xl font-black text-blue-700 mt-0.5 block">{stats.confirmed}</span>
        </div>
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">2. Processing</span>
          <span className="text-2xl font-black text-amber-700 mt-0.5 block">{stats.processing}</span>
        </div>
        <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">3. In Transit</span>
          <span className="text-2xl font-black text-indigo-700 mt-0.5 block">{stats.shipped}</span>
        </div>
        <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 shadow-sm">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">4. Out for Del.</span>
          <span className="text-2xl font-black text-purple-700 mt-0.5 block">{stats.outForDelivery}</span>
        </div>
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">5. Delivered</span>
          <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{stats.delivered}</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by Order ID (ORD-1082), customer name, phone, or tracking..."
            className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white text-gray-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-400 font-semibold mr-1">Milestone:</span>
          {['ALL', 'CONFIRM', 'PROCESS', 'SHIP', 'OUT', 'DELIVER'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                statusFilter === f
                  ? 'bg-wa-teal text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Container */}
      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
            <span>⏳ Fetching order tracking records...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-gray-200">
            <span className="text-4xl block mb-2">📦</span>
            <p className="text-sm font-semibold text-gray-700">No customer orders found</p>
            <p className="text-xs text-gray-400 mt-1">Orders checked by customers via WhatsApp (Option 2) will appear here.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const currentStageIdx = getStageIndex(order.orderStatus);

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-wa-teal/40 transition-all flex flex-col gap-3"
              >
                {/* Header row: Order ID, Customer info, Total */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm bg-gray-100 px-2.5 py-1 rounded text-gray-900 border border-gray-200">
                      {order.orderId}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                        {order.customerName}
                        <span className="text-[10px] font-normal text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Active'}
                        </span>
                      </h4>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <a
                          href={`https://wa.me/${order.customerPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-wa-teal hover:underline font-mono"
                        >
                          +{order.customerPhone}
                        </a>
                        <span>·</span>
                        <span className="font-medium text-gray-600">{order.deliveryType || 'Home Delivery'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900 block">
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </span>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </div>

                    {/* Quick stage selector */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleQuickStatusChange(order.orderId, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${getStatusBadge(order.orderStatus)}`}
                    >
                      <option value="Order Confirmed">1. Order Confirmed</option>
                      <option value="Processing">2. Processing</option>
                      <option value="Shipped">3. Shipped</option>
                      <option value="Out for Delivery">4. Out for Delivery</option>
                      <option value="Delivered">5. Delivered</option>
                    </select>
                  </div>
                </div>

                {/* 5-Stage Visual Stepper */}
                <div className="py-1">
                  <div className="grid grid-cols-5 gap-1.5 relative">
                    {ORDER_STAGES.map((stage, idx) => {
                      const isCompleted = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={stage.id} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-wa-teal text-white ring-4 ring-wa-teal/20 scale-105'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            {isCompleted ? '✓' : stage.icon}
                          </div>
                          <span className={`text-[10px] mt-1 font-semibold leading-tight ${
                            isCurrent ? 'text-wa-teal font-bold' : isCompleted ? 'text-emerald-700' : 'text-gray-400'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items & Logistics Bar */}
                <div className="bg-slate-50/80 rounded-lg p-2.5 border border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Items list */}
                  <div className="flex-1 min-w-[260px]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Ordered Items</span>
                    <div className="space-y-0.5">
                      {order.items && order.items.map((it, i) => (
                        <div key={i} className="text-[11px] text-gray-800 flex items-center gap-1.5">
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold">{it.productName}</span>
                          <span className="text-gray-500">× {it.quantity || 1}</span>
                          <span className="text-gray-400 font-mono text-[10px]">(₹{it.price?.toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Courier & Rider Info */}
                  <div className="text-[11px] text-gray-600 border-l border-gray-200 pl-3 space-y-0.5">
                    <div>
                      <span className="text-gray-400 font-medium">Carrier:</span>{' '}
                      <span className="font-bold text-gray-800">{order.courierPartner || 'Showroom Logistics'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">AWB Tracking:</span>{' '}
                      <span className="font-mono font-bold text-wa-teal">{order.trackingNumber || 'Pending'}</span>
                    </div>
                    {order.assignedRider?.name && (
                      <div>
                        <span className="text-gray-400 font-medium">Rider:</span>{' '}
                        <span className="font-medium text-gray-800">{order.assignedRider.name} ({order.assignedRider.phone})</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendStatusWhatsApp(order)}
                      disabled={sendingNotification}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      title="Send 5-stage tracking progress to customer WhatsApp"
                    >
                      <span>💬</span>
                      <span>Notify WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setEditForm({
                          orderStatus: order.orderStatus || 'Processing',
                          trackingNumber: order.trackingNumber || '',
                          courierPartner: order.courierPartner || 'Professional Couriers',
                          assignedRider: order.assignedRider || { name: '', phone: '' }
                        });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all"
                    >
                      Dispatch Settings
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Fulfillment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-wa-teal text-white p-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>🚚</span> Dispatch & Carrier Setup
              </h3>
              <p className="text-[11px] opacity-85 mt-0.5">
                Order: {selectedOrder.orderId} · {selectedOrder.customerName}
              </p>
            </div>

            <form onSubmit={handleSaveDetails} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Order Status Milestone</label>
                <select
                  value={editForm.orderStatus}
                  onChange={(e) => setEditForm({ ...editForm, orderStatus: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green font-semibold"
                >
                  <option value="Order Confirmed">1. Order Confirmed</option>
                  <option value="Processing">2. Processing</option>
                  <option value="Shipped">3. Shipped</option>
                  <option value="Out for Delivery">4. Out for Delivery</option>
                  <option value="Delivered">5. Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Courier Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Professional Couriers, ST Courier, Dunzo"
                  value={editForm.courierPartner}
                  onChange={(e) => setEditForm({ ...editForm, courierPartner: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Tracking / AWB Number</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-982310"
                  value={editForm.trackingNumber}
                  onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Rider Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh"
                    value={editForm.assignedRider?.name || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      assignedRider: { ...(editForm.assignedRider || {}), name: e.target.value }
                    })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Rider Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 919876543210"
                    value={editForm.assignedRider?.phone || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      assignedRider: { ...(editForm.assignedRider || {}), phone: e.target.value }
                    })}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-wa-teal hover:bg-wa-teal/90 rounded-lg font-bold shadow-sm"
                >
                  Save Dispatch Settings 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersHub;

