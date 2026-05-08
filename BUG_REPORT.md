# Wapixo Codebase — Full Bug Report

**Date:** 2026-05-08
**Codebase:** Node.js/Express backend + React/Vite frontend (Salon CRM SaaS)
**Scope:** Full static analysis of all Controllers, Models, Middleware, Utils, Routes, and Frontend config

---

## Severity Legend

| Symbol | Severity | Meaning |
|--------|----------|---------|
| 🔴 | CRITICAL | Application-breaking, data loss, or direct security exploit |
| 🟠 | HIGH | Serious functional failure or significant security weakness |
| 🟡 | MEDIUM | Incorrect behavior, data inconsistency, or partial failure |
| 🟢 | LOW | Code quality, minor logic issues, or hardened edge cases |

---

## Section 1 — Critical Security Vulnerabilities

---

### BUG-001 · CORS Wildcard + Credentials: Invalid and Insecure Config 🔴
**File:** `backend/app.js:13–16`

```js
app.use(cors({
    origin: '*',
    credentials: true
}));
```

**Problem:** The CORS spec forbids `origin: '*'` when `credentials: true`. Browsers will block all credentialed requests (cookies, Authorization headers) with this config. Additionally, the intent — allow all origins with credentials — is itself a critical vulnerability that allows any website to make authenticated API calls on behalf of logged-in users (CSRF-class attack).

**Fix:**
```js
app.use(cors({
    origin: ['https://yourdomain.com', 'http://localhost:5173'],
    credentials: true
}));
```

---

### BUG-002 · Hardcoded Default Password `123456` on Customer and Salon Models 🔴
**Files:** `backend/Models/Customer.js:29–31`, `backend/Models/Salon.js:37`

```js
// Customer.js
password: { type: String, default: '123456' }
// Salon.js
password: { type: String, default: '123456' }
```

**Problem:** Every customer created without an explicit password (via OTP-only flows, admin creation, or bulk import) gets the plain-text default `'123456'` stored. Customers created via `insertMany` (bulk import in `clientController.js:228`) **bypass the pre-save hook entirely** and store the literal string `'123456'` in the database, unencrypted. Any attacker who reads the DB can impersonate every bulk-imported customer.

**Fix:** Remove the default. Generate a secure random password or require the password field for non-OTP flows. For `insertMany`, pre-hash passwords before the call.

---

### BUG-003 · Hardcoded Razorpay Secret Fallback Key 🔴
**File:** `backend/Controllers/walletController.js:98`

```js
.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'lW6qHLoV7I0qXW8S0S8S0S8S')
```

**Problem:** A hardcoded secret key is committed to source code. If `RAZORPAY_KEY_SECRET` is not set in `.env`, all payment signature verifications use this known key — meaning any attacker who sees this source code can forge valid Razorpay payment signatures and credit arbitrary wallet balances without paying.

**Fix:**
```js
const secret = process.env.RAZORPAY_KEY_SECRET;
if (!secret) return res.status(500).json({ success: false, message: 'Payment config error' });
```

---

### BUG-004 · Wallet Top-up Amount Taken From Client Body, Not From Razorpay 🔴
**Files:** `backend/Controllers/paymentController.js:260–302`, `backend/Controllers/walletController.js:94–172`

```js
const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
// ...
const rechargeAmount = Number(amount); // <-- from client, not verified with Razorpay
customer.loyaltyPoints = (customer.loyaltyPoints || 0) + rechargeAmount;
```

**Problem:** The `amount` credited to the wallet comes directly from `req.body.amount`. After passing signature verification, the backend trusts the client's claimed amount rather than retrieving the actual order amount from Razorpay. A user can pay ₹1, send `amount: 100000` in the body, and get ₹1,00,000 in wallet credit.

**Fix:** After signature verification, fetch the order from Razorpay API:
```js
const order = await razorpay.orders.fetch(razorpay_order_id);
const rechargeAmount = order.amount / 100; // Use authoritative amount in rupees
```

---

### BUG-005 · Hardcoded Demo Phone Number with OTP Bypass (`1234`) 🔴
**File:** `backend/Controllers/customerAuthController.js:77–78, 129`

```js
const isDemoNumber = phone === '6268204871';
const otp = isDemoNumber ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
// ...
const isDemoOtp = (phone === '6268204871' && otp === '1234') || (process.env.NODE_ENV === 'development' && otp === '1234');
```

