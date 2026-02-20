# 🚀 Wapixo SalonCRM — Landing Page Implementation Plan

---

## 🎨 Design System & Color Palette

| Token          | Hex       | Usage                                    |
|----------------|-----------|------------------------------------------|
| **Black**      | `#000000` | Primary text, navbar bg, footer bg       |
| **Off-White**  | `#E9E9E9` | Section backgrounds, cards, borders      |
| **Brand Rose** | `#B85C5C` | CTA buttons, accents, highlights, links  |
| **White**      | `#FFFFFF` | Alternate section backgrounds, card text |

### Typography
- **Font:** `Inter` (already loaded via Google Fonts)
- **Headings:** Bold/ExtraBold — large, impactful
- **Body:** Regular/Medium — 16px base, 1.6 line-height

### Logo Assets
- **`/logo1.png`** — White version → used in dark sections (Navbar, Hero, Footer)
- **`/logo2.png`** — Black version → used in light sections if needed

---

## 📁 File Structure

```
src/
├── pages/
│   └── LandingPage.jsx          ← Main page component (assembles all sections)
│
├── components/
│   └── landing/
│       ├── Navbar.jsx            ← Sticky transparent → solid navbar
│       ├── HeroSection.jsx       ← Full-screen hero with animations
│       ├── ProblemsSection.jsx   ← Pain points with animated cards
│       ├── SolutionSection.jsx   ← How Wapixo solves problems
│       ├── FeaturesSection.jsx   ← Core modules grid (9 features)
│       ├── ScreenshotsSection.jsx← Dashboard/POS/Mobile screenshots
│       ├── PricingSection.jsx    ← 3-tier pricing cards
│       ├── TestimonialsSection.jsx← Customer reviews carousel
│       ├── FAQSection.jsx        ← Accordion-style FAQ
│       ├── CTASection.jsx        ← Final call-to-action banner
│       └── Footer.jsx            ← Full footer with links & socials
│
├── styles/
│   └── landing.css               ← Landing-page-specific animations & styles
```

---

## 📐 Section-by-Section Breakdown

---

### 1️⃣ NAVBAR (`Navbar.jsx`)

**Behavior:**
- Fixed/sticky at top, starts **transparent** over hero → becomes **solid black** on scroll
- Smooth transition with `backdrop-filter: blur()`
- Mobile: hamburger menu with slide-in drawer

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo1 (white)]   Home  Features  Pricing  FAQ  Contact    │
│                                          [Start Free Trial] │
└──────────────────────────────────────────────────────────────┘
```

**Details:**
- Logo: `/logo1.png` (white), height ~40px
- Links: smooth scroll to sections using `id` anchors
- CTA Button: `#B85C5C` background, white text, rounded-full
- Animation: Navbar slides down with `fadeIn` on page load
- Mobile: Hamburger icon → full-screen overlay menu with staggered link animations

---

### 2️⃣ HERO SECTION (`HeroSection.jsx`)

**Goal:** Visitor understands in 5 seconds: *"This software manages salon businesses"*

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (Full-screen, black background)                                   │
│                                                                    │
│       All-in-One Salon Management          [Dashboard Mockup]      │
│       Software for Modern Salons           (floating, with glow)   │
│                                                                    │
│       Manage bookings, billing, staff,                             │
│       inventory & marketing — all in one.                          │
│                                                                    │
│       [Start Free Trial]  [Book a Demo]                            │
│                                                                    │
│       ───── Trusted by 500+ salons ─────                           │
│       [stat] 10K+ Bookings  [stat] 99.9% Uptime  [stat] 24/7      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- **Background:** Solid black (`#000`) with subtle gradient mesh / animated floating circles in `#B85C5C` opacity
- **Headline:** 48-64px, white bold, animated word-by-word reveal (typing effect or staggered fade-in)
- **Subheadline:** 18px, `#E9E9E9`, fade-in with 0.3s delay
- **CTA Buttons:**
  - "Start Free Trial" → `#B85C5C` bg, white text, hover scale + glow
  - "Book a Demo" → transparent border white, hover fill `#B85C5C`
