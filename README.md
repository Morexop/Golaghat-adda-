# Asoni Palu Ne? 😂 | Golaghat Comedy & Public Adda

An unofficial, mobile-first Assamese comedy and community website inspired by Moina Asoni and Babu Asoni in Golaghat, Assam.

---

## 🚀 Features Built & Working

1. **Assamese Comedy Generator**:
   - 21 original Moina Asoni jokes (Female 👧, Pink theme).
   - 21 original Babu Asoni jokes (Male 👦, Blue theme).
   - Non-consecutive randomization (prevents back-to-back duplicate jokes).
   - Web Share API integration with automatic copy-to-clipboard fallback.

2. **Golaghat Public Adda**:
   - Anonymous nickname participation (no real name, phone number, or password required).
   - Real-time comment feed backed by Cloud Firestore.
   - Pinned announcement post highlighted at the top.
   - 2-level nested replies with author context.
   - 1-click likes toggle per user UID.
   - 20-second anti-spam cooldown and duplicate submission prevention.

3. **Safety, Privacy & Moderation**:
   - Community suggestion for pinned messages (`/pinSuggestions`).
   - Confidential abuse reporting (`/reports`).
   - Content filtering for phone numbers, bank/OTP keywords, and abusive language.
   - Protected Moderator Console (`AdminDashboard.tsx`) with access key authentication.
   - Unofficial Entertainment Disclaimer prominently featured.

4. **PWA Ready**:
   - `manifest.json` configured for standalone mobile installation.

---

## 🛠️ Windows & VS Code Local Development Commands

### 1. Install Dependencies
In the VS Code terminal (PowerShell or Command Prompt):
```powershell
npm install
```

### 2. Run Locally
```powershell
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Run Automated Unit Tests
```powershell
npx tsx --test src/tests/*.test.ts
```

### 4. Build for Production
```powershell
npm run build
```

---

## 🛡️ Moderator Console Access

- Click **“🛡️ Moderator Console”** in the footer under *Community & Safety*.
- Passkey: `golaghat_mod_2026` (or automatically unlocked when signed in with administrator email `morexop18@gmail.com`).
- Review reported items, dismiss reports, hide content, or approve community pin suggestions.

---

## 📜 Disclaimer
This website is an independent comedy entertainment project for Golaghat, Assam. It is not affiliated with any government department, bank, or official welfare scheme.
