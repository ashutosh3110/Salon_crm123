import React from 'react';
        <div className="flex flex-col h-[calc(100vh-125px)] lg:h-[calc(100vh-115px)] mt-0 overflow-hidden bg-slate-50">
            {/* Top Bar: Outlet and Client */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
                {/* Outlet */}
                <div className="relative">
                    <button
                        onClick={() => !(appointmentId || orderId) && setShowOutletPickerMain(!showOutletPickerMain)}
                        className={`flex items-center gap-2 text-sm font-bold text-slate-800 ${(appointmentId || orderId) ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="uppercase tracking-tight">
                            {(() => {
                                const booking = appointmentId ? businessBookings?.find(b => b._id === appointmentId) : null;
                                const order = orderId ? businessOrders?.find(o => o._id === orderId) : null;
                                const bOutletId = (booking || order) ? (booking?.outletId?._id || booking?.outletId || order?.outletId?._id || order?.outletId) : activeOutletId;
                                const sel = outlets.find(o => String(o._id) === String(bOutletId));
                                return sel ? sel.name : 'Select Outlet';
                            })()}
                        </span>
                        {!(appointmentId || orderId) && <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    <AnimatePresence>
                        {showOutletPickerMain && !appointmentId && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[80] min-w-[200px]"
                            >
                                {outlets.map(o => (
                                    <button
                                        key={o._id}
                                        onClick={() => { setActiveOutletId(o._id); setShowOutletPickerMain(false); }}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold uppercase border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${String(o._id) === String(activeOutletId) ? 'text-primary bg-primary/5' : 'text-slate-800'}`}
                                    >
                                        {o.name}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Client Search */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-bold text-slate-600 text-sm uppercase tracking-widest">
                        <User className="w-4 h-4" /> Client
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedClient ? (
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-4 pr-1 py-1 shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 uppercase">{selectedClient.name}</span>
                                    <span className="text-[10px] text-slate-500 font-semibold">{maskPhone(selectedClient.phone, user?.role)}</span>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search client name or mobile..."
                                    value={searchClient}
                                    onChange={(e) => setSearchClient(e.target.value)}
                                    className="w-[280px] pl-10 pr-4 py-2 bg-white border border-slate-200 text-sm font-semibold rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                                />
                                <button 
                                    onClick={() => setShowNewClient(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden gap-6 p-4 lg:p-6 bg-slate-50">
                {/* ─── LEFT PANEL: Main Content ─── */}
                <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
                    
                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 shrink-0">
                        <button
                            onClick={() => {
                                setActiveTab('services');
                                setServiceMode('services');
                            }}
                            className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                                activeTab === 'services' && serviceMode === 'services'
                                    ? 'bg-[#B4912B] text-white'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <Scissors className="w-4 h-4" /> SERVICES
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('products');
                                setServiceMode('products');
                            }}
                            className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                                activeTab === 'products'
                                    ? 'bg-[#B4912B] text-white'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <Package className="w-4 h-4" /> PRODUCTS
                        </button>
                    </div>

                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4 shrink-0 px-2">
                        <div className="flex items-center gap-2">
                            <button className="text-slate-400 hover:text-slate-800 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">FACIAL SERVICES</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold shadow-inner">
                                {filteredItems.length} Services
                            </span>
                            <button className="text-slate-400 hover:text-slate-800 transition-colors">
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 custom-scrollbar pr-2">
                        {filteredItems.map((item, idx) => {
                            const isSelected = item.isAppointment
                                ? selectedBookingIds.includes(item._id)
                                : item.isOrder
                                    ? selectedOrderIds.includes(item._id)
                                    : cart.some(c => String(c.itemId) === String(item._id || item.id));
                            
                            return (
                                <button
                                    key={item.id || item._id}
                                    onClick={() => addToCart(item)}
                                    className={`bg-white rounded-xl p-4 flex items-start gap-4 text-left hover:shadow-md transition-all active:scale-95 border ${
                                        isSelected ? 'border-[#B4912B] shadow-sm ring-1 ring-[#B4912B]/50' : 'border-slate-200'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#fdfaf2] border border-[#f3e7c8] flex items-center justify-center shrink-0 overflow-hidden text-[#B4912B]">
                                        {/* Mocking icons based on name slightly, or just generic */}
                                        <Sparkles className="w-6 h-6 opacity-80" />
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1 truncate">{item.name}</h4>
                                        <p className="text-[10px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
                                            <span className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center text-[7px]">🕒</span>
                                            {item.duration || 60} min
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 mt-auto">₹{item.price}</p>
                                    </div>
                                </button>
                            );
                        })}
                        {/* Add Custom Service Button */}
                        <button
                            className="bg-white rounded-xl p-4 flex items-center justify-center gap-3 text-left hover:bg-slate-50 transition-all border-2 border-dashed border-[#B4912B]/30 h-full min-h-[100px]"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#fdfaf2] text-[#B4912B] flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#B4912B]">Add Custom Service</span>
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mt-4 shrink-0">
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <p className="text-[10px] font-semibold text-slate-500 mb-1">Today's Sales</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-lg font-bold text-slate-900">₹12,650</h3>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+24.5%</span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">vs yesterday</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <p className="text-[10px] font-semibold text-slate-500 mb-1">Invoices</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-lg font-bold text-slate-900">18</h3>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+12</span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">vs yesterday</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <p className="text-[10px] font-semibold text-slate-500 mb-1">Average Bill Value</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-lg font-bold text-slate-900">₹702</h3>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+8.5%</span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">vs yesterday</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <p className="text-[10px] font-semibold text-slate-500 mb-2">Top Service</p>
                            <div className="w-8 h-8 rounded-full bg-[#fdfaf2] border border-[#f3e7c8] flex items-center justify-center text-[#B4912B] mb-2">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h3 className="text-[11px] font-bold text-slate-900 leading-tight">Facial O3+ Whitening</h3>
                            <p className="text-[9px] text-slate-400 mt-1">4 Bills</p>
                        </div>
                    </div>

                    {/* Summary Totals & Payment Row */}
                    <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between shrink-0 overflow-x-auto gap-4">
                        <div className="flex gap-6 shrink-0">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">SUBTOTAL</span>
                                <span className="text-sm font-bold text-slate-900">₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">CGST ({(totals.serviceGstRate)/2}%)</span>
                                <span className="text-sm font-bold text-slate-900">₹{totals.cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">SGST ({(totals.serviceGstRate)/2}%)</span>
                                <span className="text-sm font-bold text-slate-900">₹{totals.sgst.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Tag className="w-3 h-3 text-rose-400"/> DISCOUNT</span>
                                <span className="text-sm font-bold text-slate-900">₹{totals.discount.toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 shrink-0 pl-6 border-l border-slate-200">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">PAYMENT DATE</span>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white w-[130px]">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <input 
                                        type="date" 
                                        className="w-full text-xs font-bold outline-none text-slate-800 bg-transparent"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">CASH PAYMENT</span>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white w-[120px]">
                                    <Banknote className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-400">₹</span>
                                    <input 
                                        type="number" 
                                        className="w-full text-xs font-bold outline-none text-slate-800 bg-transparent"
                                        value={payments[0]?.amount || ''}
                                        onChange={(e) => updatePayment(0, 'amount', Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">ONLINE/UPI</span>
                                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white w-[120px]">
                                    <Smartphone className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-400">₹</span>
                                    <input 
                                        type="number" 
                                        className="w-full text-xs font-bold outline-none text-slate-800 bg-transparent"
                                        value={payments[1]?.amount || ''}
                                        onChange={(e) => updatePayment(1, 'amount', Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT PANEL: Cart & Checkout ─── */}
                <div className="w-[380px] lg:w-[420px] flex flex-col h-full overflow-hidden shrink-0">
                    <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                            <ShoppingBag className="w-4 h-4" /> CART ITEMS ({cart.length})
                        </h3>
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Collapse
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-4">
                        {cart.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs font-bold uppercase tracking-widest">Cart is Empty</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col relative">
                                    {/* Item Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xs font-bold text-slate-900 pr-8">{item.name}</h4>
                                        <button 
                                            onClick={() => removeItem(idx)}
                                            className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Price/Tax/Qty/Discount Grid */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">PRICE</span>
                                            <span className="text-xs font-bold text-slate-900">₹{item.price}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TAX</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded text-center w-fit">
                                                {item.isInclusiveTax ? 'INCL' : `${totals.serviceGstRate}%`}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">QTY</span>
                                            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden h-6 w-16">
                                                <button onClick={() => updateQty(idx, -1)} className="w-5 h-full hover:bg-slate-50 flex items-center justify-center text-slate-500"><Minus className="w-2.5 h-2.5"/></button>
                                                <span className="flex-1 text-[10px] font-bold text-center border-x border-slate-200">{item.quantity}</span>
                                                <button onClick={() => updateQty(idx, 1)} className="w-5 h-full hover:bg-slate-50 flex items-center justify-center text-slate-500"><Plus className="w-2.5 h-2.5"/></button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">DISCOUNT</span>
                                            <div className="flex items-center border border-slate-200 rounded-md h-6 w-[70px] bg-white">
                                                <button className="px-1.5 text-[9px] font-bold text-slate-500 border-r border-slate-200 bg-slate-50">%</button>
                                                <input type="number" className="w-full text-[10px] font-bold text-center outline-none bg-transparent" placeholder="0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assign Stylists */}
                                    <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <User className="w-3 h-3 text-slate-400" /> ASSIGN STYLISTS
                                        </span>
                                        <div className="relative">
                                            <button 
                                                onClick={() => setOpenStaffIdx(openStaffIdx === idx ? null : idx)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-600 hover:border-slate-300 transition-colors"
                                            >
                                                {(item.staffIds || []).length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.staffIds.map(sId => {
                                                            const s = staff.find(st => String(st._id) === String(sId));
                                                            return (
                                                                <span key={sId} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                                    {s?.name} <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={(e) => { e.stopPropagation(); toggleStaffInItem(idx, sId); }}/>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    "Select Stylists"
                                                )}
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <AnimatePresence>
                                                {openStaffIdx === idx && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden max-h-48 custom-scrollbar"
                                                    >
                                                        {staff.map(s => (
                                                            <button 
                                                                key={s._id}
                                                                onClick={() => { toggleStaffInItem(idx, s._id); setOpenStaffIdx(null); }}
                                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold border-b border-slate-100 last:border-0"
                                                            >
                                                                {s.name}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        <button className="w-full border border-dashed border-slate-300 rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:bg-white transition-colors bg-white/50">
                            <FileText className="w-4 h-4" /> + Add Note (Optional)
                        </button>
                    </div>

                    {/* Dark Checkout Widget */}
                    <div className="bg-[#0f172a] rounded-2xl p-5 shadow-2xl shrink-0 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NET BILL</span>
                                <span className="text-xl font-bold text-white">₹{totals.total.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-[#cca839] uppercase tracking-widest mb-1">TOTAL TO PAY</span>
                                <span className="text-xl font-bold text-[#cca839]">₹{totals.totalWithPrevDue.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={isProcessing || cart.length === 0}
                            className="w-full py-4 bg-[#B4912B] hover:bg-[#9a7b24] disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#B4912B]/20 flex items-center justify-center gap-3 relative z-10"
                        >
                            <CreditCard className="w-5 h-5" /> FINALIZE BILL
                        </button>

                        <div className="grid grid-cols-4 gap-2 mt-4 relative z-10">
                            <button className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                <Banknote className="w-3.5 h-3.5" /> CASH
                            </button>
                            <button className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                <CreditCard className="w-3.5 h-3.5" /> CARD
                            </button>
                            <button className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                <Smartphone className="w-3.5 h-3.5" /> UPI
                            </button>
                            <button className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                <Wallet className="w-3.5 h-3.5" /> WALLET
                            </button>
                        </div>
                    </div>
                </div>
            </div>