- **Dashboard Mockup:** Generated image of a salon dashboard, floating with subtle up-down animation + soft shadow/glow
- **Stats Bar:** 3 counters with count-up animation on scroll into view
- **Animated Elements:**
  - Floating gradient orbs (CSS `@keyframes float`)
  - Particle dots moving slowly in background
  - Dashboard image has a subtle parallax tilt on mouse move

---

### 3️⃣ PROBLEMS SECTION (`ProblemsSection.jsx`)

**Goal:** Salon owners feel: *"Yes, this is MY problem!"*

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (White background)                                                │
│                                                                    │
│  Still Managing Your Salon                                         │
│  the Old Way?                                                      │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │ 📋       │  │ ❌       │  │ 📦       │                        │
│  │ Manual   │  │ Missed   │  │ Stock    │                        │
│  │ Register │  │ Appoint. │  │ Losses   │                        │
│  └──────────┘  └──────────┘  └──────────┘                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │ 👥       │  │ 📢       │  │ 📊       │                        │
│  │ Staff    │  │ No       │  │ No       │                        │
│  │ Tracking │  │ Marketing│  │ Reports  │                        │
│  └──────────┘  └──────────┘  └──────────┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Background: White (`#FFFFFF`)
- Section header: Black text, `#B85C5C` accent underline
- 6 problem cards in a 3×2 grid (responsive: 2×3 on tablet, 1×6 mobile)
- Each card:
  - Light `#E9E9E9` background, rounded-2xl
  - Icon (emoji or react-icon) with `#B85C5C` tint
  - Problem title (bold, black)
  - Short description (gray)
  - On hover: subtle lift + left-border turns `#B85C5C`
- Animation: Cards stagger fade-in-up on scroll (using Intersection Observer)

**Pain Points Content:**
1. 📋 **Manual Registers** — "Still using notebooks to track clients?"
2. ❌ **Missed Appointments** — "Clients forget, you lose revenue"
3. 📦 **Stock & Inventory Loss** — "Products expire, money wastes"
4. 👥 **Staff Tracking Issues** — "No attendance, no performance data"
5. 📢 **Zero Marketing** — "No WhatsApp, no SMS, no campaigns"
6. 📊 **No Reports** — "You don't know your profit or loss"

---

### 4️⃣ SOLUTION SECTION (`SolutionSection.jsx`)