**Problem:** A specific phone number (`6268204871`) bypasses OTP validation using the fixed code `1234` in all environments including production. Additionally, any phone can bypass with OTP `1234` when `NODE_ENV === 'development'`. This is a production authentication bypass.

**Fix:** Remove the demo bypass entirely from production code. Gate it with `if (process.env.NODE_ENV !== 'production')`.

---

### BUG-006 · Passwords Not Excluded from API Responses (Password Leakage) 🔴
**Files:** `backend/Models/User.js`, `backend/Models/Staff.js`, `backend/Controllers/userController.js:19`

**Problem:** None of the User, Staff, or Customer models add `select: false` to the password field. This means:
- `Staff.find({ salonId })` in `getUsers` returns every staff member's bcrypt hash
- `Customer.find(...)` in `getClients` returns every customer's password (including plain-text `'123456'` for bulk-imported customers)

**Fix:** Add `select: false` to all password fields:
```js
password: { type: String, required: true, minlength: 8, select: false }
```

---

### BUG-007 · No Rate Limiting on Any Endpoint 🔴
**File:** `backend/app.js`

**Problem:** There is no rate limiting middleware anywhere in the application. OTP endpoints, login endpoints, and password reset endpoints are all unlimited. An attacker can:
- Brute-force 4-digit OTPs (10,000 combinations) to log in as any customer
- Enumerate valid emails via the forgot-password endpoint

**Fix:**
```js
const rateLimit = require('express-rate-limit');
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
```

---

### BUG-008 · OTP Not Deleted After Verification (Reusable OTPs) 🟠
**Files:** `backend/Controllers/authController.js:178–192` (verifyOTP), `authController.js:195–229` (resetPassword)

```js
// verifyOTP — OTP is verified but never deleted
const otpRecord = await Otp.findOne({ phone: email, otp });
if (otpRecord && otpRecord.expiresAt > new Date()) {
    res.json({ success: true, message: 'OTP verified successfully' });
    // OTP record remains in DB — can be reused
}
```

**Problem:** After a password reset, the OTP record stays in the database until the TTL expires (10 minutes). Anyone who intercepts the OTP can reset the password again within that window.

**Fix:** After successful password reset, call `await Otp.deleteOne({ _id: otpRecord._id })`.

---

## Section 2 — Critical Functional Bugs

---

### BUG-009 · Wallet Top-up Credits `loyaltyPoints` Instead of `walletBalance` 🔴
**File:** `backend/Controllers/paymentController.js:277`

```js
exports.verifyWalletPayment = async (req, res) => {
    // ...
    customer.loyaltyPoints = (customer.loyaltyPoints || 0) + rechargeAmount; // WRONG FIELD
    await customer.save();
```

**Problem:** The "Wallet Top-up" feature in `paymentController.js` adds the topped-up amount to `customer.loyaltyPoints` (the loyalty reward system) instead of `customer.walletBalance` (the actual spendable wallet). Customers who pay real money to top up their wallet get loyalty points instead of wallet balance — their money effectively disappears from usable wallet funds.

> **Note:** `walletController.verifyTopup` (the other implementation) correctly uses `walletBalance`. The `paymentController` version is entirely broken.

---

### BUG-010 · Double-Count of Customer Visits/Spend on Wallet-Paid Completed Bookings 🔴
**File:** `backend/Controllers/bookingController.js:120–157`

```js
// Path 1: Wallet payment block (lines 120–124)
customer.totalSpend = (customer.totalSpend || 0) + totalPrice;
customer.totalVisits = (customer.totalVisits || 0) + 1;
await customer.save();

// Path 2: booking.status === 'completed' block (lines 147–156)
await Customer.findByIdAndUpdate(targetCustomerId, {
    $inc: { totalVisits: 1, totalSpend: totalPrice || 0 }
});
```

**Problem:** If a booking is created with `paymentMethod: 'wallet'` AND `status: 'completed'`, both paths execute, incrementing `totalVisits` and `totalSpend` twice. Customer statistics become inaccurate, inflating analytics and potentially triggering loyalty tier upgrades prematurely.

---

### BUG-011 · Staff Performance Query Uses Non-Existent Field (`stylists.stylistId`) 🔴
**File:** `backend/Controllers/hrController.js:285–291`

