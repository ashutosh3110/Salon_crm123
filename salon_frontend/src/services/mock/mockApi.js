
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
    if (url === '/dashboard/salon') return { data: dashData };
    if (url === '/tenants/me') return { data: bizData.salon.data };
    if (url === '/outlets') return { data: bizData.outlets }; // Sidebar/BusinessContext might expect the wrapper
    
    // Normalize outlets for internal use
    const outletsArr = Array.isArray(bizData.outlets?.data) ? bizData.outlets.data : (Array.isArray(bizData.outlets) ? bizData.outlets : []);

    if (url === '/users/me') return { data: { ...Object.values(authData.mock_users)[0], success: true } };
    if (url === '/users') return { data: { success: true, data: bizData.staff } };
    if (url === '/services') return { data: bizData.services };
    if (url === '/services/categories') return { data: bizData.categories };
    if (url === '/clients') return { data: bizData.clients };
    
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
        const faqs = [
            { q: "How do I change my subscription plan?", a: "You can upgrade or downgrade your plan from the 'Subscription & Plans' section in the sidebar." },
            { q: "Can I use the app offline?", a: "Wapixo is cloud-based and requires an active internet connection to sync data across devices." },
            { q: "How to add multiple outlets?", a: "Multi-outlet support is available in our Business and Enterprise plans. Contact support to enable it." },
        ];
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
            { _id: 'u_1', name: 'Alina Khan', role: 'stylist', email: 'alina@salon.com', phone: '9876543210', status: 'active', joinedDate: '2024-01-10', salary: 35000 },
            { _id: 'u_2', name: 'Rahul Sharma', role: 'manager', email: 'rahul@salon.com', phone: '9876543211', status: 'active', joinedDate: '2023-11-15', salary: 55000 }
        ]);
        return { data: { success: true, data: staff, results: staff } };
    }
    
    if (url === '/finance/petty-cash/summary') {
        const date = new Date().toISOString().split('T')[0];
        const status = getLocal(`pc_status_${date}`, { isOpenedToday: false, isClosedToday: false });
        const balance = getLocal('pc_balance', 5000);
        return {
            data: {
                success: true,
                data: {
                    balance,
                    isOpenedToday: status.isOpenedToday,
                    isClosedToday: status.isClosedToday,
                    businessDate: date,
                    categories: ['Staff Refreshment', 'Cleaning Supplies', 'Office & Stationery', 'Transport', 'Repair', 'Miscellaneous'],
                    denominations: [500, 200, 100, 50, 20, 10, 5, 2, 1]
                }
            }
        };
    }
    if (url === '/finance/petty-cash/entries') {
        const txns = getLocal('pc_transactions', [
            { id: 'TXN-901', type: 'DAY_OPEN', description: 'Initial Terminal Float', amount: 0, staff: 'Admin', date: new Date().toISOString().split('T')[0] }
        ]);
        return { data: { success: true, data: { results: txns } } };
    }
    if (url === '/finance/petty-cash/closings') {
        return { data: { success: true, data: { results: getLocal('pc_closings', []) } } };
    }

    // SUBSCRIPTION & BILLING
    if (url.startsWith('/subscriptions')) {
        return { data: { success: true, data: { results: subscriptionData.INITIAL_PLANS || [] } } };
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
    
    return { data: { success: true, data: [], results: [] } };
};

export const mockPost = async (url, data) => {
    await delay(800);
    
    // AUTH LOGIN
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

    if (url === '/finance/petty-cash/open-day') {
        const date = new Date().toISOString().split('T')[0];
        saveLocal(`pc_status_${date}`, { isOpenedToday: true, isClosedToday: false });
        // Log it
        const txns = getLocal('pc_transactions', []);
        txns.unshift({ id: 'TXN-' + Date.now(), type: 'DAY_OPEN', description: `Terminal Opened by ${data.staffName}`, amount: 0, staff: data.staffName, date });
        saveLocal('pc_transactions', txns);
        return { data: { success: true } };
    }
    if (url === '/finance/petty-cash/fund') {
        const current = getLocal('pc_balance', 5000);
        saveLocal('pc_balance', current + data.amount);
        const txns = getLocal('pc_transactions', []);
        txns.unshift({ id: 'TXN-' + Date.now(), type: 'FUND_ADDED', description: data.description, amount: data.amount, staff: data.source, date: new Date().toISOString().split('T')[0] });
        saveLocal('pc_transactions', txns);
        return { data: { success: true } };
    }
    if (url === '/finance/petty-cash/expense') {
        const current = getLocal('pc_balance', 5000);
        saveLocal('pc_balance', current - data.amount);
        const txns = getLocal('pc_transactions', []);
        txns.unshift({ id: 'TXN-' + Date.now(), type: 'EXPENSE', category: data.category, description: data.description, amount: data.amount, staff: data.staff, date: new Date().toISOString().split('T')[0] });
        saveLocal('pc_transactions', txns);
        return { data: { success: true } };
    }
    if (url === '/finance/petty-cash/close') {
        const date = new Date().toISOString().split('T')[0];
        saveLocal(`pc_status_${date}`, { isOpenedToday: true, isClosedToday: true });
        const closings = getLocal('pc_closings', []);
        closings.unshift({ id: 'CLO-' + Date.now(), date, timestamp: new Date().toISOString(), ...data });
        saveLocal('pc_closings', closings);
        return { data: { success: true } };
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

    if (url === '/suppliers/invoices/payments') {
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

    return { data: { success: true, data: { ...data, _id: `mock_${Date.now()}` } } };
};

export const mockPatch = async (url, data) => {
    await delay(500);
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
        const bookings = getLocal('bookings', []);
        const updated = bookings.map(b => (b._id === id || b.id === id) ? { ...b, status: 'completed' } : b);
        saveLocal('bookings', updated);
        return { data: { success: true } };
    }

    if (url.startsWith('/payroll/period')) {
        const { year, month, locked } = data;
        saveLocal(`hr_payroll_meta_${year}_${month}`, { locked });
        return { data: { success: true } };
    }
    if (url.startsWith('/payroll/entries/')) {
        const id = url.split('/').pop();
        const all = getLocal('hr_payroll', []);
        const updated = all.map(e => {
            if (e._id === id) {
                const newData = { ...e, ...data };
                if (data.baseSalary !== undefined || data.commission !== undefined || data.deductions !== undefined) {
                    newData.netPay = (newData.baseSalary || 0) + (newData.commission || 0) - (newData.deductions || 0);
                }
                return newData;
            }
            return e;
        });
        saveLocal('hr_payroll', updated);
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
    return { data: { success: true } };
};

export default {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete
};
