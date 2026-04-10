
import dashData from '../../data/mock/admin_dashboard.json';
import bizData from '../../data/mock/admin_business.json';
import authData from '../../data/authMockData.json';
import subscriptionData from '../../data/subscriptionPlans.json';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get local data to simulate persistence
const getLocal = (key, def = []) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : def;
    } catch (e) {
        return def;
    }
};
const saveLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const mockGet = async (url) => {
    await delay();
    if (url.startsWith('/payroll/period')) {
        const year = new URLSearchParams(url.split('?')[1]).get('year');
        const month = new URLSearchParams(url.split('?')[1]).get('month');
        const meta = getLocal(`hr_payroll_meta_${year}_${month}`, { locked: false });
        return { data: { success: true, data: meta } };
    }
    if (url.startsWith('/payroll/entries')) {
        const year = new URLSearchParams(url.split('?')[1]).get('year');
        const month = new URLSearchParams(url.split('?')[1]).get('month');
        const entries = getLocal(`hr_payroll_${year}_${month}`, []);
        return { data: { success: true, results: entries } };
    }
    if (url === '/loyalty/membership/active') {
        return { data: { _id: 'm1', name: 'Silver Member', benefits: ['10% OFF on all services'] } };
    }
    if (url.startsWith('/bookings/availability')) {
        return { data: { bookings: [] } };
    }


    if (url === '/finance/dashboard-summary') {
        const expenses = getLocal('fin_expenses', []);
        const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const baseRev = 450000;
        
        return {
            data: {
                success: true,
                data: {
                    totalRevenue: baseRev,
                    totalExpenses: 125000 + totalExp,
                    netProfit: baseRev - (125000 + totalExp),
                    trendData: [
                        { name: 'Jan', income: 380000, expenses: 110000 },
                        { name: 'Feb', income: 420000, expenses: 115000 },
                        { name: 'Mar', income: 450000, expenses: 125000 },
                    ],
                    expenseSplits: [
                        { name: 'Inventory', value: 40, color: 'var(--primary)' },
                        { name: 'Salaries', value: 35, color: '#f59e0b' },
                        { name: 'Marketing', value: 15, color: '#ec4899' },
                        { name: 'Rent/Utilities', value: 10, color: '#ef4444' },
                    ],
                    recentTransactions: [
                        { id: 'INV-8821', desc: 'Rahul Sharma', type: 'Credit', amount: '2450', date: '2024-04-09', status: 'Completed' },
                        { id: 'EXP-5532', desc: 'Electricity Bill', type: 'Debit', amount: '8200', date: '2024-04-08', status: 'Completed' },
                        { id: 'INV-8820', desc: 'Priya Patel', type: 'Credit', amount: '1200', date: '2024-04-08', status: 'Completed' },
                    ]
                }
            }
        };
    }
    
    if (url === '/finance/revenue') {
        return {
            data: {
                success: true,
                data: [
                    { _id: '1', invoiceNumber: 'INV001', clientId: { name: 'Rahul Sharma' }, total: 2450, tax: 441, paymentMethod: 'online', paymentStatus: 'paid', createdAt: '2024-04-09T10:00:00Z', items: [{ type: 'service', name: 'Haircut' }] },
                    { _id: '2', invoiceNumber: 'INV002', clientId: { name: 'Priya Patel' }, total: 1200, tax: 216, paymentMethod: 'cash', paymentStatus: 'paid', createdAt: '2024-04-08T11:00:00Z', items: [{ type: 'service', name: 'Manicure' }] },
                    { _id: '3', invoiceNumber: 'INV003', clientId: { name: 'Suresh Kumar' }, total: 5500, tax: 990, paymentMethod: 'online', paymentStatus: 'paid', createdAt: '2024-04-07T12:00:00Z', items: [{ type: 'product', name: 'Shampoo' }] },
                ]
            }
        };
    }
    if (url === '/finance/expenses') {
        const exp = getLocal('fin_expenses', [
            { _id: 'e1', category: 'utilities', vendor: 'Torrent Power', amount: 12500, description: 'Electricity March', createdAt: '2024-04-05T10:00:00Z', paymentMethod: 'paid' },
            { _id: 'e2', category: 'rent', vendor: 'Space Realty', amount: 85000, description: 'Monthly Rent', createdAt: '2024-04-01T10:00:00Z', paymentMethod: 'paid' }
        ]);
        return { data: { success: true, data: exp } };
    }
    
    if (url === '/finance/tax-summary') {
        return {
            data: {
                success: true,
                data: {
                    totals: {
                        gstTotal: 84500,
                        netLiability: 52000
                    },
                    monthly: [
                        { monthLabel: 'March 2024', monthKey: '03', gstTotal: 28500 },
                        { monthLabel: 'February 2024', monthKey: '02', gstTotal: 32000 },
                        { monthLabel: 'January 2024', monthKey: '01', gstTotal: 24000 }
                    ]
                }
            }
        };
    }

    if (url === '/finance/petty-cash/summary') {
        const sum = getLocal('pet_summary', {
            balance: 5000,
            isOpenedToday: false,
            isClosedToday: false,
            businessDate: new Date().toISOString().split('T')[0],
            categories: ['Staff Refreshment', 'Supplies', 'Transport', 'Misc'],
            denominations: [500, 200, 100, 50, 20, 10, 5, 2, 1]
        });
        return { data: { success: true, data: sum } };
    }
    if (url.startsWith('/finance/petty-cash/entries')) {
        const entries = getLocal('pet_entries', []);
        return { data: { success: true, data: { results: entries } } };
    }
    if (url.startsWith('/finance/petty-cash/closings')) {
        const closings = getLocal('pet_closings', []);
        return { data: { success: true, data: { results: closings } } };
    }
    
    if (url.startsWith('/finance/cash-bank-summary')) {
        const bd = getLocal('fin_bank_details', { bankName: 'HDFC Bank', accountNumber: '9281', isLinked: true });
        return {
            data: {
                success: true,
                data: {
                    outlet: {
                        name: 'Main Outlet',
                        bankAccount: bd
                    }
                }
            }
        };
    }
    if (url.startsWith('/finance/razorpay/settlements')) {
        return {
            data: {
                success: true,
                data: [
                    { id: 'setl_001', amount: 150000, status: 'processed', created_at: Math.floor(Date.now() / 1000) - 86400, fees: 3000, tax: 540 },
                    { id: 'setl_002', amount: 80000, status: 'processed', created_at: Math.floor(Date.now() / 1000) - 172800, fees: 1600, tax: 288 }
                ]
            }
        };
    }
    
    if (url === '/dashboard/salon') return { data: dashData };
    if (url === '/tenants/me') return { data: bizData.salon.data };
    if (url === '/outlets') return { data: bizData.outlets }; // Sidebar/BusinessContext might expect the wrapper
    
    if (url.startsWith('/outlets/nearby')) {
        const outletsArr = Array.isArray(bizData.outlets?.data) ? bizData.outlets.data : (Array.isArray(bizData.outlets) ? bizData.outlets : []);
        return { data: outletsArr };
    }
    if (url.startsWith('/outlets/reverse-geocode')) {
        return { data: { status: 'OK', displayAddress: 'Connaught Place, New Delhi, India' } };
    }
    if (url.startsWith('/outlets/geocode')) {
        return { data: { latitude: 28.6139, longitude: 77.2090 } };
    }
    
    if (url.startsWith('/feedbacks')) {
        return { 
            data: { 
                success: true, 
                data: [
                    { _id: 'f1', clientName: 'Rahul Sharma', rating: 5, comment: 'Amazing hair transformation! Highly recommended.', createdAt: '2024-03-20T10:00:00Z', status: 'Approved' },
                    { _id: 'f2', clientName: 'Priya Verma', rating: 5, comment: 'The facial was so relaxing. My skin feels great.', createdAt: '2024-03-22T14:30:00Z', status: 'Approved' },
                    { _id: 'f3', clientName: 'Suresh Kumar', rating: 4, comment: 'Great service, but wait time was a bit more.', createdAt: '2024-03-25T09:00:00Z', status: 'Approved' }
                ] 
            } 
        };
    }
    if (url === '/promotions/active') {
        const promos = [
            { _id: 'p1', name: 'First Booking Special', type: 'FLAT', value: 200, couponCode: 'WELCOME200', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
            { _id: 'p2', name: 'Summer Glow Extra', type: 'PERCENTAGE', value: 15, couponCode: 'SUMMER15', startDate: '2024-04-01', endDate: '2024-06-30', status: 'Active' }
        ];
        return { data: { success: true, data: promos, results: promos } };
    }
    if (url === '/loyalty/membership-plans') {
        return {
            data: {
                success: true,
                data: [
                    { _id: 'm1', name: 'Silver Member', price: 999, duration: 30, benefits: ['10% off services', 'Priority booking'], isActive: true, icon: 'shield' },
                    { _id: 'm2', name: 'Gold Member', price: 2999, duration: 90, benefits: ['20% off services', 'Free Haircut once', 'Priority booking'], isActive: true, icon: 'crown', isPopular: true }
                ]
            }
        };
    }
    if (url === '/loyalty/referral-settings') {
        return { data: { success: true, data: { referrerReward: 250, refereeReward: 150 } } };
    }

    if (url === '/users/me') return { data: { ...Object.values(authData.mock_users)[0], success: true } };
    // Standardized handlers for core entities moved or handled below
    
    // INVENTORY ENDPOINTS
    if (url === '/products') {
        const prod = getLocal('inv_products', []);
        return { data: { success: true, data: { results: prod }, results: prod } };
    }
    if (url === '/shop-categories') {
        const cat = getLocal('inv_shop_cats', []);
        return { data: { success: true, data: cat } };
    }
    if (url === '/inventory/overview') {
        const prod = getLocal('inv_products', []);
        const lines = [];
        prod.forEach(p => {
            outletsArr.forEach(o => {
                lines.push({
                    productId: p.id || p._id,
                    name: p.name,
                    sku: p.sku || 'N/A',
                    category: p.category || 'General',
                    outletId: o._id || o.id,
                    outletName: o.name,
                    quantity: Math.floor(Math.random() * 50),
                    threshold: p.extended?.threshold || p.lowStockThreshold || 5,
                    stockStatus: 'In Stock'
                });
            });
        });
        return { data: { success: true, lines, outlets: outletsArr, summary: { skuCount: prod.length, outletCount: outletsArr.length } } };
    }
    if (url === '/inventory/stock-in/history') {
        const history = getLocal('inv_stockin_history', []);
        return { data: { success: true, results: history } };
    }
    if (url === '/inventory/adjust/history') {
        const history = getLocal('inv_adjust_history', []);
        return { data: { success: true, results: history } };
    }

    if (url === '/inventory/low-stock') {
        const prod = getLocal('inv_products', []);
        const alerts = [];
        prod.forEach(p => {
            const stock = Math.floor(Math.random() * 4); // Simulate low stock
            if (stock <= (p.extended?.threshold || p.lowStockThreshold || 5)) {
                alerts.push({
                    productId: p.id || p._id,
                    name: p.name,
                    sku: p.sku || 'N/A',
                    outletId: outletsArr[0]?._id,
                    outletName: outletsArr[0]?.name || 'Main Outlet',
                    quantity: stock,
                    threshold: p.extended?.threshold || p.lowStockThreshold || 5,
                    stockStatus: stock <= 2 ? 'Critical' : 'Low Stock'
                });
            }
        });
        return { data: { success: true, alerts, summary: { total: alerts.length, critical: alerts.filter(a => a.stockStatus === 'Critical').length, low: alerts.filter(a => a.stockStatus === 'Low Stock').length } } };
    }

    if (url === '/invoices/finance-dashboard') {
        const prod = getLocal('inv_products', []);
        const expenses = getLocal('fin_expenses', []);
        const stockIn = getLocal('inv_stockin_history', []);
        
        const totalStockValue = prod.reduce((sum, p) => sum + (p.stock * (p.costPrice || 0)), 0);
        const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalPurch = stockIn.reduce((sum, s) => sum + (s.purchasePrice * s.quantity || 0), 0);

        return {
            data: {
                success: true,
                kpis: {
                    grossInflow: 125000 + Math.random() * 50000,
                    totalExpenses: totalExp,
                    supplierPurchasesMtd: totalPurch,
                    netLiquidity: 125000 - totalExp - totalPurch,
                    pendingRefunds: 2,
                    liabilityHint: 'Points liability: low'
                },
                costAllocation: [
                    { label: 'Inventory', percentage: 40 },
                    { label: 'Salaries', percentage: 35 },
                    { label: 'Rent', percentage: 15 },
                    { label: 'Marketing', percentage: 10 }
                ],
                monthlyTrend: [
                    { name: 'Jan', revenue: 85000, expense: 45000 },
                    { name: 'Feb', revenue: 95000, expense: 50000 },
                    { name: 'Mar', revenue: 110000, expense: 55000 }
                ]
            }
        };
    }
    if (url === '/suppliers') {
        const suppliers = getLocal('fin_suppliers', [
            { _id: 'sup_1', id: 'sup_1', name: 'Premium Beauty Supplies', phone: '9876543210', email: 'premium@beauty.com', category: 'Hair Care', gstin: '27AAAAA0000A1Z5', due: 15400, status: 'Overdue' },
            { _id: 'sup_2', id: 'sup_2', name: 'Luxe Cosmetics', phone: '9876543211', email: 'luxe@cosmetics.com', category: 'Makeup', gstin: '27BBBBB0000B1Z5', due: 0, status: 'Active' }
        ]);
        return { data: { success: true, data: suppliers } };
    }
    if (url === '/finance/expenses') {
        const expenses = getLocal('fin_expenses', [
            { _id: 'exp_1', category: 'rent', description: 'Monthly Rent', amount: 25000, date: new Date().toISOString(), paymentMethod: 'online', outletName: 'Main Branch' },
            { _id: 'exp_2', category: 'utilities', description: 'Water Bill', amount: 1500, date: new Date().toISOString(), paymentMethod: 'cash', outletName: 'Main Branch' }
        ]);
        return { data: { success: true, data: expenses, results: expenses } };
    }

    if (url === '/finance/cash-bank') {
        const expenses = getLocal('fin_expenses', []);
        const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const saved = getLocal(`fin_reconcile_${data?.date || new Date().toISOString().split('T')[0]}`, null);
        
        return {
            data: {
                success: true,
                data: {
                    cash: { opening: 5000, sales: 12000, expenses: totalExp * 0.3, net: 5000 + 12000 - (totalExp * 0.3) },
                    bank: { opening: 45000, sales: 28000, expenses: totalExp * 0.7, net: 45000 + 28000 - (totalExp * 0.7) },
                    saved,
                    meta: { invoiceCashLabel: 'Cash collected', invoiceBankLabel: 'UPI / Card' }
                }
            }
        };
    }

    if (url === '/suppliers/invoices') {
        const history = getLocal('inv_stockin_history', []);
        // Group history by invoiceNo
        const invoices = [];
        const groups = {};
        history.forEach(h => {
            if (!h.invoiceNo) return;
            if (!groups[h.invoiceNo]) {
                groups[h.invoiceNo] = {
                    invoiceKey: h.invoiceNo,
                    invoiceNo: h.invoiceNo,
                    supplierName: h.supplierName || 'General Supplier',
                    invoiceDate: h.createdAt || new Date().toISOString(),
                    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                    amount: 0,
                    paidAmount: 0,
                    status: 'Pending'
                };
            }
            groups[h.invoiceNo].amount += (h.purchasePrice * h.quantity);
        });
        
        // Add some default ones if empty
        if (Object.keys(groups).length === 0) {
            return {
                data: {
                    success: true,
                    data: [
                        { invoiceKey: 'INV-001', invoiceNo: 'INV-001', supplierName: 'Premium Beauty Supplies', invoiceDate: new Date().toISOString(), dueDate: new Date(Date.now() + 86400000 * 15).toISOString(), amount: 15400, paidAmount: 0, outstanding: 15400, status: 'Pending' },
                        { invoiceKey: 'INV-002', invoiceNo: 'INV-002', supplierName: 'Luxe Cosmetics', invoiceDate: new Date(Date.now() - 86400000 * 40).toISOString(), dueDate: new Date(Date.now() - 86400000 * 10).toISOString(), amount: 8200, paidAmount: 8200, outstanding: 0, status: 'Paid' }
                    ]
                }
            };
        }

        const results = Object.values(groups).map(inv => ({
            ...inv,
            outstanding: inv.amount - inv.paidAmount,
            status: inv.paidAmount >= inv.amount ? 'Paid' : (new Date(inv.dueDate) < new Date() ? 'Overdue' : (inv.paidAmount > 0 ? 'Partial' : 'Pending'))
        }));

        return { data: { success: true, data: results, results } };
    }

    if (url === '/finance/tax/gst-summary') {
        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const monthly = months.map((m, i) => ({
            monthKey: `${data?.fy}-${i+4}`,
            monthLabel: `${m} ${data?.fy}`,
            taxable: 45000 + Math.random() * 20000,
            cgst: 4050 + Math.random() * 1800,
            sgst: 4050 + Math.random() * 1800,
            gstTotal: 8100 + Math.random() * 3600,
            productGst: 3200,
            serviceGst: 4900,
            invoices: 15 + Math.floor(Math.random() * 10)
        }));

        const totals = monthly.reduce((acc, m) => ({
            taxable: acc.taxable + m.taxable,
            cgst: acc.cgst + m.cgst,
            sgst: acc.sgst + m.sgst,
            gstTotal: acc.gstTotal + m.gstTotal,
            productGst: acc.productGst + m.productGst,
            serviceGst: acc.serviceGst + m.serviceGst,
            invoices: acc.invoices + m.invoices
        }), { taxable: 0, cgst: 0, sgst: 0, gstTotal: 0, productGst: 0, serviceGst: 0, invoices: 0 });

        return {
            data: {
                success: true,
                data: {
                    totals,
                    monthly,
                    period: { fromDate: '01-Apr-' + data?.fy, toDate: '31-Mar-' + (parseInt(data?.fy)+1) },
                    assumptions: {
                        taxable: 'Taxable = subTotal − discount per invoice.',
                        gstSplit: 'CGST 9% + SGST 9% (Approx)',
                        productServiceTax: 'Allocated by line type'
                    }
                }
            }
        };
    }

    if (url === '/finance/eod/summary') {
        const date = data?.date || new Date().toISOString().split('T')[0];
        const closure = getLocal(`fin_eod_${date}`, null);
        const expenses = getLocal('fin_expenses', []);
        const totalExp = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        return {
            data: {
                success: true,
                data: {
                    dayClosed: !!closure,
                    closure,
                    metrics: {
                        totalSales: 45000,
                        invoiceCount: 22,
                        dailyExpenses: totalExp,
                        netForDay: 45000 - totalExp,
                        netCashEstimate: 12000,
                        cashSales: 15000,
                        onlineSales: 25000,
                        cardSales: 5000
                    },
                    meta: { netCashHint: 'Total cash sales minus cash expenses.' }
                }
            }
        };
    }
    if (url === '/cms') {
        const faqs = getLocal('sup_faqs', [
            { q: "How do I change my subscription plan?", a: "You can upgrade or downgrade your plan from the 'Subscription & Plans' section in the sidebar." },
            { q: "Can I use the app offline?", a: "Wapixo is cloud-based and requires an active internet connection to sync data across devices." },
            { q: "How to add multiple outlets?", a: "Multi-outlet support is available in our Business and Enterprise plans. Contact support to enable it." },
        ]);
        return { data: { success: true, support_faqs: faqs, data: { results: [] } } };
    }
    if (url === '/support/tickets') {
        const tickets = getLocal('sup_tickets', []);
        return { data: { success: true, data: tickets } };
    }
    if (url.startsWith('/support/tickets/')) {
        const id = url.split('/').pop();
        const tickets = getLocal('sup_tickets', []);
        const t = tickets.find(x => x._id === id || x.id === id);
        return { data: { success: true, data: t } };
    }

    if (url === '/leads') {
        const leads = getLocal('sup_leads', [
            { _id: 'l1', name: 'Dr. Sameer Gupta', salonName: 'The Royal Spa', email: 'sameer@royalspa.in', phone: '9820012345', message: 'Interested in the Pro plan for my 3 outlets. Please call back.', status: 'new', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { _id: 'l2', name: 'Anita Desai', salonName: 'Desai Hair Lab', email: 'anita@hairlab.com', phone: '9123445566', message: 'Looking for integrated inventory management solutions.', status: 'contacted', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() }
        ]);
        const filtered = leads.filter(l => {
            if (params?.status && l.status !== params.status) return false;
            if (params?.search) {
                const s = params.search.toLowerCase();
                return l.name.toLowerCase().includes(s) || (l.salonName || '').toLowerCase().includes(s) || l.email.toLowerCase().includes(s);
            }
            return true;
        });
        return { data: { success: true, data: { results: filtered } } };
    }

    if (url === '/hr-performance') {
        const staff = getLocal('hr_staff', []);
        const allPerf = getLocal('hr_performance', {});
        const perfData = staff.map(s => {
            const sid = s._id || s.id;
            const sp = allPerf[sid] || { revenue: 12000 + (Math.random() * 5000), services: 8, rating: 4.5, goal: 30000, contribution: 'High' };
            return { id: sid, staff: s.name, role: s.role, ...sp };
        });
        return { data: { success: true, data: { staff: perfData, period: params } } };
    }
    if (url === '/tenants/stats') {
        const tenants = getLocal('sup_tenants', [
            { _id: 't1', name: 'Glam Studio', slug: 'glam-studio', ownerName: 'Priya Shah', email: 'priya@glam.com', phone: '9876543210', city: 'Mumbai', subscriptionPlan: 'pro', status: 'active', outletsCount: 3, staffCount: 12, trialDays: 0, createdAt: '2026-01-15T10:00:00Z', mrr: 4999, totalRevenue: 45000 },
            { _id: 't2', name: 'The Barber Room', slug: 'barber-room', ownerName: 'Raj Mehta', email: 'raj@barber.com', phone: '9123456780', city: 'Delhi', subscriptionPlan: 'basic', status: 'trial', outletsCount: 1, staffCount: 4, trialDays: 8, createdAt: '2026-02-10T08:30:00Z', mrr: 1999, totalRevenue: 12000 }
        ]);
        const active = tenants.filter(t => t.status === 'active').length;
        const trial = tenants.filter(t => t.status === 'trial').length;
        const expired = tenants.filter(t => t.status === 'expired').length;
        const suspended = tenants.filter(t => t.status === 'suspended').length;
        const pro = tenants.filter(t => t.subscriptionPlan === 'pro').length;
        const basic = tenants.filter(t => t.subscriptionPlan === 'basic').length;
        return {
            data: {
                success: true,
                data: {
                    totalSalons: tenants.length,
                    activeSalons: active,
                    countsByStatus: [
                        { _id: 'active', count: active },
                        { _id: 'trial', count: trial },
                        { _id: 'expired', count: expired },
                        { _id: 'suspended', count: suspended }
                    ],
                    countsByPlan: [
                        { _id: 'pro', count: pro },
                        { _id: 'basic', count: basic },
                        { _id: 'free', count: tenants.length - pro - basic }
                    ],
                    recentTenants: tenants.slice(0, 5)
                }
            }
        };
    }
    if (url === '/tenants') {
        const tenants = getLocal('sup_tenants', []);
        return { data: { success: true, data: { results: tenants, totalPages: 1, totalResults: tenants.length, limit: 10 } } };
    }
    if (url.startsWith('/tenants/')) {
        const id = url.split('/').pop();
        const tenants = getLocal('sup_tenants', []);
        const t = tenants.find(x => x._id === id || x.id === id);
        return { data: { success: true, data: t } };
    }
    if (url === '/analytics/stats') {
        const mrr = 854000;
        return {
            data: {
                success: true,
                kpis: { mrr, arr: mrr * 12, arpu: 4250, totalSalons: 154 },
                ltv: 125000, nps: 78, dauMau: 64,
                mrrTrend: [
                    { month: 'Sep', mrr: 650000, newMRR: 80000, expansion: 25000, churnedMRR: 12000 },
                    { month: 'Oct', mrr: 710000, newMRR: 90000, expansion: 30000, churnedMRR: 15000 },
                    { month: 'Nov', mrr: 780000, newMRR: 95000, expansion: 20000, churnedMRR: 18000 },
                    { month: 'Dec', mrr: 854000, newMRR: 110000, expansion: 45000, churnedMRR: 10000 }
                ],
                salonGrowth: [
                    { month: 'Oct', new: 12, churned: 2 },
                    { month: 'Nov', new: 15, churned: 3 },
                    { month: 'Dec', new: 22, churned: 1 }
                ],
                planDist: [
                    { name: 'Free', value: 45, color: '#94a3b8' },
                    { name: 'Basic', value: 68, color: '#3b82f6' },
                    { name: 'Pro', value: 32, color: '#B85C5C' },
                    { name: 'Enterprise', value: 9, color: '#f59e0b' }
                ],
                geoDist: [
                    { city: 'Mumbai', salons: 42, mrr: 210000 },
                    { city: 'Delhi', salons: 38, mrr: 180000 },
                    { city: 'Bangalore', salons: 31, mrr: 155000 }
                ],
                featureUsage: [
                    { feature: 'POS Terminal', usage: 92, change: 4 },
                    { feature: 'Appointments', usage: 88, change: 2 },
                    { feature: 'Inventory', usage: 74, change: 8 },
                    { feature: 'CRM', usage: 65, change: 5 }
                ],
                churnReasons: [
                    { reason: 'Pricing', pct: 34 },
                    { reason: 'Too Complex', pct: 28 },
                    { reason: 'Moving to Competitor', pct: 22 }
                ],
                churnTrend: [
                    { month: 'Oct', rate: 2.8 },
                    { month: 'Nov', rate: 2.5 },
                    { month: 'Dec', rate: 2.2 }
                ]
            }
        };
    }
    if (url === '/notifications/test') {
        return { data: { success: true, message: 'Test notification triggered (Offline Simulation)' } };
    }
    if (url === '/bookings/approvals') {
        const bookings = getLocal('bookings', []);
        const pending = bookings.filter(b => b.status === 'pending');
        return { data: { success: true, data: pending } };
    }

    if (url === '/payroll') {
        const { year, month } = params;
        const all = getLocal('hr_payroll', []);
        const entries = all.filter(e => e.year === parseInt(year) && e.month === parseInt(month));
        const meta = getLocal(`hr_payroll_meta_${year}_${month}`, { locked: false });
        return { data: { success: true, data: { entries, period: meta } } };
    }

    if (url === '/shifts') {
        const shifts = getLocal('hr_shifts', [
            { _id: 's_1', name: 'Morning Shift', startTime: '09:00', endTime: '18:00', colorClass: 'bg-emerald-500', colorHex: '#10b981', assignedUserIds: ['u_1'] },
            { _id: 's_2', name: 'Evening Shift', startTime: '12:00', endTime: '21:00', colorClass: 'bg-blue-500', colorHex: '#3b82f6', assignedUserIds: ['u_2'] }
        ]);
        return { data: { success: true, data: shifts } };
    }

    if (url === '/attendance') {
        const date = params?.date || new Date().toISOString().split('T')[0];
        const allAtt = getLocal('hr_attendance', []);
        const filtered = allAtt.filter(a => a.date === date);
        return { data: { success: true, data: { records: filtered } } };
    }

    if (url === '/users') {
        const staff = getLocal('hr_staff', [
            { _id: 'u_1', name: 'Alina Khan', role: 'stylist', specialist: 'Senior Stylist', email: 'alina@salon.com', phone: '9876543210', status: 'active', joinedDate: '2024-01-10', salary: 35000, appointments: 142, rating: 4.8 },
            { _id: 'u_2', name: 'Rahul Sharma', role: 'manager', email: 'rahul@salon.com', phone: '9876543211', status: 'active', joinedDate: '2023-11-15', salary: 55000, appointments: 12, rating: 4.5 }
        ]);
        return { data: { success: true, data: staff, results: staff } };
    }

    if (url === '/hr-performance') {
        const staff = getLocal('hr_staff', []);
        return {
            data: {
                success: true,
                data: {
                    staff: staff.map(s => ({
                        id: s._id,
                        staff: s.name,
                        role: s.role,
                        revenue: Math.floor(Math.random() * 100000) + 20000,
                        goal: s.goal || 50000
                    }))
                }
            }
        };
    }
    
    if (url === '/attendance/leaves') {
        return { data: { success: true, data: getLocal('hr_leaves', [
            { id: 'lv_1', userName: 'Alina Khan', userRole: 'Stylist', type: 'CASUAL_LEAVE', dates: '12 Apr - 14 Apr', reason: 'Family function', status: 'PENDING' }
        ]) } };
    }

    if (url === '/dashboard/team') {
        const members = getLocal('hr_staff', []);
        return {
            data: {
                success: true,
                data: {
                    stats: {
                        totalStaff: members.length,
                        activeNow: members.filter(m => m.status === 'active').length,
                        onLeave: 1,
                        pendingInvitations: 0
                    },
                    members: members.map(m => ({ ...m, id: m._id, displayRole: m.specialist || m.role })),
                    revenueGrowth: [
                        { day: 'Mon', revenue: 45000 }, { day: 'Tue', revenue: 52000 }, { day: 'Wed', revenue: 48000 },
                        { day: 'Thu', revenue: 61000 }, { day: 'Fri', revenue: 55000 }, { day: 'Sat', revenue: 72000 }, { day: 'Sun', revenue: 68000 }
                    ]
                }
            }
        };
    }
    
    
    
    // SUBSCRIPTION & BILLING
    if (url === '/subscriptions') {
        const plans = getLocal('sup_plans', []);
        if (plans.length === 0 && subscriptionData.INITIAL_PLANS) {
            saveLocal('sup_plans', subscriptionData.INITIAL_PLANS);
            return { data: { success: true, results: subscriptionData.INITIAL_PLANS, data: { results: subscriptionData.INITIAL_PLANS } } };
        }
        return { data: { success: true, results: plans, data: { results: plans } } };
    }
    if (url === '/subscriptions/stats') {
        const plans = getLocal('sup_plans', subscriptionData.INITIAL_PLANS || []);
        const activePlans = plans.filter(p => p.active).length;
        const totalSalons = plans.reduce((a, p) => a + (p.salonsCount || 0), 0);
        const estimatedMRR = plans.reduce((a, p) => a + (p.salonsCount || 0) * (p.monthlyPrice || 0), 0);
        return {
            data: {
                success: true,
                data: {
                    totalPlans: plans.length,
                    activePlans,
                    totalSalons,
                    estimatedMRR
                }
            }
        };
    }
    if (url === '/stylist/overview') {
        const schedule = [
            { id: 'apt_1', time: '10:30 AM', customer: 'Preeti Sharma', service: 'Hair Coloring', duration: '90 MIN', bookingStatus: 'confirmed' },
            { id: 'apt_2', time: '12:00 PM', customer: 'Rahul Verma', service: 'Mens Haircut', duration: '30 MIN', bookingStatus: 'pending' },
            { id: 'apt_3', time: '02:00 PM', customer: 'Simran Kaur', service: 'Facial Deluxe', duration: '60 MIN', bookingStatus: 'upcoming' },
            { id: 'apt_4', time: '04:30 PM', customer: 'Anjali Gupta', service: 'Manicure', duration: '45 MIN', bookingStatus: 'completed' }
        ];
        const performanceData = [
            { day: 'Mon', value: 2400 }, { day: 'Tue', value: 1800 }, { day: 'Wed', value: 3200 },
            { day: 'Thu', value: 2100 }, { day: 'Fri', value: 4500 }, { day: 'Sat', value: 5800 }, { day: 'Sun', value: 4100 }
        ];
        return {
            data: {
                schedule,
                stats: { revenue: 24500, target: 35000, progressPercent: 70, servicesDone: 42, highestDaily: 5800, rating: 4.8 },
                performanceData,
                attendanceLog: [
                    { type: 'in', statusLabel: 'Punched In', time: '09:45 AM', date: '09 APR' },
                    { type: 'out', statusLabel: 'Break Start', time: '01:15 PM', date: '08 APR' }
                ],
                shiftActive: true
            }
        };
    }
    if (url === '/bookings') {
        // Return some mock history for stylist
        return {
            data: [
                { _id: 'bk_101', serviceId: { name: 'Full Glam Makeup' }, clientId: { name: 'Surbhi Jha' }, appointmentDate: '2026-04-08', time: '11:00 AM', status: 'completed', duration: 120 },
                { _id: 'bk_102', serviceId: { name: 'Deep Tissue Massage' }, clientId: { name: 'Anita Roy' }, appointmentDate: '2026-04-08', time: '02:00 PM', status: 'completed', duration: 60 }
            ]
        };
    }
    if (url === '/stylist/time-off') {
        const requests = getLocal('stylist_timeoff', [
            { id: 't1', type: 'CASUAL_LEAVE', dates: '12 Apr - 14 Apr', appliedOn: '08 Apr 2026', status: 'APPROVED' },
            { id: 't2', type: 'MEDICAL_LEAVE', dates: '20 Apr - 21 Apr', appliedOn: '09 Apr 2026', status: 'PENDING' }
        ]);
        const quotas = [
            { label: 'Casual Leaves', used: 4, total: 12, colorClass: 'text-primary' },
            { label: 'Medical Leaves', used: 2, total: 10, colorClass: 'text-rose-500' },
            { label: 'Earned Leaves', used: 0, total: 15, colorClass: 'text-emerald-500' },
            { label: 'Short Leaves', used: 1, total: 5, colorClass: 'text-amber-500' }
        ];
        return {
            data: {
                requests,
                quotas,
                leaveTypes: ['CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER']
            }
        };
    }
    if (url === '/attendance/worksite') {
        return {
            data: {
                geofenceEnforced: true,
                configured: true,
                outlet: {
                    name: 'Grooming Lounge (Main)',
                    city: 'New Delhi',
                    address: 'H-34, Connaught Place, New Delhi',
                    latitude: 28.6289,
                    longitude: 77.2150,
                    geofenceRadiusMeters: 500
                }
            }
        };
    }
    if (url === '/attendance/me') {
        const punches = getLocal('stylist_attendance', []);
        const today = new Date().toLocaleDateString('en-CA');
        const todayRecord = punches.find(p => p.date === today);
        return { data: todayRecord || {} };
    }
    if (url === '/stylist/commissions') {
        const stats = [
            { key: 'totalEarned', value: '₹18,450', sub: 'Calculated this cycle' },
            { key: 'yieldUnits', value: '142', sub: 'Total items processed' },
            { key: 'repIndex', value: '4.8', sub: 'Quality unit rating' },
            { key: 'baseAllocation', value: '₹12,000', sub: 'Fixed monthly base' }
        ];
        const earningsHistory = [
            { id: '1', date: '08 APR 2026', services: 'HydraFacial + Haircut', revenue: 4500, commission: 450, status: 'PENDING' },
            { id: '2', date: '07 APR 2026', services: 'Global Coloring', revenue: 6500, commission: 650, status: 'SETTLED' },
            { id: '3', date: '06 APR 2026', services: 'Bridal Makeup', revenue: 15000, commission: 1500, status: 'SETTLED' }
        ];
        return {
            data: {
                stats,
                earningsHistory,
                performance: { progressPercent: 65, bookingRevenue: 22750, goal: 35000, quotaLabel: 'Tier 2 Active' },
                incentiveSlabs: [
                    { tier: 'PLATINUM', range: '₹50,000+', yield: '15%', status: 'TARGET_UNIT' },
                    { tier: 'GOLD', range: '₹30,000+', yield: '12%', status: 'CURRENT_UNIT' },
                    { tier: 'SILVER', range: '₹15,000+', yield: '10%', status: 'REACHED_UNIT' }
                ],
                period: { label: 'Current Cycle' }
            }
        };
    }
    if (url === '/clients/stylist-roster') {
        const clients = [
            { _id: 'c1', name: 'Preeti Sharma', email: 'preeti@example.com', phone: '9988776655', totalVisits: 12, lastVisit: '2026-04-05', spend: 12500, tags: ['VIP'], lastServiceSummary: 'Balayage & Trim', notes: 'Likes cold water for hair wash' },
            { _id: 'c2', name: 'Simran Kaur', email: 'simran@example.com', phone: '9876543210', totalVisits: 5, lastVisit: '2026-03-28', spend: 8400, tags: [], lastServiceSummary: 'Hydrafacial', notes: 'Sensitive skin' },
            { _id: 'c3', name: 'Anjali Gupta', email: 'anjali@example.com', phone: '9123456789', totalVisits: 8, lastVisit: '2026-04-02', spend: 5600, tags: [], lastServiceSummary: 'Manicure & Pedicure', notes: 'Prefers nude shades' }
        ];
        return { data: { results: clients } };
    }
    if (url.endsWith('/stylist-history')) {
        const history = [
            { id: 'h1', service: 'Balayage Special', date: '05 APR 2026', cost: '₹4,500' },
            { id: 'h2', service: 'Deep Conditioning', date: '12 MAR 2026', cost: '₹1,200' },
            { id: 'h3', service: 'Root Touch-up', date: '15 FEB 2026', cost: '₹1,800' }
        ];
        return { data: { data: history } };
    }
    if (url === '/blogs') {
        const blogs = getLocal('sup_blogs', []);
        return { data: blogs.length > 0 ? blogs : [] }; // SABlogPage expects the array directly or in results
    }
    if (url === '/users/me') {
        return {
            data: getLocal('sup_profile', {
                name: 'Super Admin',
                email: 'superadmin@salon.com',
                phone: '+91 99999 88888',
                role: 'Super Admin'
            })
        };
    }
    if (url === '/cms') {
        return { data: getLocal('sup_cms', {}) };
    }
    if (url.startsWith('/billing/stats')) {
        return {
            data: {
                success: true,
                code: 200,
                data: {
                    totalRevenue: 549500,
                    failedCount: 3,
                    refundedAmount: 12000,
                    monthlyRevenue: [
                        { month: '2023-11', revenue: 75000, subtotal: 63559, tax: 11441 },
                        { month: '2023-12', revenue: 89000, subtotal: 75424, tax: 13576 },
                        { month: '2024-01', revenue: 95000, subtotal: 80508, tax: 14492 },
                        { month: '2024-02', revenue: 110000, subtotal: 93220, tax: 16780 },
                        { month: '2024-03', revenue: 125000, subtotal: 105932, tax: 19068 },
                        { month: '2024-04', revenue: 155000, subtotal: 131356, tax: 23644 }
                    ],
                    planDistribution: [
                        { name: 'Pro', value: 45, revenue: 224955 },
                        { name: 'Basic', value: 82, revenue: 163918 },
                        { name: 'Enterprise', value: 12, revenue: 155988 },
                        { name: 'Free', value: 125, revenue: 0 }
                    ]
                }
            }
        };
    }
    if (url.startsWith('/billing/transactions')) {
        const trans = getLocal('sup_transactions', [
            { _id: 't1', invoiceNumber: 'INV-1024', salonName: 'The Royal Spa', planName: 'Pro', amount: 4999, taxAmount: 900, totalAmount: 5899, createdAt: '2024-04-01T10:00:00Z', status: 'paid', paymentMethod: 'Razorpay' },
            { _id: 't2', invoiceNumber: 'INV-1025', salonName: 'Cut & Style', planName: 'Basic', amount: 1999, taxAmount: 360, totalAmount: 2359, createdAt: '2024-04-02T11:30:00Z', status: 'failed', paymentMethod: 'Card' },
            { _id: 't3', invoiceNumber: 'INV-1026', salonName: 'Nail Art Studio', planName: 'Enterprise', amount: 12999, taxAmount: 2340, totalAmount: 15339, createdAt: '2024-04-03T15:45:00Z', status: 'paid', paymentMethod: 'UPI' }
        ]);
        return { data: { success: true, code: 200, data: { results: trans } } };
    }
    if (url.startsWith('/billing/my-transactions')) {
        return { 
            data: { 
                success: true, 
                data: { 
                    results: [
                        { _id: 'inv_101', invoiceNumber: 'INV-2024-001', totalAmount: 4999, createdAt: new Date().toISOString(), status: 'paid', paymentMethod: 'Razorpay' },
                        { _id: 'inv_102', invoiceNumber: 'INV-2024-002', totalAmount: 4999, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), status: 'paid', paymentMethod: 'Razorpay' }
                    ] 
                } 
            } 
        };
    }
    
    if (url === '/dashboard/manager') {
        return {
            data: {
                success: true,
                data: {
                    overview: {
                        activeStaff: 12,
                        presentToday: 9,
                        avgRating: 4.8,
                        monthlyTargetPercent: 78
                    },
                    staffPerformance: [
                        { id: 1, name: 'Alina Khan', role: 'Stylist', services: 42, revenue: 85000, rating: 4.9, target: 85 },
                        { id: 2, name: 'Rahul Sharma', role: 'Senior Stylist', services: 38, revenue: 110000, rating: 4.7, target: 92 },
                        { id: 3, name: 'Surbhi Jha', role: 'Makeup Artist', services: 24, revenue: 156000, rating: 4.8, target: 76 },
                        { id: 4, name: 'Vikram Singh', role: 'Hair Specialist', services: 31, revenue: 62000, rating: 4.5, target: 58 }
                    ],
                    performanceComparison: [
                        { subject: 'Service Speed', Revenue: 85, Efficiency: 90 },
                        { subject: 'Upselling', Revenue: 65, Efficiency: 45 },
                        { subject: 'Retention', Revenue: 92, Efficiency: 88 },
                        { subject: 'Punctuality', Revenue: 78, Efficiency: 95 },
                        { subject: 'Hygiene', Revenue: 95, Efficiency: 100 }
                    ],
                    recentFeedback: [
                        { id: 101, customer: 'Anita Roy', rating: 5, comment: 'Amazing hair transformation by Rahul! Truly professional.', stylist: 'Rahul Sharma' },
                        { id: 102, customer: 'Priya Verma', rating: 4, comment: 'Satisfied with the facial, though the waiting time was slightly long.', stylist: 'Alina Khan' },
                        { id: 103, customer: 'Deepak Bajaj', rating: 5, comment: 'Great haircut, very precise.', stylist: 'Vikram Singh' }
                    ],
                    period: {
                        startDate: '01 APR 2026',
                        endDate: '09 APR 2026'
                    },
                    generatedAt: new Date().toISOString()
                }
            }
        };
    }
    
    if (url.startsWith('/dashboard/receptionist')) {
        return {
            data: {
                success: true,
                data: {
                    stats: [
                        { label: "Today's Appointments", value: 12, trend: "+2", positive: true, icon: 'Calendar' },
                        { label: "Pending Check-ins", value: 4, trend: "-1", positive: false, icon: 'Clock' },
                        { label: "Completed Today", value: 8, trend: "+12%", positive: true, icon: 'CheckCircle2' },
                        { label: "New Registrations", value: 3, trend: "+1", positive: true, icon: 'UserPlus' }
                    ],
                    performance: { revenue: 24500, avgTicket: 1850, targetFulfillment: 65 },
                    recentActivity: [
                        { id: 'act_1', client: 'Anita Roy', service: 'Haircut', time: '10:30 AM', status: 'confirmed', date: '09 APR' },
                        { id: 'act_2', client: 'Vikram Singh', service: 'Beard Trim', time: '11:15 AM', status: 'arrived', date: '09 APR' }
                    ]
                }
            }
        };
    }

    if (url.startsWith('/bookings')) {
        const bookings = getLocal('app_bookings', [
            { id: 'bk_1', clientId: { name: 'Anita Roy' }, serviceId: { name: 'Haircut' }, staffId: { name: 'Rahul Sharma' }, time: '10:30 AM', status: 'confirmed', source: 'APP' },
            { id: 'bk_2', clientId: { name: 'Vikram Singh' }, serviceId: { name: 'Beard Trim' }, staffId: { name: 'Alina Khan' }, time: '11:15 AM', status: 'arrived', source: 'RECEPTION' }
        ]);
        return { data: { success: true, results: bookings, data: bookings } };
    }

    if (url.startsWith('/services/categories')) {
        const cats = getLocal('app_service_cats', [
            { _id: 'cat_1', name: 'Hair' },
            { _id: 'cat_2', name: 'Skin' },
            { _id: 'cat_3', name: 'Makeup' }
        ]);
        return { data: { success: true, data: cats } };
    }
    if (url.startsWith('/services')) {
        const services = getLocal('app_services', [
            { id: 'ser_1', name: 'Global Hair Coloring', price: 4500, duration: 90 },
            { id: 'ser_2', name: 'Premium Haircut', price: 950, duration: 45 },
            { id: 'ser_3', name: 'HydraFacial', price: 5500, duration: 60 }
        ]);
        return { data: { success: true, results: services, data: { results: services } } };
    }

    if (url === '/invoices/stats') {
        return {
            data: {
                totalRevenue: 245000,
                invoiceCount: 142,
                avgBillValue: 1725
            }
        };
    }
    if (url.startsWith('/invoices/refunds')) {
        const invoices = getLocal('app_invoices', []);
        const refunds = invoices.filter(inv => inv.refund);
        return { data: { success: true, results: refunds } };
    }

    if (url.startsWith('/invoices')) {
        const id = url.split('/').pop();
        if (id === 'settle') {
            const parts = url.split('/');
            const invId = parts[2];
            const invoices = getLocal('app_invoices', []);
            const idx = invoices.findIndex(i => i._id === invId || i.invoiceNumber === invId);
            if (idx !== -1) {
                invoices[idx].paymentStatus = 'paid';
                saveLocal('app_invoices', invoices);
            }
            return { data: { success: true } };
        }
        if (id !== 'invoices' && id !== 'stats') {
            const invoices = getLocal('app_invoices', [
                { _id: 'inv_1', invoiceNumber: 'INV1001', clientId: { name: 'Anita Roy', phone: '9876543210' }, total: 2450, paymentStatus: 'paid', paymentMethod: 'cash', createdAt: new Date().toISOString(), staffId: { name: 'Rahul Sharma' } }
            ]);
            const inv = invoices.find(i => i._id === id || i.invoiceNumber === id);
            return { data: inv || invoices[0] };
        }
        const invoices = getLocal('app_invoices', [
            { _id: 'inv_1', invoiceNumber: 'INV1001', clientId: { name: 'Anita Roy', phone: '9876543210' }, total: 2450, paymentStatus: 'paid', paymentMethod: 'cash', createdAt: new Date().toISOString(), staffId: { name: 'Rahul Sharma' } },
            { _id: 'inv_2', invoiceNumber: 'INV1002', clientId: { name: 'Vikram Singh', phone: '9876543211' }, total: 950, paymentStatus: 'unpaid', paymentMethod: 'upi', createdAt: new Date().toISOString(), staffId: { name: 'Alina Khan' } }
        ]);
        return { data: { success: true, results: invoices, totalResults: invoices.length, totalPages: 1 } };
    }
    
    if (url.startsWith('/client')) {
        const clients = getLocal('app_clients', [
            { _id: 'c_1', name: 'Anita Roy', phone: '9876543210' },
            { _id: 'c_2', name: 'Vikram Singh', phone: '9876543211' }
        ]);
        const phone = new URLSearchParams(url.split('?')[1]).get('phone');
        if (phone) {
            const filtered = clients.filter(c => c.phone === phone);
            return { data: { results: filtered } };
        }
        return { data: { results: clients } };
    }
    
    return { data: { success: true, data: [], results: [] } };
};

export const mockPost = async (url, data) => {
    await delay(800);
    
    // AUTH LOGIN
    if (url === '/auth/request-otp') {
        return { data: { otp: '123456' } };
    }
    if (url === '/promotions/validate-coupon') {
        return { data: { success: true, data: { discount: 200 } } };
    }
    if (url === '/bookings/payment/order') {
        return { data: { id: 'order_' + Math.random().toString(36).slice(2, 11), amount: (data.amount || 0) * 100, currency: 'INR' } };
    }
    if (url === '/bookings/payment/verify') {
        return { data: { success: true } };
    }
    if (url === '/bookings') {
        const bookings = getLocal('app_bookings', []);
        const newB = { ...data, _id: 'bk_' + Date.now(), createdAt: new Date().toISOString() };
        bookings.push(newB);
        saveLocal('app_bookings', bookings);
        return { data: newB, success: true };
    }
    if (url === '/auth/login-otp') {
        return { 
            data: { 
                accessToken: 'mock_token_' + Date.now(), 
                client: { 
                    _id: 'cust_001', 
                    name: 'Demo Customer', 
                    phone: data.phone || '6263510091', 
                    tenantId: data.tenantId,
                    role: 'customer',
                    isNewUser: false
                } 
            } 
        };
    }
    if (url === '/auth/register-customer') {
        return { data: { success: true, message: 'Customer registered locally (Mock).' } };
    }
    if (url === '/auth/login') {
        const email = (data.email || '').toLowerCase();
        const mockUser = authData.mock_users[email] || Object.values(authData.mock_users)[0];
        return {
            data: {
                success: true,
                data: {
                    accessToken: 'mock_token_' + (mockUser.role || 'admin'),
                    user: { ...mockUser, _id: 'mock_123', subscriptionStatus: 'active', role: mockUser.role || 'admin' }
                }
            }
        };
    }

    if (url === '/subscriptions') {
        const plans = getLocal('sup_plans', []);
        const newPlan = { ...data, _id: 'plan_' + Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
        saveLocal('sup_plans', [...plans, newPlan]);
        return { data: { success: true, data: newPlan } };
    }

    if (url === '/billing/manual-invoice') {
        const trans = getLocal('sup_transactions', []);
        const newInv = {
            ...data,
            _id: 't_' + Date.now(),
            invoiceNumber: 'INV-' + (1027 + trans.length),
            taxAmount: Math.round(data.amount * 0.18),
            totalAmount: Math.round(data.amount * 1.18),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        saveLocal('sup_transactions', [newInv, ...trans]);
        return { data: { success: true, code: 201, data: newInv } };
    }

    if (url === '/stylist/time-off' && method === 'POST') {
        const requests = getLocal('stylist_timeoff', []);
        const newReq = {
            id: 't' + Date.now(),
            type: body.type,
            dates: `${body.startDate} - ${body.endDate}`,
            appliedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: 'PENDING'
        };
        requests.unshift(newReq);
        setLocal('stylist_timeoff', requests);
        return { data: { success: true, message: 'Time off request submitted (Mock).' } };
    }
    if (url === '/attendance/bulk') {
        const records = getLocal('hr_attendance', []);
        const staff = getLocal('hr_staff', []);
        const newRecords = staff.map(s => ({
            _id: 'att_' + Math.random(),
            userId: s._id,
            date: data.date,
            status: data.status,
            checkInAt: data.defaultCheckIn ? `${data.date}T${data.defaultCheckIn}:00` : null
        }));
        saveLocal('hr_attendance', [...newRecords, ...records]);
        return { data: { success: true, message: 'Bulk action applied' } };
    }

    if (url === '/users' && !url.includes('/')) {
        const staff = getLocal('hr_staff', []);
        const newUser = { ...data, _id: 'u_' + Date.now(), joinedDate: new Date().toISOString().split('T')[0] };
        saveLocal('hr_staff', [...staff, newUser]);
        return { data: { success: true, data: newUser } };
    }

    if (url === '/attendance' && !url.includes('/leaves')) {
        const records = getLocal('hr_attendance', []);
        const newAtt = { ...data, _id: 'att_' + Date.now() };
        saveLocal('hr_attendance', [newAtt, ...records]);
        return { data: { success: true, data: newAtt } };
    }
    if (url === '/attendance/punch') {
        const punches = getLocal('stylist_attendance', []);
        const today = new Date().toLocaleDateString('en-CA');
        let record = punches.find(p => p.date === today);
        if (!record) {
            record = { date: today, checkInAt: null, checkOutAt: null, location: data.location };
            punches.push(record);
        }
        
        if (data.type === 'in') record.checkInAt = new Date().toISOString();
        else record.checkOutAt = new Date().toISOString();
        
        saveLocal('stylist_attendance', punches);
        return { data: { success: true, message: 'Punched successfully (Mock).' } };
    }
    if (url === '/clients') {
        return { data: { success: true, message: 'Client enrolled locally (Mock).' } };
    }
    if (url === '/blogs/upload-image') {
        return { data: { url: 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200' } };
    }
    if (url === '/blogs') {
        const blogs = getLocal('sup_blogs', []);
        const newPost = { ...data, _id: Date.now(), createdAt: new Date().toISOString(), reads: 0 };
        saveLocal('sup_blogs', [newPost, ...blogs]);
        return { data: newPost };
    }
    if (url === '/users/change-password') {
        return { data: { success: true, message: 'Password changed successfully (Mock).' } };
    }
    if (url === '/notifications/register-token') {
        return { data: { success: true, message: 'FCM Token registered offline (Mock).' } };
    }

    if (url === '/pos/checkout') {
        const invoices = getLocal('app_invoices', []);
        const newInv = {
            _id: 'inv_' + Date.now(),
            invoiceNumber: 'INV' + (1003 + invoices.length),
            clientId: { name: data.clientName || 'Quick Guest', phone: data.phone || '' },
            total: data.items.reduce((sum, item) => sum + item.price, 0),
            paymentStatus: data.paymentMethod === 'cash' ? 'paid' : 'unpaid',
            paymentMethod: data.paymentMethod,
            createdAt: new Date().toISOString(),
            staffId: { name: 'Receptionist' }
        };
        saveLocal('app_invoices', [newInv, ...invoices]);
        return { data: { success: true, data: newInv } };
    }
    if (url === '/client') {
        const clients = getLocal('app_clients', []);
        const newClient = { ...data, _id: 'c_' + Date.now() };
        saveLocal('app_clients', [...clients, newClient]);
        return { data: newClient };
    }
    if (url === '/finance/eod/close') {
        saveLocal(`fin_eod_${data.businessDate}`, { ...data, closedAt: new Date().toISOString(), closedByName: 'Admin' });
        return { data: { success: true } };
    }

    if (url === '/finance/cash-bank/reconcile') {
        saveLocal(`fin_reconcile_${data.businessDate}`, { ...data, savedAt: new Date().toISOString() });
        return { data: { success: true } };
    }

    // FINANCE WRITES
    if (url === '/finance/expenses') {
        const exp = getLocal('fin_expenses', []);
        const newE = { ...data, _id: `exp_${Date.now()}`, createdAt: new Date().toISOString() };
        saveLocal('fin_expenses', [newE, ...exp]);
        return { data: { success: true, data: newE } };
    }

    if (url === '/suppliers') {
        const sups = getLocal('fin_suppliers', []);
        const newS = { 
            ...data, 
            _id: `s_${Date.now()}`, 
            id: `s_${Date.now()}`, 
            createdAt: new Date().toISOString(),
            due: data.due || 0,
            status: data.status || 'Active'
        };
        saveLocal('fin_suppliers', [newS, ...sups]);
        return { data: { success: true, data: newS } };
    }

    if (url === '/payroll/generate') {
        const { year, month } = data;
        const staff = getLocal('hr_staff', []);
        const entries = staff.map(s => ({
            id: s.id || s._id,
            _id: s.id || s._id,
            name: s.name,
            role: s.role || 'Stylist',
            salary: s.salary || 15000,
            commission: 0,
            incentive: 0,
            attendanceScore: 100,
            attendanceDays: 26,
            attendanceDeduction: 0,
            advance: s.advance || 0,
            deductAdvance: false,
            netPay: s.salary || 15000,
            status: 'draft'
        }));
        saveLocal(`hr_payroll_${year}_${month}`, entries);
        return { data: { success: true } };
    }
    if (url === '/payroll/sync-commissions') {
        const { year, month } = data;
        const entries = getLocal(`hr_payroll_${year}_${month}`, []);
        const updated = entries.map(e => ({ ...e, commission: Math.floor(Math.random() * 5000) + 1000 }));
        updated.forEach(e => {
            e.netPay = (e.salary || 0) + (e.commission || 0) + (e.incentive || 0) - (e.attendanceDeduction || 0) - (e.deductAdvance ? (e.advance || 0) : 0);
        });
        saveLocal(`hr_payroll_${year}_${month}`, updated);
        return { data: { success: true, synced: updated.length } };
    }
    if (url === '/payroll/sync-attendance') {
        const { year, month } = data;
        const entries = getLocal(`hr_payroll_${year}_${month}`, []);
        const updated = entries.map(e => {
            const score = Math.floor(Math.random() * 20) + 80;
            const ded = score < 90 ? 1000 : 0;
            return { ...e, attendanceScore: score, attendanceDeduction: ded };
        });
        updated.forEach(e => {
            e.netPay = (e.salary || 0) + (e.commission || 0) + (e.incentive || 0) - (e.attendanceDeduction || 0) - (e.deductAdvance ? (e.advance || 0) : 0);
        });
        saveLocal(`hr_payroll_${year}_${month}`, updated);
        return { data: { success: true, synced: updated.length } };
    }
    if (url === '/payroll/payouts') {
        const { year, month } = data;
        const entries = getLocal(`hr_payroll_${year}_${month}`, []);
        const updated = entries.map(e => ({ ...e, status: 'paid' }));
        saveLocal(`hr_payroll_${year}_${month}`, updated);
        return { data: { success: true } };
    }

    if (url === '/finance/expenses') {
        const exp = getLocal('fin_expenses', [
            { _id: 'e1', category: 'utilities', vendor: 'Torrent Power', amount: 12500, description: 'Electricity March', createdAt: '2024-04-05T10:00:00Z', paymentMethod: 'paid' },
            { _id: 'e2', category: 'rent', vendor: 'Space Realty', amount: 85000, description: 'Monthly Rent', createdAt: '2024-04-01T10:00:00Z', paymentMethod: 'paid' }
        ]);
        const newExp = { 
            ...data, 
            _id: Date.now().toString(), 
            createdAt: new Date().toISOString() 
        };
        exp.push(newExp);
        saveLocal('fin_expenses', exp);
        return { data: { success: true, data: newExp } };
    }

    if (url === '/finance/petty-cash/open-day') {
        const sum = getLocal('pet_summary', { balance: 5000 });
        const newSum = { 
            ...sum, 
            isOpenedToday: true, 
            isClosedToday: false, 
            businessDate: new Date().toISOString().split('T')[0] 
        };
        saveLocal('pet_summary', newSum);
        // Add entry
        const ent = getLocal('pet_entries', []);
        ent.unshift({ id: `PET-${Date.now()}`, type: 'DAY_OPEN', description: 'Day Session Initialized', staff: data.staffName, date: newSum.businessDate, timestamp: new Date().toISOString(), amount: 0 });
        saveLocal('pet_entries', ent);
        return { data: { success: true } };
    }
    if (url === '/finance/petty-cash/fund') {
        const sum = getLocal('pet_summary', { balance: 5000 });
        const amt = Number(data.amount);
        const newSum = { ...sum, balance: sum.balance + amt };
        saveLocal('pet_summary', newSum);
        const ent = getLocal('pet_entries', []);
        ent.unshift({ id: `PET-${Date.now()}`, type: 'FUND_ADDED', description: data.description, staff: data.source, date: sum.businessDate, timestamp: new Date().toISOString(), amount: amt });
        saveLocal('pet_entries', ent);
        return { data: { success: true } };
    }
    if (url === '/finance/petty-cash/expense') {
        const sum = getLocal('pet_summary', { balance: 5000 });
        const amt = Number(data.amount);
        const newSum = { ...sum, balance: sum.balance - amt };
        saveLocal('pet_summary', newSum);
        const ent = getLocal('pet_entries', []);
        ent.unshift({ id: `PET-${Date.now()}`, type: 'EXPENSE', category: data.category, description: data.description, staff: data.staff, date: sum.businessDate, timestamp: new Date().toISOString(), amount: amt, attachment: data.attachment });
        saveLocal('pet_entries', ent);
        return { data: { success: true } };
    }
    if (url === '/finance/petty-cash/close') {
        const sum = getLocal('pet_summary', { balance: 5000 });
        const newSum = { ...sum, isClosedToday: true, balance: data.closingBalance };
        saveLocal('pet_summary', newSum);
        const cl = getLocal('pet_closings', []);
        cl.unshift({ 
            id: `CLO-${Date.now()}`, 
            date: sum.businessDate, 
            timestamp: new Date().toISOString(), 
            openingBalance: sum.balance, 
            closingBalance: data.closingBalance, 
            denominations: data.denominations, 
            discrepancy: data.discrepancy, 
            verifiedBy: data.verifiedBy 
        });
        saveLocal('pet_closings', cl);
        return { data: { success: true } };
    }

    if (url === '/finance/reconcile') {
        return { data: { success: true } };
    }
    if (url === '/finance/bank-details') {
        saveLocal('fin_bank_details', data);
        return { data: { success: true } };
    }
    
    // INVENTORY WRITES
    if (url === '/products') {
        const prods = getLocal('inv_products', []);
        const newP = { ...data, _id: `p_${Date.now()}`, id: `p_${Date.now()}`, createdAt: new Date().toISOString() };
        saveLocal('inv_products', [newP, ...prods]);
        return { data: { success: true, data: newP } };
    }
    if (url === '/inventory/stock-in') {
        const history = getLocal('inv_stockin_history', []);
        const newH = { ...data, _id: `sin_${Date.now()}`, createdAt: new Date().toISOString(), performedBy: { name: 'Admin' } };
        saveLocal('inv_stockin_history', [newH, ...history]);
        return { data: { success: true, data: newH } };
    }
    if (url === '/inventory/adjust') {
        const history = getLocal('inv_adjust_history', []);
        const newH = { ...data, _id: `adj_${Date.now()}`, adjustmentDirection: data.type, createdAt: new Date().toISOString(), performedBy: { name: 'Admin' } };
        saveLocal('inv_adjust_history', [newH, ...history]);
        return { data: { success: true, data: newH } };
    }

    // SUBSCRIPTION ACTIONS
    if (url === '/subscriptions/cancel') {
        return { data: { success: true, message: 'Subscription cancelled successfully' } };
    }
    if (url === '/billing/razorpay/create-order') {
        return { 
            data: { 
                success: true, 
                data: { orderId: 'order_mock_123', amount: 499900, currency: 'INR', keyId: 'rzp_test_mock', isFree: false } 
            } 
        };
    }
    if (url === '/billing/razorpay/verify-payment') {
        return { data: { success: true } };
    }
    
    if (url === '/support/tickets') {
        const tickets = getLocal('sup_tickets', []);
        const newT = { ...data, _id: `tk_${Date.now()}`, createdAt: new Date().toISOString(), status: 'open', responses: [] };
        saveLocal('sup_tickets', [newT, ...tickets]);
        return { data: { success: true, data: newT } };
    }
    if (url.startsWith('/support/tickets/') && url.endsWith('/responses')) {
        const id = url.split('/')[3];
        const tickets = getLocal('sup_tickets', []);
        const t = tickets.find(x => x._id === id || x.id === id);
        if (t) {
            t.responses.push({ message: data.message, createdAt: new Date().toISOString(), userId: { name: 'Support', role: 'admin' } });
            saveLocal('sup_tickets', tickets);
        }
        return { data: { success: true, data: t } };
    }

    if (url === '/leaves') {
        const leaves = getLocal('WAPIXO_LEAVE_REGISTRY', []);
        const newL = { ...data, id: `lv_${Date.now()}`, appliedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), status: 'PENDING' };
        saveLocal('WAPIXO_LEAVE_REGISTRY', [newL, ...leaves]);
        return { data: { success: true, data: newL } };
    }

    if (url === '/payroll/mark-all-paid') {
        const { year, month } = data;
        const all = getLocal('hr_payroll', []);
        const updated = all.map(e => (e.year === year && e.month === month) ? { ...e, status: 'paid' } : e);
        saveLocal('hr_payroll', updated);
        return { data: { success: true } };
    }
    if (url === '/payroll/generate') {
        const { year, month } = data;
        const staff = getLocal('hr_staff', []);
        const existing = getLocal('hr_payroll', []);
        const filtered = existing.filter(e => !(e.year === year && e.month === month));
        const newEntries = staff.map(s => ({
            _id: `pay_${s._id || s.id}_${year}_${month}`,
            userId: s,
            year,
            month,
            baseSalary: s.salary || 25000,
            commission: 0,
            deductions: 0,
            netPay: s.salary || 25000,
            status: 'draft',
            workingDays: 30
        }));
        saveLocal('hr_payroll', [...newEntries, ...filtered]);
        return { data: { success: true } };
    }

    if (url === '/shifts') {
        const shifts = getLocal('hr_shifts', []);
        const newS = { ...data, _id: `s_${Date.now()}`, assignedUserIds: [], createdAt: new Date().toISOString() };
        saveLocal('hr_shifts', [newS, ...shifts]);
        return { data: { success: true, data: newS } };
    }

    if (url === '/attendance') {
        const allAtt = getLocal('hr_attendance', []);
        const entry = { ...data, _id: `att_${Date.now()}`, createdAt: new Date().toISOString() };
        const filtered = allAtt.filter(a => !(a.userId === data.userId && a.date === data.date));
        saveLocal('hr_attendance', [entry, ...filtered]);
        return { data: { success: true, data: entry } };
    }
    if (url === '/attendance/bulk') {
        const staff = getLocal('hr_staff', []);
        const allAtt = getLocal('hr_attendance', []);
        const date = data.date;
        const newEntries = staff.map(s => ({
            userId: s._id || s.id,
            date,
            status: data.status,
            checkInAt: data.status === 'present' ? `${date}T${data.defaultCheckIn || '09:00'}:00` : null,
            _id: `att_bulk_${s._id || s.id}_${Date.now()}`
        }));
        const filtered = allAtt.filter(a => a.date !== date);
        saveLocal('hr_attendance', [...newEntries, ...filtered]);
        return { data: { success: true } };
    }

    if (url === '/users') {
        const staff = getLocal('hr_staff', []);
        const newS = { ...data, _id: `u_${Date.now()}`, createdAt: new Date().toISOString() };
        saveLocal('hr_staff', [newS, ...staff]);
        return { data: { success: true, data: newS } };
    }

    if (url === '/tenants') {
        const tenants = getLocal('sup_tenants', []);
        const newT = { ...data, _id: `t_${Date.now()}`, createdAt: new Date().toISOString(), status: 'trial', mrr: 0, totalRevenue: 0, outletsCount: 1, staffCount: 1, features: {}, limits: { staffLimit: 5, outletLimit: 1, smsCredits: 100, storageGB: 1 } };
        saveLocal('sup_tenants', [newT, ...tenants]);
        return { data: { success: true, data: newT } };
    }
    if (url.startsWith('/tenants/') && url.endsWith('/resend-credentials')) {
        return { data: { success: true, message: 'Credentials reset to 123456 and email simulated.' } };
    }

    return { data: { success: true, data: { ...data, _id: `mock_${Date.now()}` } } };
};

export const mockPut = async (url, data) => {
    await delay(500);
    if (url.startsWith('/tenants/')) {
        const id = url.split('/').pop();
        const tenants = getLocal('sup_tenants', []);
        const updated = tenants.map(t => (t._id === id || t.id === id) ? { ...t, ...data } : t);
        saveLocal('sup_tenants', updated);
        const findT = updated.find(x => x._id === id || x.id === id);
        return { data: { success: true, data: findT } };
    }
    return { data: { success: true, data } };
};

export const mockPatch = async (url, data) => {
    await delay(500);
    if (url.startsWith('/bookings/')) {
        const id = url.split('/').pop();
        const bookings = getLocal('app_bookings', []);
        const idx = bookings.findIndex(b => (b.id === id || b._id === id));
        if (idx !== -1) {
            bookings[idx] = { ...bookings[idx], ...data };
            saveLocal('app_bookings', bookings);
        }
        return { data: { success: true, message: 'Booking status updated locally (Mock).' } };
    }
    if (url.includes('/invoices/') && url.endsWith('/settle')) {
        const parts = url.split('/');
        const id = parts[parts.indexOf('invoices') + 1];
        const invoices = getLocal('app_invoices', []);
        const idx = invoices.findIndex(i => i._id === id || i.invoiceNumber === id);
        if (idx !== -1) {
            invoices[idx].paymentStatus = 'paid';
            if (data.paymentMethod) invoices[idx].paymentMethod = data.paymentMethod;
            saveLocal('app_invoices', invoices);
        }
        return { data: { success: true } };
    }
    if (url.includes('/refund-action')) {
        const id = url.split('/')[2];
        const invoices = getLocal('app_invoices', []);
        const updated = invoices.map(inv => (inv._id === id || inv.id === id) ? { 
            ...inv, 
            refund: { ...(inv.refund || {}), status: data?.status || 'approved', remark: data?.remark, updatedAt: new Date().toISOString() } 
        } : inv);
        saveLocal('app_invoices', updated);
        return { data: { success: true } };
    }
    if (url.startsWith('/subscriptions/')) {
        const id = url.split('/').pop();
        const plans = getLocal('sup_plans', []);
        const updated = plans.map(p => (p._id === id || p.id === id) ? { ...p, ...data } : p);
        saveLocal('sup_plans', updated);
        const findP = updated.find(x => x._id === id || x.id === id);
        return { data: { success: true, data: findP } };
    }

    if (url === '/cms/support_faqs') {
        saveLocal('sup_faqs', data.content);
        return { data: { success: true } };
    }

    if (url.startsWith('/leads/')) {
        const id = url.split('/').pop();
        const leads = getLocal('sup_leads', []);
        const updated = leads.map(l => (l._id === id || l.id === id) ? { ...l, ...data } : l);
        saveLocal('sup_leads', updated);
        const findL = updated.find(x => x._id === id || x.id === id);
        return { data: { success: true, data: findL } };
    }

    if (url.startsWith('/products/')) {
        const id = url.split('/').pop();
        const prods = getLocal('inv_products', []);
        const updated = prods.map(p => (p._id === id || p.id === id) ? { ...p, ...data } : p);
        saveLocal('inv_products', updated);
        return { data: { success: true, data: { ...data } } };
    }
    if (url.startsWith('/suppliers/')) {
        const id = url.split('/').pop();
        const suppliers = getLocal('fin_suppliers', []);
        const updated = suppliers.map(s => (s._id === id || s.id === id) ? { ...s, ...data } : s);
        saveLocal('fin_suppliers', updated);
        return { data: { success: true, data: { ...data } } };
    }
    if (url.startsWith('/support/tickets/')) {
        const id = url.split('/').pop();
        const tickets = getLocal('sup_tickets', []);
        const updated = tickets.map(t => (t._id === id || t.id === id) ? { ...t, ...data } : t);
        saveLocal('sup_tickets', updated);
        const findT = updated.find(x => x._id === id || x.id === id);
        return { data: { success: true, data: findT } };
    }

    if (url.startsWith('/leaves/')) {
        const id = url.split('/').pop();
        const leaves = getLocal('WAPIXO_LEAVE_REGISTRY', []);
        const updated = leaves.map(l => (l.id === id || l._id === id) ? { ...l, ...data } : l);
        saveLocal('WAPIXO_LEAVE_REGISTRY', updated);
        return { data: { success: true } };
    }

    if (url.startsWith('/hr-performance/staff/') && url.endsWith('/goal')) {
        const id = url.split('/')[3];
        const allPerf = getLocal('hr_performance', {});
        if (!allPerf[id]) allPerf[id] = { revenue: 0, services: 0, rating: 5, contribution: 'Medium' };
        allPerf[id].goal = data.goal;
        saveLocal('hr_performance', allPerf);
        return { data: { success: true } };
    }
    if (url.startsWith('/bookings/') && url.endsWith('/approve')) {
        const id = url.split('/')[2];
        const bookings = getLocal('app_bookings', []);
        const updated = bookings.map(b => (b._id === id || b.id === id) ? { ...b, status: 'completed' } : b);
        saveLocal('app_bookings', updated);
        return { data: { success: true } };
    }

    if (url.startsWith('/blogs/')) {
        const id = url.split('/').pop();
        const blogs = getLocal('sup_blogs', []);
        const updated = blogs.map(b => b._id === id || b._id === parseInt(id) || String(b._id) === id ? { ...b, ...data } : b);
        saveLocal('sup_blogs', updated);
        const post = updated.find(b => b._id === id || b._id === parseInt(id) || String(b._id) === id);
        return { data: post };
    }
    if (url === '/users/me') {
        const profile = getLocal('sup_profile', {});
        const updated = { ...profile, ...data };
        saveLocal('sup_profile', updated);
        return { data: { success: true } };
    }
    if (url.startsWith('/cms/')) {
        const section = url.split('/').pop();
        const cms = getLocal('sup_cms', {});
        cms[section] = data.content;
        saveLocal('sup_cms', cms);
        return { data: { success: true } };
    }
    if (url.startsWith('/payroll/period')) {
        const { year, month, locked } = data;
        saveLocal(`hr_payroll_meta_${year}_${month}`, { locked });
        return { data: { success: true } };
    }
    if (url.startsWith('/payroll/entries/')) {
        const id = url.split('/').pop();
        // We need to find which month it belongs to. This is tricky in mock.
        // Let's assume current month for now or scan local keys.
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const key = `hr_payroll_${y}_${m}`;
        const all = getLocal(key, []);
        const updated = all.map(e => {
            if (e._id === id || e.id === id) {
                const newData = { ...e, ...data };
                newData.netPay = (newData.salary || 0) + (newData.commission || 0) + (newData.incentive || 0) - (newData.attendanceDeduction || 0) - (newData.deductAdvance ? (newData.advance || 0) : 0);
                return newData;
            }
            return e;
        });
        saveLocal(key, updated);
        return { data: { success: true } };
    }
    if (url.startsWith('/users/')) {
        const id = url.split('/').pop();
        const staff = getLocal('hr_staff', []);
        const updated = staff.map(s => (s._id === id || s.id === id) ? { ...s, ...data } : s);
        saveLocal('hr_staff', updated);
        return { data: { success: true, data: { ...data } } };
    }
    if (url.startsWith('/shifts/') && url.endsWith('/roster')) {
        const id = url.split('/')[2];
        const shifts = getLocal('hr_shifts', []);
        const updated = shifts.map(s => (s._id === id || s.id === id) ? { ...s, assignedUserIds: data.userIds } : s);
        saveLocal('hr_shifts', updated);
        return { data: { success: true } };
    }
    if (url.startsWith('/shifts/')) {
        const id = url.split('/').pop();
        const shifts = getLocal('hr_shifts', []);
        const updated = shifts.map(s => (s._id === id || s.id === id) ? { ...s, ...data } : s);
        saveLocal('hr_shifts', updated);
        return { data: { success: true, data: { ...data } } };
    }

    return { data: { success: true, data: { ...data } } };
};

export const mockDelete = async (url) => {
    await delay(400);
    if (url.startsWith('/products/')) {
        const id = url.split('/').pop();
        const prods = getLocal('inv_products', []);
        const filtered = prods.filter(p => p._id !== id && p.id !== id);
        saveLocal('inv_products', filtered);
    }
    if (url.startsWith('/suppliers/')) {
        const id = url.split('/').pop();
        const suppliers = getLocal('fin_suppliers', []);
        const filtered = suppliers.filter(s => s._id !== id && s.id !== id);
        saveLocal('fin_suppliers', filtered);
    }
    if (url.startsWith('/users/')) {
        const id = url.split('/').pop();
        const staff = getLocal('hr_staff', []);
        const filtered = staff.filter(s => s._id !== id && s.id !== id);
        saveLocal('hr_staff', filtered);
    }
    if (url.startsWith('/shifts/')) {
        const id = url.split('/').pop();
        const shifts = getLocal('hr_shifts', []);
        const filtered = shifts.filter(s => s._id !== id && s.id !== id);
        saveLocal('hr_shifts', filtered);
    }
    if (url.startsWith('/subscriptions/')) {
        const id = url.split('/').pop();
        const plans = getLocal('sup_plans', []);
        const filtered = plans.filter(p => p._id !== id && p.id !== id);
        saveLocal('sup_plans', filtered);
    }
    if (url.startsWith('/tenants/')) {
        const id = url.split('/').pop();
        const tenants = getLocal('sup_tenants', []);
        const filtered = tenants.filter(t => t._id !== id && t.id !== id);
        saveLocal('sup_tenants', filtered);
    }
    if (url.startsWith('/leads/')) {
        const id = url.split('/').pop();
        const leads = getLocal('sup_leads', []);
        const filtered = leads.filter(l => l._id !== id && l.id !== id);
        saveLocal('sup_leads', filtered);
    }
    if (url.startsWith('/blogs/')) {
        const id = url.split('/').pop();
        const blogs = getLocal('sup_blogs', []);
        const filtered = blogs.filter(b => b._id !== id && b._id !== parseInt(id));
        saveLocal('sup_blogs', filtered);
        return { data: { success: true } };
    }
    if (url.startsWith('/hr-performance/staff/') && url.endsWith('/goal')) {
        const id = url.split('/')[3];
        const staff = getLocal('hr_staff', []);
        const idx = staff.findIndex(s => s._id === id);
        if (idx !== -1) {
            staff[idx].goal = data.goal;
            saveLocal('hr_staff', staff);
        }
        return { data: { success: true, message: 'Goal updated locally' } };
    }
    return { data: { success: true } };
};

export default {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete
};