```js
const query = {
    salonId,
    "stylists.stylistId": s._id, // This field DOES NOT EXIST in Booking model
    status: 'completed'
};
const bookings = await Booking.find(query);
const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
```

**Problem:** The Booking model has `staffId` (not `stylists.stylistId`). Every staff member's performance query matches 0 bookings. All staff show `revenue: 0, services: 0`, and contribution tier is always `'Low'`. The entire HR Performance dashboard is broken.

**Fix:** Replace `"stylists.stylistId": s._id` with `staffId: s._id`.

---

### BUG-012 · `updatePassword`: Wrong Model Selected for Salon Owner Admin 🟠
**File:** `backend/Controllers/authController.js:279`

```js
else if (req.user.role === 'admin' && !req.user.ownerName) Model = Salon;
```

**Problem:** A Salon Owner logs in as `role: 'admin'` and their `req.user` object has `ownerName` set. The condition `!req.user.ownerName` is `false` for the owner, causing the code to fall through to `Model = Staff`. A Salon Owner attempting to change their password will try `Staff.findById(req.user._id)` → finds nothing → crashes on `user.comparePassword()` because `user` is `null`.

**Fix:** The condition should be `req.user.role === 'admin' && req.user.ownerName` (without the `!`).

---

### BUG-013 · `updateDetails`: Wrong Model Selected for Salon Owner Admin 🟠
**File:** `backend/Controllers/authController.js:253`

```js
else if (req.user.role === 'admin' && !req.user.salonId) Model = Salon;
```

**Problem:** For a Salon Owner, the auth middleware sets `userObj.salonId = userObj._id` (auth.js:58). So `req.user.salonId` is always truthy. The condition `!req.user.salonId` is always `false`, so the Salon model is never selected. Salon Owners who try to update their name/email will silently fail or update the wrong record.

**Fix:** Detect Salon documents via `ownerName` presence: `req.user.role === 'admin' && req.user.ownerName`.

---

### BUG-014 · `updateStatus` Crashes for SuperAdmin (TypeError on `salonId.toString()`) 🟠
**File:** `backend/Controllers/bookingController.js:218`

```js
if (booking.salonId.toString() !== req.user.salonId.toString()) {
```

**Problem:** For a SuperAdmin, `req.user.salonId` is `undefined`. Calling `.toString()` on `undefined` throws `TypeError: Cannot read properties of undefined (reading 'toString')`, returning a 500 error instead of gracefully skipping the check.

**Fix:**
```js
if (req.user.role !== 'superadmin' && booking.salonId.toString() !== req.user.salonId.toString()) {
```

---

### BUG-015 · Outlet Staff Count Queries Wrong MongoDB Collection (`users` vs `staffs`) 🟠
**File:** `backend/Controllers/outletController.js:18–20`

```js
$lookup: {
    from: 'users',     // WRONG — should be 'staffs'
    localField: '_id',
    foreignField: 'outletId',
    as: 'staff'
}
```

**Problem:** Staff records are stored in the `staffs` collection (Mongoose auto-pluralizes `Staff` → `staffs`). The `$lookup` queries the `users` collection (User model = platform admins). Every outlet's `staffCount` will always be `0`.

**Fix:** Change `from: 'users'` to `from: 'staffs'`.

---

## Section 3 — Data Integrity & Race Condition Bugs

---

### BUG-016 · Invoice Number Race Condition (Duplicate Numbers Possible) 🟠
**File:** `backend/Controllers/posController.js:30–31`

```js
const count = await Invoice.countDocuments({ salonId });
const invoiceNumber = `INV-${salonId.toString().slice(-4).toUpperCase()}-${(count + 1).toString().padStart(5, '0')}`;
```

**Problem:** Under concurrent POS checkouts, two requests can read the same `count`, generate the same invoice number, and both attempt `Invoice.create()`. The second one fails with a MongoDB duplicate key error, returning an unhandled 500 error to the customer.

**Fix:** Use an atomic sequence counter document with `$inc`, or use `uuid` for invoice numbers.

---

### BUG-017 · Wallet Deduction in Booking is Not Atomic (Race Condition / Double-Spend) 🟠
**File:** `backend/Controllers/bookingController.js:112–124`

```js
customer.walletBalance -= totalPrice;
// ... many async operations ...
await customer.save();
```

**Problem:** Non-atomic read-modify-write. Two simultaneous booking requests for the same customer both read the same balance, both deduct, and both save — allowing a customer to overspend their wallet.

