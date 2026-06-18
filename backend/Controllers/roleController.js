const Role = require('../Models/Role');

// @desc    Get all roles for a salon
// @route   GET /api/roles
// @access  Private
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find({ salonId: req.user.salonId });
        res.json({ success: true, count: roles.length, data: roles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
exports.createRole = async (req, res) => {
    try {
        req.body.salonId = req.user.salonId;
        if ((!req.body.permissions || req.body.permissions.length === 0) && req.body.roleType) {
            req.body.permissions = getRoleDefaultPermissions(req.body.roleType);
        }
        const role = await Role.create(req.body);
        res.status(201).json({ success: true, data: role });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Role already exists' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
exports.updateRole = async (req, res) => {
    try {
        let role = await Role.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

        role = await Role.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: role });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, salonId: req.user.salonId });
        if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
        
        if (role.isDefault) {
            return res.status(400).json({ success: false, message: 'Default roles cannot be deleted' });
        }

        await role.deleteOne();
        res.json({ success: true, message: 'Role deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getRoleDefaultPermissions = (roleType) => {
    switch (roleType) {
        case 'manager':
            return [
                'dashboard', 'setup_outlets', 'setup_staff', 'services_list', 'services_categories', 
                'reports_sales', 'reports_bookings', 'reports_staff', 'reports_customer', 'reports_expenses', 
                'hr_attendance', 'hr_payroll', 'crm_directory', 'crm_inquiries', 'crm_wallets', 
                'crm_feedback', 'crm_reengage', 'crm_bridal', 'crm_birthday_anniversary', 'support'
            ];
        case 'receptionist':
            return [
                'pos_dashboard', 'pos_billing', 'pos_invoices', 'pos_reminders', 
                'bookings_registry', 'bookings_new', 'crm_directory', 'crm_inquiries'
            ];
        case 'accountant':
            return [
                'finance_dashboard', 'finance_transactions', 'finance_cash_book', 'finance_expenses', 
                'reports_sales', 'reports_expenses'
            ];
        case 'inventory':
            return [
                'inventory_products', 'inventory_shop_orders', 'inventory_categories', 
                'inventory_stock_overview', 'inventory_transfer', 'suppliers_directory', 'suppliers_invoices'
            ];
        case 'stylist':
            return ['support'];
        default:
            return [];
    }
};

const getRoleDefaultSidebarItems = (roleType) => {
    switch (roleType) {
        case 'stylist':
            return [
                { id: 'stylist_overview', label: 'Overview' },
                { id: 'stylist_attendance', label: 'Attendance' },
                { id: 'stylist_clients', label: 'My clients' },
                { id: 'stylist_commissions', label: 'Earnings' },
                { id: 'stylist_timeoff', label: 'Time off' },
                { id: 'stylist_settings', label: 'Settings' },
                { id: 'stylist_support', label: 'Support' }
            ];
        case 'receptionist':
            return [
                { id: 'receptionist_dashboard', label: 'Dashboard' },
                { id: 'receptionist_attendance', label: 'Attendance' },
                { id: 'receptionist_appointments', label: 'Appointments & Orders' },
                { id: 'receptionist_leads', label: 'Lead & Enquiry' },
                { id: 'receptionist_billing', label: 'Quick Bill' },
                { id: 'receptionist_invoices', label: 'Invoice & Payments' },
                { id: 'receptionist_petty_cash', label: 'Wallet / Petty Cash' },
                { id: 'receptionist_profile', label: 'Profile' },
                { id: 'receptionist_support', label: 'Support' }
            ];
        case 'manager':
            return [
                { id: 'manager_dashboard', label: 'Dashboard' },
                { id: 'manager_performance', label: 'Performance' },
                { id: 'manager_attendance', label: 'Attendance' },
                { id: 'manager_targets', label: 'Targets' },
                { id: 'manager_feedback', label: 'Feedback' },
                { id: 'manager_approvals', label: 'Service Approvals' },
                { id: 'manager_settings', label: 'Settings' },
                { id: 'manager_support', label: 'Support' }
            ];
        case 'accountant':
            return [
                { id: 'accountant_dashboard', label: 'Dashboard' },
                { id: 'accountant_revenue', label: 'Revenue Stream' },
                { id: 'accountant_expenses', label: 'Expense Matrix' },
                { id: 'accountant_invoices', label: 'Supplier Invoices' },
                { id: 'accountant_payroll', label: 'Payroll Protocol' },
                { id: 'accountant_petty_cash', label: 'Petty Cash' },
                { id: 'accountant_tax', label: 'Taxation / GST' },
                { id: 'accountant_reconciliation', label: 'Reconciliation' },
                { id: 'accountant_settings', label: 'System Prefs' }
            ];
        case 'inventory':
            return [
                { id: 'inventory_dashboard', label: 'Operational Dashboard' },
                { id: 'inventory_stock', label: 'Asset Ledger' },
                { id: 'inventory_purchase', label: 'Procurement Matrix' },
                { id: 'inventory_transfer', label: 'Deployment Logs' },
                { id: 'inventory_alerts', label: 'Depletion Alerts' },
                { id: 'inventory_reports', label: 'Analysis Vectors' },
                { id: 'inventory_settings', label: 'System Prefs' }
            ];
        default:
            return [];
    }
};

// @desc    Get default permissions and sidebar items for a role type
// @route   GET /api/roles/defaults/:roleType
// @access  Private (Admin)
exports.getDefaults = async (req, res) => {
    try {
        const { roleType } = req.params;
        const permissions = getRoleDefaultPermissions(roleType);
        const sidebarItems = getRoleDefaultSidebarItems(roleType);
        res.json({
            success: true,
            data: {
                roleType,
                permissions,
                sidebarItems
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getRoleDefaultPermissions = getRoleDefaultPermissions;