**Goal:** Show how Wapixo solves ALL those problems

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (Off-white #E9E9E9 background)                                    │
│                                                                    │
│  [App Screenshot]        Meet Wapixo                               │
│  (animated slide-in)     Your Complete Salon                       │
│                          Management Solution                       │
│                                                                    │
│                          ✅ Smart Booking Calendar                 │
│                          ✅ Lightning-Fast POS Billing             │
│                          ✅ WhatsApp Reminders & Marketing         │
│                          ✅ Built-in Loyalty System                │
│                          ✅ Real-time Inventory Tracking           │
│                          ✅ Staff Performance & Payroll            │
│                                                                    │
│                          [Explore Features →]                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Split layout: 50% screenshot (left) | 50% content (right)
- Screenshot: app mockup with soft shadow, slight tilt, slide-in-left animation
- Checkpoints: each point fades in sequentially on scroll
- Check icons: `#B85C5C` color
- CTA: text link with arrow, `#B85C5C` color
- Mobile: stacked vertically (image on top, content below)

---

### 5️⃣ FEATURES SECTION (`FeaturesSection.jsx`)

**Goal:** Showcase all 9 core modules in an impressive grid

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (White background)                                                │
│                                                                    │
│  Everything You Need to                                            │
│  Run Your Salon                                                    │
│                                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                           │
│  │ 👤 CRM  │  │ 📅 Book │  │ 💳 POS  │                           │
│  │ & Client│  │ Online  │  │ Billing │                           │
│  │ History │  │ Booking │  │         │                           │
│  └─────────┘  └─────────┘  └─────────┘                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                           │
│  │ 💬 WA   │  │ ❤️ Loyal│  │ 📦 Inv. │                           │
│  │ Market. │  │ Referral│  │ Mgmt    │                           │
│  └─────────┘  └─────────┘  └─────────┘                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                           │
│  │ 💰 Pay  │  │ 📊 Anal │  │ 🏢 Multi│                           │
│  │ & Staff │  │ Reports │  │ Branch  │                           │
│  └─────────┘  └─────────┘  └─────────┘                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- 3×3 grid (responsive: 2-col tablet, 1-col mobile)
- Each card:
  - White bg with subtle border `#E9E9E9`
  - Icon in `#B85C5C` circle/badge
  - Feature name (bold, 18px)
  - 1-2 line description
  - Hover: card lifts, border becomes `#B85C5C`, icon scales up
- Staggered fade-in animation on scroll

**9 Features:**
1. **CRM & Client History** — Complete client profiles, visit history & preferences
2. **Online Booking** — 24/7 online appointment scheduling with calendar
3. **POS Billing** — Fast checkout with multiple payment methods
4. **WhatsApp Marketing** — Automated reminders, offers & campaigns
5. **Loyalty & Referrals** — Points, rewards & referral programs
6. **Inventory Management** — Stock tracking, alerts & supplier orders
7. **Payroll & Staff Tracking** — Attendance, commissions & performance
8. **Analytics & Reports** — Revenue, trends & business insights
9. **Multi-Branch Support** — Manage multiple outlets from one dashboard

---

### 6️⃣ SCREENSHOTS / DEMO SECTION (`ScreenshotsSection.jsx`)

**Goal:** Show the actual product — build trust and excitement

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (Black background)                                                │
│                                                                    │
│  See Wapixo in Action                                              │
│                                                                    │
│  [Tab: Dashboard] [Tab: POS] [Tab: Mobile] [Tab: Reports]         │
│                                                                    │
│  ┌─────────────────────────────────────────────────┐               │
│  │                                                 │               │
│  │         (Active Screenshot with glow)           │               │
│  │                                                 │               │
│  └─────────────────────────────────────────────────┘               │
│                                                                    │
│  [Book a Free Demo →]                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Dark/black section for contrast
- Tab navigation: active tab has `#B85C5C` underline
- Screenshot: centered, large, with `#B85C5C` glow/shadow
- Smooth crossfade transition between tabs
- Generated mockup images for each tab view
- CTA button below

---

### 7️⃣ PRICING SECTION (`PricingSection.jsx`)

**Goal:** Convert visitors into subscribers

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (White / Off-white background)                                    │
│                                                                    │
│  Simple, Transparent Pricing                                       │
│                                                                    │
│  [Monthly]  [Annual — Save 20%]  ← toggle                         │
│                                                                    │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐                    │
│  │  BASIC   │  │  ⭐ PRO      │  │ENTERPRISE│                    │
│  │          │  │  (Popular)   │  │          │                    │
│  │  ₹999/mo │  │  ₹2,499/mo  │  │  Custom  │                    │
│  │          │  │              │  │          │                    │
│  │ 1 Outlet │  │ 3 Outlets   │  │Unlimited │                    │
│  │ 5 Staff  │  │ 15 Staff    │  │Unlimited │                    │
│  │ 500 WA   │  │ 2000 WA     │  │Unlimited │                    │
│  │ Basic CRM│  │ Full CRM    │  │ Full CRM │                    │
│  │ POS      │  │ POS + Inv.  │  │Everything│                    │
│  │          │  │ Analytics   │  │ Priority │                    │
│  │          │  │ Loyalty     │  │ Support  │                    │
│  │          │  │              │  │          │                    │
│  │[Start]   │  │[Start Trial]│  │[Contact] │                    │
│  └──────────┘  └──────────────┘  └──────────┘                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Monthly/Annual toggle switch
- 3 cards side by side
- **Pro plan** = "Popular" → highlighted with `#B85C5C` border/badge, slightly elevated
- Features list with checkmarks (✅ included, ✗ not included)
- Basic & Enterprise: simple white cards with `#E9E9E9` border
- CTA buttons: Basic → secondary style, Pro → `#B85C5C` primary, Enterprise → black
- Cards animate scale-in on scroll

---

### 8️⃣ TESTIMONIALS SECTION (`TestimonialsSection.jsx`)

**Goal:** Social proof — real people trust Wapixo

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (#E9E9E9 background)                                              │
│                                                                    │
│  What Salon Owners Say                                             │
│                                                                    │
│  ┌────────────────────────────────────────────────┐                │
│  │  ⭐⭐⭐⭐⭐                                    │                │
│  │  "Wapixo transformed how we run our salon.     │                │
│  │   Before, we were using registers. Now          │                │
│  │   everything is digital and fast."              │                │
│  │                                                 │                │
│  │  — Priya Sharma, Luxe Beauty Studio, Mumbai     │                │
│  └────────────────────────────────────────────────┘                │
│                                                                    │
│  [•] [•] [•]  ← dot pagination                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Auto-playing carousel (5s interval) with manual navigation
- Each testimonial card:
  - White background, large quotes icon, rounded-2xl
  - Star rating (always 5 stars, `#B85C5C` color)
  - Quote text (italic, 18px)
  - Author: name + salon name + city
  - Avatar image (circular)
- Smooth slide/fade transition
- Dot pagination indicators

**Dummy Testimonials (3-5):**
1. Priya Sharma — Luxe Beauty Studio, Mumbai
2. Rahul Verma — Gentlemen's Lounge, Delhi
3. Anita Patel — Glow Salon, Ahmedabad
4. Vikram Singh — Style Hub, Bangalore

---

### 9️⃣ FAQ SECTION (`FAQSection.jsx`)

**Goal:** Answer doubts, remove objections

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (White background)                                                │
│                                                                    │
│  Frequently Asked Questions                                        │
│                                                                    │
│  ┌──────────────────────────────────────────────┐                  │
│  │ Is it cloud based?                      [+]  │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Can I use it offline?                   [+]  │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Do you provide a mobile app?            [+]  │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Is WhatsApp integration included?       [+]  │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Is my data safe and secure?             [+]  │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Is there a free trial available?        [+]  │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Accordion style: click to expand/collapse with smooth height animation
- `[+]` rotates to `[×]` on open
- Open answer: slides down with `#E9E9E9` background
- Max-width 720px, centered
- Active question has left-border `#B85C5C`

**FAQ Content:**
1. **Is it cloud based?** — "Yes, Wapixo is 100% cloud-based. Access your salon data from anywhere — desktop, tablet, or phone."
2. **Can I use it offline?** — "Wapixo works best online, but core POS features have offline mode with auto-sync when reconnected."
3. **Do you provide a mobile app?** — "Yes! We have Android and iOS apps for salon owners and staff."
4. **Is WhatsApp integration included?** — "WhatsApp reminders and marketing campaigns are included in Pro and Enterprise plans."
5. **Is my data safe?** — "Absolutely. We use 256-bit SSL encryption, daily backups, and your data is hosted on secure cloud servers."
6. **Is there a free trial?** — "Yes! Start with a 14-day free trial. No credit card required."

---

### 🔟 FINAL CTA SECTION (`CTASection.jsx`)

**Goal:** One last push to convert the visitor

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (Black background with #B85C5C gradient accent)                   │
│                                                                    │
│  Ready to Transform                                                │
│  Your Salon Business?                                              │
│                                                                    │
│  Join 500+ salon owners who switched to Wapixo                     │
│                                                                    │
│  [Start Free Trial]     [Book a Demo]                              │
│                                                                    │
│  ✓ No credit card  ✓ 14-day trial  ✓ Cancel anytime               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Full-width banner, black bg with subtle `#B85C5C` gradient overlay
- Big white headline, centered
- Two CTA buttons (same as hero)
- Trust badges below buttons
- Subtle animated background (floating shapes or gradient pulse)

---

### 1️⃣1️⃣ FOOTER (`Footer.jsx`)

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│  (Black background, white text)                                    │
│                                                                    │
│  [Logo1 (white)]                                                   │
│  Powering Smart Businesses                                         │
│                                                                    │
│  Product       Company        Support        Legal                 │
│  ─────────     ─────────      ─────────      ─────────             │
│  Features      About Us       Help Center    Privacy Policy        │
│  Pricing       Careers        Contact Us     Terms of Service      │
│  Demo          Blog           Documentation  Refund Policy         │
│                                                                    │
│  ──────────────────────────────────────────────────                 │
│  © 2026 Wapixo. All rights reserved.                               │
│  [Twitter] [LinkedIn] [Instagram] [YouTube]                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- 4-column grid (responsive: 2×2 tablet, 1-col mobile)
- Logo on top-left with tagline
- Links in `#E9E9E9`, hover → `#B85C5C`
- Divider line before copyright
- Social icons: circular buttons, hover `#B85C5C` glow
- Smooth fade-in on scroll

---

## 🎬 Animation Strategy

| Animation                 | Where                      | Library        |
|---------------------------|----------------------------|----------------|
| Staggered fade-in-up     | Cards, features, problems  | Framer Motion  |
| Count-up numbers          | Hero stats                 | Custom hook    |
| Floating orbs             | Hero background            | CSS keyframes  |
| Scroll-triggered reveal   | All sections               | Framer Motion  |
| Carousel auto-play        | Testimonials               | Custom + CSS   |
| Accordion expand/collapse | FAQ                        | Framer Motion  |
| Navbar bg transition      | On scroll                  | CSS + JS hook  |
| Tab crossfade             | Screenshots section        | Framer Motion  |
| Parallax tilt             | Hero dashboard mockup      | CSS transforms |
| Hover micro-interactions  | Buttons, cards, links      | CSS transitions|

---

## 🛣️ Routing Plan

**Current:** `/` redirects to `/dashboard` (protected)

**Updated:**
```
/           → LandingPage (public, no auth required)
/login      → LoginPage
/register   → RegisterPage
/dashboard  → DashboardPage (protected)
```

The landing page will be the **default entry point** for unauthenticated visitors.

---

## 📦 Dependencies Needed

All dependencies are **already installed**:
- `react-router-dom` ✅
- `framer-motion` ✅
- `react-icons` ✅
- `react-hot-toast` ✅

**No new packages needed.**

---

## 🚀 Implementation Order

| Step | Task                      | Estimated Effort |
|------|---------------------------|------------------|
| 1    | Create `landing.css`      | Animations & landing-specific styles |
| 2    | Create `Navbar.jsx`       | Sticky nav with scroll effect |
| 3    | Create `HeroSection.jsx`  | Hero with animations + generated mockup |
| 4    | Create `ProblemsSection.jsx` | Pain point cards |
| 5    | Create `SolutionSection.jsx` | Product solution showcase |
| 6    | Create `FeaturesSection.jsx` | 9-feature grid |
| 7    | Create `ScreenshotsSection.jsx` | Tabbed screenshots |
| 8    | Create `PricingSection.jsx` | 3-tier pricing |
| 9    | Create `TestimonialsSection.jsx` | Review carousel |
| 10   | Create `FAQSection.jsx`   | Accordion |
| 11   | Create `CTASection.jsx`   | Final conversion banner |
| 12   | Create `Footer.jsx`       | Complete footer |
| 13   | Create `LandingPage.jsx`  | Assemble all components |
| 14   | Update `App.jsx`          | Add landing route at `/` |
| 15   | Generate mockup images    | Dashboard, POS screenshots |
| 16   | Final polish & testing    | Responsive, animations, SEO |

---

## ✅ Approval Checklist

Please confirm the following before I start implementation:

- [ ] Color palette: Black, #E9E9E9, #B85C5C, White
- [ ] Logo usage: logo1.png (white/dark bg) and logo2.png (black/light bg)
- [ ] 11 sections as outlined above
- [ ] Pricing plans: Basic (₹999), Pro (₹2,499), Enterprise (Custom)
- [ ] Route: `/` = Landing Page (public)
- [ ] Animations: Framer Motion + CSS
- [ ] Mobile-responsive design
- [ ] SEO meta tags

**Awaiting your approval to begin implementation! 🎯**