**Fix:**
```js
const updated = await Customer.findOneAndUpdate(
    { _id: targetCustomerId, walletBalance: { $gte: totalPrice } },
    { $inc: { walletBalance: -totalPrice } },
    { new: true }
);
if (!updated) return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
```

---

### BUG-018 · OTP Model Uses `phone` Field to Store Emails (Cross-Contamination Risk) 🟡
**File:** `backend/Controllers/authController.js:151`

```js
await Otp.create({
    phone: email,  // Storing an email in a field named 'phone'
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
});
```

**Problem:** If a user's email happens to match another user's phone number string (e.g., `8888888888@gmail.com` shares the prefix with phone `8888888888`), OTP lookups could match the wrong record. Also pollutes the data model and makes debugging very difficult.

**Fix:** Add a `type` field (`'phone'` | `'email'`) to the Otp model and include it in all lookups.

---

### BUG-019 · Global Phone Uniqueness Constraint vs. Per-Salon Client Creation Check Mismatch 🟠
**Files:** `backend/Models/Customer.js:90`, `backend/Controllers/clientController.js:88`

```js
// Customer.js — Global uniqueness
customerSchema.index({ phone: 1 }, { unique: true });

// clientController.js — But check is per-salon only
const existing = await Customer.findOne({ phone, salonId });
```

**Problem:** The database enforces global phone uniqueness. But `createClient` only checks `{ phone, salonId }`. If the same customer exists in another salon, the duplicate check passes, and `Customer.create()` throws `E11000 duplicate key error`, returning a confusing 500 error instead of a clear message.

**Fix:** Either check globally (`findOne({ phone })`), or change the index to `{ phone: 1, salonId: 1 }` if cross-salon customers are intended.

---

### BUG-020 · Supplier Balance Direction Inconsistency Between Controllers 🟡
**Files:** `backend/Controllers/inventoryController.js:94–100`, `backend/Controllers/financeController.js:320`

```js
// inventoryController.js — On stock purchase, decrements balance
$inc: { currentBalance: -totalAmount }

// financeController.js — On invoice payment, increments balance
$inc: { currentBalance: amount }
```

**Problem:** The two controllers use opposite sign conventions. After a purchase and a subsequent payment, the balance changes in the same direction instead of canceling out, producing an incorrect supplier balance. The comment in the inventory controller itself reads: `// Debt is negative in our current schema logic? or positive?` — confirming the confusion.

---

## Section 4 — Authorization & Access Control Issues

---

### BUG-021 · Booking Details Endpoint is Publicly Accessible (No Auth) 🟠
**File:** `backend/app.js:115`

```js
app.get('/booking-details/:bookingId', getBookingDetails);
// No `protect` middleware
```

**Problem:** Any unauthenticated user who can guess or enumerate a MongoDB ObjectId can retrieve full booking details including client name, phone, email, service, outlet address, and payment status.

> **Note:** The same route is also registered inside `bookingRoutes.js` at `/bookings/details/:bookingId` with auth protection. The duplicate unprotected registration in `app.js` creates a security hole.

**Fix:** `app.get('/booking-details/:bookingId', protect, getBookingDetails);`

---

### BUG-022 · `getCustomerBookings` Has No Cross-Customer Authorization 🟠
**File:** `backend/Controllers/bookingController.js:487–505`

```js
exports.getCustomerBookings = async (req, res) => {
    const { customerId } = req.params;
    const bookings = await Booking.find({ clientId: customerId });
    // No check that req.user is the customer or their salon admin
```

**Problem:** Any authenticated user (staff, another customer, etc.) can view any customer's complete booking history by supplying any valid `customerId` in the URL.

**Fix:**
```js
if (req.user.role === 'customer' && req.user._id.toString() !== customerId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
}
```

---

### BUG-023 · `bulkRecharge` Has No Salon-Ownership Validation 🟠
**File:** `backend/Controllers/walletController.js:176–248`

```js
const customer = await Customer.findByIdAndUpdate(
    cid,
    { $inc: { walletBalance: numericAmount } },
    { new: true }
);
// No salonId filter — any admin can recharge any customer
```

**Problem:** Any salon admin can recharge wallet balances for customers belonging to any other salon.

**Fix:** Add `salonId: req.user.salonId` to the find filter.

---

### BUG-024 · `upsertSupplier` Allows Cross-Salon Supplier Modification 🟠
**File:** `backend/Controllers/financeController.js:21–33`

