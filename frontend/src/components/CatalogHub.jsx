import React, { useState, useEffect, useMemo } from 'react';

function CatalogHub({ apiUrl }) {
  const [subTab, setSubTab] = useState('smartphones'); // 'smartphones' | 'accessories' | 'offers'
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [accCatFilter, setAccCatFilter] = useState('ALL');

  // Edit stock/price modal
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ price: 0, offerPrice: 0, stock: 0, inStock: true });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, offRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/products`, { headers: { 'x-requested-from': 'internal-dashboard' } }),
        fetch(`${apiUrl}/api/v1/offers`, { headers: { 'x-requested-from': 'internal-dashboard' } })
      ]);

      const prodData = await prodRes.json();
      const offData = await offRes.json();

      if (prodData.success && Array.isArray(prodData.products)) {
        setProducts(prodData.products);
      }
      if (offData.success && Array.isArray(offData.offers)) {
        setOffers(offData.offers);
      }
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  // Toggle offer active status
  const handleToggleOffer = async (offerId, currentActive) => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify({ isActive: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        setOffers(prev => prev.map(o => o.offerId === offerId ? { ...o, isActive: !currentActive } : o));
      }
    } catch (err) {
      alert('Failed to toggle offer status');
    }
  };

  // Save product adjustments
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/products/${editProduct.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-from': 'internal-dashboard'
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.productId === editProduct.productId ? { ...p, ...productForm } : p));
        setEditProduct(null);
      }
    } catch (err) {
      alert('Failed to update product');
    }
  };

  // Filtered smartphones
  const smartphones = useMemo(() => {
    return products.filter(p => {
      const isPhone = p.category === 'Smartphone' || !p.compatibleModels;
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.specs?.processor && p.specs.processor.toLowerCase().includes(q))
      );
      const matchBrand = brandFilter === 'ALL' || (p.brand || '').toUpperCase() === brandFilter.toUpperCase();
      return isPhone && matchSearch && matchBrand;
    });
  }, [products, searchQuery, brandFilter]);

  // Filtered accessories
  const accessories = useMemo(() => {
    return products.filter(p => {
      const isAcc = p.category !== 'Smartphone' && p.category !== undefined;
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
      const matchCat = accCatFilter === 'ALL' || (p.category || '').toLowerCase().includes(accCatFilter.toLowerCase());
      return isAcc && matchSearch && matchCat;
    });
  }, [products, searchQuery, accCatFilter]);

  const brands = ['ALL', 'Apple', 'Samsung', 'OnePlus', 'Vivo', 'Oppo', 'Xiaomi', 'Realme'];
  const accCategories = ['ALL', 'Cases', 'Charger', 'Earbuds', 'Glass', 'Power Bank', 'Smartwatch'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-5 gap-4">
      {/* Top Banner & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🏷️</span> Catalog & Offers Master
            <span className="text-xs font-semibold bg-wa-teal/10 text-wa-teal px-2 py-0.5 rounded-full border border-wa-teal/20">
              Pillars 1, 3 & 4 Inventory
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time stock controls, smartphone spec matrices, accessories, and active bank cashback promotions.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('smartphones')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'smartphones' ? 'bg-white text-wa-teal shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>📱</span> Smartphones ({smartphones.length})
          </button>
          <button
            onClick={() => setSubTab('accessories')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'accessories' ? 'bg-white text-wa-teal shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🎧</span> Accessories ({accessories.length})
          </button>
          <button
            onClick={() => setSubTab('offers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'offers' ? 'bg-white text-wa-teal shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>💳</span> Bank Offers & EMI ({offers.length})
          </button>
        </div>
      </div>

      {/* 1. SMARTPHONES VIEW */}
      {subTab === 'smartphones' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search phones by model, brand, processor, camera..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white text-gray-800"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-gray-400 font-semibold mr-1">Brand:</span>
              {brands.map(b => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                    brandFilter === b ? 'bg-wa-teal text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Smartphones Grid */}
          <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
            {smartphones.map(phone => (
              <div
                key={phone.productId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-wa-teal/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-wa-teal bg-wa-teal/10 px-2 py-0.5 rounded border border-wa-teal/20">
                        {phone.brand}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mt-1">{phone.name}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (phone.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {(phone.stock || 0) > 0 ? `${phone.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-black text-gray-900">
                      ₹{(phone.offerPrice || phone.price || 0).toLocaleString()}
                    </span>
                    {phone.offerPrice && phone.price > phone.offerPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{phone.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Key Specs */}
                  {phone.specs && (
                    <div className="mt-3 space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] text-gray-600">
                      <div>⚡ {phone.specs.processor}</div>
                      <div>📸 {phone.specs.rearCamera}</div>
                      <div>🔋 {phone.specs.battery}</div>
                      <div>💾 {phone.specs.ram} / {phone.specs.storage}</div>
                    </div>
                  )}

                  {/* Benchmark Scores */}
                  {phone.scores && (
                    <div className="mt-2.5 flex flex-wrap gap-1 text-[10px]">
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                        📷 Cam: {phone.scores.camera}
                      </span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                        🎮 Game: {phone.scores.gaming}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        🔋 Bat: {phone.scores.battery}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">{phone.productId}</span>
                  <button
                    onClick={() => {
                      setEditProduct(phone);
                      setProductForm({
                        price: phone.price || 0,
                        offerPrice: phone.offerPrice || phone.price || 0,
                        stock: phone.stock || 0,
                        inStock: phone.isActive !== false
                      });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                  >
                    Edit Stock / Price ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. ACCESSORIES VIEW */}
      {subTab === 'accessories' && (
        <>
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search accessories (covers, chargers, glass, audio)..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green focus:bg-white text-gray-800"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-gray-400 font-semibold mr-1">Category:</span>
              {accCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setAccCatFilter(c)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                    accCatFilter === c ? 'bg-wa-teal text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-3 gap-4 pr-1">
            {accessories.map(acc => (
              <div
                key={acc.productId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-wa-teal/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {acc.category}
                      </span>
                      <h4 className="font-bold text-gray-900 text-xs mt-1.5">{acc.name}</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {acc.stock || 15} left
                    </span>
                  </div>

                  <div className="text-base font-black text-gray-900 mt-2">
                    ₹{(acc.price || 0).toLocaleString()}
                  </div>

                  {acc.features && (
                    <div className="mt-2 text-[11px] text-gray-500">
                      {acc.features.slice(0, 2).map((f, i) => (
                        <div key={i}>• {f}</div>
                      ))}
                    </div>
                  )}

                  {acc.compatibleModels && (
                    <div className="mt-2 text-[10px] text-gray-400">
                      Compatible: {acc.compatibleModels.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">{acc.productId}</span>
                  <button
                    onClick={() => {
                      setEditProduct(acc);
                      setProductForm({
                        price: acc.price || 0,
                        offerPrice: acc.offerPrice || acc.price || 0,
                        stock: acc.stock || 0,
                        inStock: acc.isActive !== false
                      });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded text-xs"
                  >
                    Edit ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 3. BANK OFFERS & EMI VIEW */}
      {subTab === 'offers' && (
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map(offer => (
              <div
                key={offer.offerId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-wa-teal/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-wa-teal bg-wa-teal/10 px-2 py-0.5 rounded border border-wa-teal/20">
                      {offer.bankName || offer.category}
                    </span>
                    <button
                      onClick={() => handleToggleOffer(offer.offerId, offer.isActive)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        offer.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-gray-100 text-gray-500 border-gray-300'
                      }`}
                    >
                      {offer.isActive !== false ? '● ACTIVE PROMO' : '○ PAUSED'}
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mt-2">{offer.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{offer.description}</p>

                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount Benefit:</span>
                      <span className="font-bold text-emerald-700">₹{(offer.discountAmount || 0).toLocaleString()} instant benefit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min. Transaction:</span>
                      <span className="font-medium text-gray-800">₹{(offer.minPurchaseAmount || 0).toLocaleString()}</span>
                    </div>
                    {offer.noCostEmiTenures && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">No Cost EMI:</span>
                        <span className="font-bold text-wa-teal">{offer.noCostEmiTenures.join(', ')} Months Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] text-gray-400 flex items-center justify-between">
                  <span>Expires: {offer.validTill ? new Date(offer.validTill).toLocaleDateString() : 'Dec 31, 2026'}</span>
                  <span className="font-mono">{offer.offerId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-wa-teal text-white p-4">
              <h3 className="font-bold text-sm">Edit Inventory: {editProduct.name}</h3>
              <p className="text-[10px] opacity-80 mt-0.5">{editProduct.productId}</p>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Standard MRP Price (₹)</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Special Offer Price (₹)</label>
                <input
                  type="number"
                  value={productForm.offerPrice}
                  onChange={(e) => setProductForm({ ...productForm, offerPrice: Number(e.target.value) })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-wa-green font-bold text-emerald-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded text-wa-teal"
                />
                <label htmlFor="inStockCheck" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Available in Showroom & WhatsApp Bot
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-wa-teal hover:bg-wa-teal/90 rounded-lg font-bold shadow-sm"
                >
                  Save Changes 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogHub;

