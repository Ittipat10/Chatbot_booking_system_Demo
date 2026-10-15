# 🌸 Chatbot Booking System - Siam Lotus Wellness (Demo)

A luxury Thai Wellness & Massage appointment booking web application featuring a trilingual AI Concierge ("Jasmin 🌸"), a 5-step interactive online booking modal, and a salon owner management dashboard.

Built with an authentic **Royal Thai Silk & Champagne Gold** aesthetic (`#1A0326` & `#D4AF37`), designed for high-end spa sanctuaries.

---

## ✨ Key Features

1. **Haute Thai Silk Luxury Web Experience:**
   - Editorial typography using *Cinzel*, *Cormorant Garamond*, and *Plus Jakarta Sans*.
   - Realistic Thai Silk woven textures, dual-tone silk sheen highlights, and gold hairline dividers.
   - Comprehensive treatment catalog in EUR (€) with Wat Pho temple heritage lineage.

2. **Trilingual Personal Spa Concierge ("Jasmin 🌸"):**
   - Natural, compassionate AI conversation in **German (Deutsch)**, **English**, and **Thai (ภาษาไทย)**.
   - Powered by **Cloudflare Workers AI** (`@cf/meta/llama-3.1-8b-instruct-fast`) on serverless edge.
   - Answers inquiries on treatments (Nuad Thai, Aroma Oil, Office Syndrome, Herbal Compress, Foot Reflexology, Royal Siam Silk Ritual).

3. **5-Step Interactive Booking System:**
   - **Step 1:** Select Treatment Ceremony.
   - **Step 2:** Select Duration (30, 60, 90, 120 mins) with dynamic real-time pricing.
   - **Step 3:** Interactive Calendar (14-day rolling availability) & Opening Hour Time Slots (10:00 - 19:00).
   - **Step 4:** Guest Details & Pressure Preferences.
   - **Step 5:** Instant Confirmation Voucher with Unique Booking Reference ID (`SL-XXXXXX`) and print receipt option.

4. **Salon Management Dashboard (`admin.html`):**
   - Real-time appointment feed for salon managers.
   - Live metrics: Total Bookings, Active Appointments, and Estimated Revenue.
   - Direct call customer link (`tel:`), appointment cancellation, and CSV spreadsheet export.

5. **Multi-Platform Deployment:**
   - **Localhost Development:** Self-contained Python server (`server.py`) with JSON/CSV persistence.
   - **Cloudflare Pages / Workers AI:** Production-ready edge deployment (`_worker.js` & `functions/api/chat.js`).

---

## 📁 Project Structure

```text
├── index.html              # Main luxury landing page & booking modal
├── styles.css              # Custom Thai silk weave & gold styling
├── booking.js              # 5-step interactive booking engine
├── services.js             # Treatments catalog, durations, and pricing
├── chatbot.js              # Trilingual AI concierge client interface
├── admin.html              # Salon owner management dashboard
├── server.py               # Localhost Python server & booking API
├── _worker.js              # Cloudflare Pages Advanced Worker
├── functions/api/chat.js   # Cloudflare Pages function endpoint
├── wrangler.toml           # Cloudflare Wrangler configuration
├── bookings.example.json   # Template for local bookings database
└── .env.example            # Environment variables example
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.8+ (No external pip dependencies required for basic server)

### 1. Run Local Server
```bash
python3 server.py
```

### 2. Access Web Applications
- **Guest Website & Booking:** [http://localhost:8088](http://localhost:8088)
- **Salon Owner Dashboard:** [http://localhost:8088/admin.html](http://localhost:8088/admin.html)

---

## ☁️ Cloudflare Pages Deployment

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 2. Deploy via Wrangler or Script
```bash
export CF_ACCOUNT_ID="your_account_id"
export CF_API_TOKEN="your_api_token"
python3 deploy_cf_v2.py
```

Or deploy via Wrangler:
```bash
npx wrangler pages deploy .
```

---

## 🔒 Security & Privacy

- All sensitive tokens and credentials are kept out of version control via `.gitignore`.
- By default, client chat sessions remain stateless and privacy-compliant (GDPR compliant).

---

## 📄 License
MIT License. Created for demonstration and prototype purposes.