```js
if (id) {
    supplier = await Supplier.findByIdAndUpdate(id, data, { new: true });
    // No salonId ownership check on update
}
```

**Problem:** Any authenticated salon admin can update any supplier by ID, including suppliers belonging to other salons.

**Fix:** `Supplier.findOneAndUpdate({ _id: id, salonId: req.user.salonId }, data, { new: true })`

---

### BUG-025 · `getCustomerWallet` and `getCustomerTransactions` Have No Authorization 🟡
**File:** `backend/Controllers/walletController.js:252–284`

```js
exports.getCustomerWallet = async (req, res) => {
    const customer = await Customer.findById(req.params.customerId);
```

Any authenticated user (including other customers) can read any customer's wallet balance and full transaction history by providing their ID in the URL.

---

## Section 5 — Logic & Calculation Bugs

---

### BUG-026 · Dashboard Wallet Liability Aggregation Uses Wrong Type Case 🟡
**File:** `backend/Controllers/dashboardController.js:34`

```js
{ $match: { salonId, type: 'credit' } } // lowercase 'credit'
```

**Problem:** WalletTransaction records are created with `type: 'CREDIT'` (uppercase) throughout the codebase. The dashboard match uses lowercase `'credit'` which matches nothing, always showing ₹0 wallet liability regardless of actual outstanding balances.

**Fix:** Change to `type: 'CREDIT'`.

---

### BUG-027 · `res` Variable Shadowed Inside Promise Callback 🟡
**File:** `backend/Controllers/dashboardController.js:34`

```js
WalletTransaction.aggregate([...]).then(res => res[0]?.total || 0)
//                                         ^^^
//                             shadows outer Express `res` object
```

**Fix:** Rename the callback parameter: `.then(result => result[0]?.total || 0)`

---

### BUG-028 · POS `checkout` Total Can Go Negative — Corrupts Customer Stats 🟡
**File:** `backend/Controllers/posController.js:46`

```js
const total = subtotal - discount - useLoyaltyPoints - useWalletAmount + tax;
// No floor check — total can be negative
```

**Problem:** If `discount + useLoyaltyPoints + useWalletAmount > subtotal + tax`, `total` becomes negative. The negative total is stored in the invoice, and `customer.totalSpend` is decremented, corrupting lifetime spend statistics.

**Fix:** `const total = Math.max(0, subtotal - discount - useLoyaltyPoints - useWalletAmount + tax);`

---

### BUG-029 · `billingController.getTransactions` Has Duplicate `createdAt` Key 🟢
**File:** `backend/Controllers/billingController.js:124–125`

```js
createdAt: t.createdAt,
createdAt: t.createdAt,  // Duplicate key
```

In JavaScript, duplicate object keys silently overwrite the first. Functionally harmless here (same value), but indicates copy-paste dead code. The intent was likely `updatedAt` for the second entry.

---

### BUG-030 · Available Slots Uses Timezone-Dependent Day Calculation 🟡
**File:** `backend/Controllers/bookingController.js:305`

```js
const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
```

**Problem:** `new Date("2025-05-08")` (ISO date string) is parsed as UTC midnight. `toLocaleDateString` uses the server's local timezone. In UTC-5, midnight UTC is the previous day locally — meaning slot availability is calculated for the wrong day.

**Fix:**
```js
const d = new Date(date + 'T00:00:00Z');
const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const dayName = days[d.getUTCDay()];
```

---

### BUG-031 · Birthday Cron Regex Fires on Wrong Dates (DD-MM / MM-DD Ambiguity) 🟡
**File:** `backend/Utils/cronJobs.js:113`

```js
const matchPattern = new RegExp(`(${month}[-/]${day})|(${day}[-/]${month})`);
```

**Problem:** For May 12 (`month=05, day=12`), the pattern matches both `05-12` (May 12) AND `12-05` (December 5). A customer with birthday December 5th will also receive a birthday message on May 12th.

**Fix:** Store dates in a single canonical format (`YYYY-MM-DD`) and match with:
```js
Customer.find({ dob: { $regex: new RegExp(`-${month}-${day}$`) } })
```

---

### BUG-032 · Marketing "Segmented" Campaign Sends to Only 10 Random Customers 🟡
**File:** `backend/Controllers/marketingController.js:126–130`

```js
} else {
    // Segmented (mock logic)
    recipients = await Customer.find({ salonId }).limit(10).select('_id phone email name');
}
```

**Problem:** The "segmented" campaign type silently sends to 10 arbitrary customers instead of the intended segment. The feature is shipped as a non-functional stub.

---

### BUG-033 · Loyalty Settings Are Global, Not Per-Salon; Salon Admins Cannot Configure Them 🟡
**File:** `backend/Controllers/loyaltyController.js:99, 135–138`

```js
const settings = await Setting.findOne(); // No salonId filter — returns global settings
// ...
if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Unauthorized...' });
}
```

**Problem:** All salons share one global loyalty settings document. A salon admin cannot configure their own loyalty program. This breaks multi-tenancy — one superadmin rate applies to every salon on the platform.

---

## Section 6 — Route & Middleware Issues

---

### BUG-034 · `/auth` Route Mounted Twice (`customerAuth` + `auth` Conflict) 🟠
**File:** `backend/app.js:57–59`

```js
app.use('/auth', customerAuth);  // Mounted first
app.use('/customer', customerAuth);
app.use('/auth', auth);          // Overlaps with first mount
```

**Problem:** Both `customerAuthRoutes` and `authRoutes` are mounted at `/auth`. If both routers define the same path (e.g., `POST /login`), the first matching router wins and the second is never reached — causing silent routing failures where the wrong controller handles a request.

**Fix:** Use distinct prefixes: `/auth/customer` for customer auth, `/auth/admin` for admin auth.

---

### BUG-035 · `/uploads` Route Conflict: Static Files + Upload Router 🟡
**File:** `backend/app.js:19, 122–123`

```js
app.use('/uploads', express.static(...));  // Line 19 — registered first
// ...
app.use('/uploads', uploadRouter);         // Line 122 — registered second
```

**Problem:** Both static file serving and the upload API router are mounted at `/uploads`. Behavior depends on whether `express.static` passes through to the next handler on 404, which can cause unpredictable routing for upload API calls.

---

### BUG-036 · Missing 404 Handler — Unknown Routes Return HTML Response 🟢
**File:** `backend/app.js`

No catch-all 404 handler exists. Unknown routes receive Express's default HTML "Cannot GET /unknown-route" response, leaking the framework structure and breaking the JSON API contract.

**Fix:**
```js
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
```

---

### BUG-037 · Missing Security Headers (No Helmet Middleware) 🟡
**File:** `backend/app.js`

No `helmet` middleware is applied. Missing security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `X-XSS-Protection`, `Content-Security-Policy`. The application is vulnerable to clickjacking, MIME sniffing, and other browser-side attacks.

**Fix:** `app.use(require('helmet')())` before any routes.

---

### BUG-038 · User Model Minimum Password Length is Only 3 Characters 🟡
**File:** `backend/Models/User.js:20`

```js
password: { type: String, required: true, minlength: 3 }
```

Super admins and admin users can have 3-character passwords. Industry standard minimum is 8–12 characters. The Staff model uses `minlength: 6`, also too weak.

---

## Section 7 — Incomplete / Placeholder Implementations

---

### BUG-039 · `openPettyCashDay` is a Non-Functional Placeholder 🟡
**File:** `backend/Controllers/financeController.js:171–173`

```js
exports.openPettyCashDay = async (req, res) => {
    res.status(200).json({ success: true, message: 'Day opened' }); // Does nothing
};
```

The endpoint always returns success without recording any database state. `getPettyCashSummary` has `isOpenedToday: true` hardcoded as a result. The "Open Day" feature appears to work in the UI but doesn't function.

---

### BUG-040 · Dashboard `serviceDistribution` is Hardcoded Mock Data 🟢
**File:** `backend/Controllers/dashboardController.js:103–108`

```js
serviceDistribution: [
    { name: 'Hair', value: 400, color: '#8B1A2D' },
    { name: 'Face', value: 300, color: '#B4912B' },
    { name: 'Body', value: 300, color: '#2C3E50' },
] // Mocking distribution for now
```

The service distribution pie chart always shows Hair:400, Face:300, Body:300 regardless of actual bookings.

---

### BUG-041 · Marketing Automations Are Hardcoded Static Stubs — UI Toggles Do Nothing 🟡
**File:** `backend/Controllers/marketingController.js:196–222`

```js
exports.getAutomations = async (req, res) => {
    res.status(200).json({
        success: true,
        data: [
            { id: 'birthday', enabled: true, ... },
            { id: 'follow_up', enabled: false, ... }
        ]
    });
};
```

The automation settings are static and cannot be updated via API. The `enabled` state is hardcoded. The toggle in the UI does nothing.

---

### BUG-042 · `deleteClient` Does Not Clean Up Associated Data (Orphaned Records) 🟡
**File:** `backend/Controllers/clientController.js:153–174`

When a client is deleted, their associated bookings, invoices, loyalty transactions, wallet transactions, and memberships remain orphaned in the database. This causes:
- Documents referencing a non-existent `clientId`
- Inflated loyalty member counts
- Broken booking history pages

---

### BUG-043 · Booking Model `source` Enum Contains Duplicate Case Variants 🟢
**File:** `backend/Models/Booking.js:37–40`

```js
enum: ['app', 'admin', 'pos', 'web', 'APP', 'ADMIN', 'POS', 'WEB'],
```

Both lowercase and uppercase versions are in the enum. Bookings created with `source: 'App'` fail validation. Data stored with mixed cases produces inconsistent analytics queries.

---

### BUG-044 · Hardcoded Cloudinary Fallback Credentials Committed to Source Code 🟠
**File:** `backend/Middleware/upload.js:7–11`

```js
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfs',
    api_key: process.env.CLOUDINARY_API_KEY || '123',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});
```

If env vars are not set, the application silently uses these placeholder values. All image uploads will fail with Cloudinary auth errors. More critically, if a real Cloudinary account ever uses these credentials, images could be uploaded to the wrong account.

---

### BUG-045 · Missing `CastError` Handler — Invalid ObjectIds Return 500 Instead of 400 🟡
**Files:** All controllers accepting `:id` params

When a route like `/bookings/not-an-objectid` is called, Mongoose throws `CastError: Cast to ObjectId failed`. All catch blocks return the raw error message in a 500 response, leaking internal implementation details. The correct response is `400 Bad Request`.

**Fix:**
```js
app.use((err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
});
```

---

## Summary Table

| Bug ID | Severity | Area | Short Description |
|--------|----------|------|-------------------|
| BUG-001 | 🔴 CRITICAL | Security | CORS wildcard + credentials — invalid and insecure config |
| BUG-002 | 🔴 CRITICAL | Security | Default password `123456` stored plain-text via `insertMany` |
| BUG-003 | 🔴 CRITICAL | Security | Hardcoded Razorpay secret key in source code |
| BUG-004 | 🔴 CRITICAL | Security | Wallet top-up amount taken from client body, not verified from Razorpay |
| BUG-005 | 🔴 CRITICAL | Security | Demo phone number bypasses OTP auth with `1234` in production |
| BUG-006 | 🔴 CRITICAL | Security | Passwords not excluded from API responses |
| BUG-007 | 🔴 CRITICAL | Security | No rate limiting on any endpoint — OTP brute-force possible |
| BUG-008 | 🟠 HIGH | Security | OTP not deleted after use — reusable within 10 minutes |
| BUG-009 | 🔴 CRITICAL | Finance | Wallet top-up credits `loyaltyPoints` instead of `walletBalance` |
| BUG-010 | 🔴 CRITICAL | Booking | Completed wallet bookings double-count visits and spend |
| BUG-011 | 🔴 CRITICAL | HR | Staff performance query uses non-existent field — always returns 0 |
| BUG-012 | 🟠 HIGH | Auth | Salon owner `updatePassword` selects wrong model — crashes |
| BUG-013 | 🟠 HIGH | Auth | Salon owner `updateDetails` selects wrong model — fails silently |
| BUG-014 | 🟠 HIGH | Booking | `updateStatus` crashes for SuperAdmin (TypeError on undefined) |
| BUG-015 | 🟠 HIGH | Outlet | Staff count queries `users` collection instead of `staffs` — always 0 |
| BUG-016 | 🟠 HIGH | POS | Invoice number race condition — duplicates under concurrent requests |
| BUG-017 | 🟠 HIGH | Wallet | Non-atomic wallet deduction — double-spend possible |
| BUG-018 | 🟡 MEDIUM | Auth | OTP model stores emails in `phone` field — collision risk |
| BUG-019 | 🟠 HIGH | Client | Global phone uniqueness vs. per-salon check mismatch → unhandled 500 |
| BUG-020 | 🟡 MEDIUM | Finance | Supplier balance direction inconsistent across controllers |
| BUG-021 | 🟠 HIGH | Security | Booking details endpoint is public — no auth middleware |
| BUG-022 | 🟠 HIGH | Security | Any user can read any customer's complete booking history |
| BUG-023 | 🟠 HIGH | Security | `bulkRecharge` has no salon-ownership check |
| BUG-024 | 🟠 HIGH | Security | `upsertSupplier` allows cross-salon supplier modification |
| BUG-025 | 🟡 MEDIUM | Security | Wallet balance and transactions readable by any authenticated user |
| BUG-026 | 🟡 MEDIUM | Dashboard | Wallet liability aggregation uses wrong type case (`credit` vs `CREDIT`) |
| BUG-027 | 🟡 MEDIUM | Dashboard | `res` variable shadowed inside Promise callback |
| BUG-028 | 🟡 MEDIUM | POS | Checkout total can go negative — corrupts customer lifetime stats |
| BUG-029 | 🟢 LOW | Billing | Duplicate `createdAt` key in transaction mapper object |
| BUG-030 | 🟡 MEDIUM | Booking | Available slots use timezone-dependent day calculation — wrong day possible |
| BUG-031 | 🟡 MEDIUM | Cron | Birthday cron regex ambiguous — fires on wrong dates |
| BUG-032 | 🟡 MEDIUM | Marketing | Segmented campaign type sends to 10 random customers only |
| BUG-033 | 🟡 MEDIUM | Loyalty | Loyalty settings are global not per-salon; salon admins cannot configure |
| BUG-034 | 🟠 HIGH | Routing | `/auth` route conflict — `customerAuth` and `auth` mounted at same path |
| BUG-035 | 🟡 MEDIUM | Routing | `/uploads` route conflict — static middleware and upload router overlap |
| BUG-036 | 🟢 LOW | API | No 404 handler — unknown routes return HTML and leak framework info |
| BUG-037 | 🟡 MEDIUM | Security | No Helmet middleware — all security headers missing |
| BUG-038 | 🟡 MEDIUM | Security | User model minimum password length is only 3 characters |
| BUG-039 | 🟡 MEDIUM | Finance | `openPettyCashDay` is a non-functional placeholder |
| BUG-040 | 🟢 LOW | Dashboard | Service distribution chart is hardcoded mock data, not real bookings |
| BUG-041 | 🟡 MEDIUM | Marketing | Automation settings are static stubs — UI toggles do nothing |
| BUG-042 | 🟡 MEDIUM | Client | Deleting a client leaves orphaned bookings, invoices, and transactions |
| BUG-043 | 🟢 LOW | Data | Booking `source` enum has duplicate lowercase and uppercase variants |
| BUG-044 | 🟠 HIGH | Upload | Hardcoded Cloudinary fallback credentials committed to source code |
| BUG-045 | 🟡 MEDIUM | API | No `CastError` handler — invalid ObjectIds return 500 instead of 400 |

---

## Bug Count by Severity

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 9 |
| 🟠 HIGH | 16 |
| 🟡 MEDIUM | 15 |
| 🟢 LOW | 5 |
| **Total** | **45** |

---

## Recommended Fix Priority

### Immediate (Before Any Production Traffic)
1. BUG-003 — Remove hardcoded Razorpay secret
2. BUG-005 — Remove demo phone/OTP bypass
3. BUG-002 — Fix default password + `insertMany` plain-text storage
4. BUG-004 — Verify wallet amount from Razorpay, not client body
5. BUG-007 — Add rate limiting to auth endpoints
6. BUG-001 — Fix CORS configuration

### This Sprint
7. BUG-009 — Fix wallet top-up crediting wrong field
8. BUG-010 — Fix double-counting on wallet+completed bookings
9. BUG-011 — Fix HR performance query field name
10. BUG-012/013 — Fix model selection for Salon owner auth flows
11. BUG-021 — Add auth middleware to public booking details route
12. BUG-006 — Add `select: false` to all password fields

### Next Sprint
- BUG-016, BUG-017 — Fix race conditions (invoice numbers, wallet deduction)
- BUG-022, BUG-023, BUG-024, BUG-025 — Fix authorization gaps
- BUG-015, BUG-014 — Fix outlet staff count and superadmin crash
- BUG-019 — Fix phone uniqueness mismatch
