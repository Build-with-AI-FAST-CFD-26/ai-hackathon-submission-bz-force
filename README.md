<div align="center">

<img src="https://img.shields.io/badge/Built%20at-Build%20with%20AI%20Hackathon%202026-00E5FF?style=for-the-badge&logo=anthropic&logoColor=white" />
<img src="https://img.shields.io/badge/GDG%20on%20Campus-FAST%20NUCES%20CFD-EF9F27?style=for-the-badge&logo=google&logoColor=white" />

<br/><br/>

# ⚡ StackSense

### AI Intelligence Layer for Technical Founders

**The AI analyst that reads every changelog, pricing page, and deprecation notice — so you don't have to.**

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-stack--sense.web.app-00E5FF?style=for-the-badge)](https://stack-sense.web.app/)
[![Video Demo](https://img.shields.io/badge/🎥%20Video%20Demo-Watch%20Now-EF9F27?style=for-the-badge)](https://your-video-url-here.com)
[![Devpost](https://img.shields.io/badge/🏆%20Devpost-Submission-E24B4A?style=for-the-badge)](https://devpost.com/your-submission-link)

<br/>

![StackSense Banner](https://placehold.co/1200x475/050E1A/00E5FF?text=StackSense+—+AI+Intelligence+Layer+for+Technical+Founders&font=monospace)

<!-- 💡 Replace the banner above with an actual screenshot of your live app -->

</div>

---

## 🎯 The Problem

Technical co-founders like **Sam** face this every single week:

| What Happened | What Sam Lost |
|---|---|
| Gemini Flash pricing dropped 40% | He didn't know for **3 weeks** — overpaid $240 |
| New open-source agent framework released | Could replace a **$400/month** SaaS — no time to evaluate |
| Deprecation notice buried in a changelog | Will **break his embeddings integration** in 2 weeks |
| His competitors already switched | He didn't. |

> *"Technical founders spend hours every week trying to keep up with a tooling landscape that reshuffles itself faster than they can ship. Pricing changes, deprecation notices, framework releases — all buried in changelogs nobody has time to read."*

**StackSense fixes this.** It is the AI that reads everything so Sam doesn't have to.

---

## ✨ Features

### 🧩 Conversational Stack Onboarding
Enter your stack in plain English — no forms, no dropdowns. Gemini parses it in real time into beautiful interactive tech cards, each showing tool name, category, and estimated monthly cost share. A typewriter placeholder cycles through real founder archetypes to get you started instantly.

### ⚡ Live Scan Engine *(the WOW moment)*
Hit **Scan Now**. Watch a real-time terminal feed as Gemini searches the live web across every tool in your stack — pricing pages, changelogs, release notes, all of it:

```
[14:22:01] 🔍 Scanning Vertex AI pricing page...
[14:22:03] 🔍 Reading Cohere v2 changelog...
[14:22:06] ⚡ Detected: Gemini 2.5 Flash pricing update — -40% on input tokens
[14:22:09] ⚠️  Cohere v2 embeddings endpoint deprecating in 18 days
[14:22:11] ✅ Scan complete — 2 items need your attention
```

Powered by **Gemini's streaming API + live web search** — every result is fetched fresh, not cached. A 5-bar CSS waveform equalizer pulses while Gemini works. Critical findings trigger a red border flash on the terminal.

### 📊 Impact-Ranked Intelligence Dashboard
Each finding surfaces as a cinematic card entering with a 3D perspective animation:
- 🔴🟡🟢 **Impact level** — Critical / Watch / FYI
- 💰 **Dollar impact** — animated counter ticking up to the exact figure (`Save ~$340/month`)
- ⚡ **Action recommendation** — specific, not vague
- 📅 **Detected date + source link**
- ⏰ **Urgency chip** — "Act within 18 days" when time-sensitive

### 🪟 Floating Detail Windows
Click **Expand Details** on any alert — a draggable floating panel appears with the full dollar math breakdown (current spend → new spend → monthly saving → annual saving), a migration checklist with functional checkboxes, and the full source link. Stack multiple windows open at once and drag them anywhere.

### 💬 "Ask Gemini" Inline Chat *(the killer feature)*
Every alert card has an expandable Gemini chat, pre-loaded with your full stack context and the specific finding. Ask `"How hard is it to migrate?"` or `"Will this break our current setup?"` — Gemini responds with expert migration guidance tuned to *your exact architecture*, streamed in real time.

### 🤝 Founder Sync (Paul <> Sam)
Bridge the business and technical sides with the new Founder Sync flow. Load a mock "business state" for Paul (leads, deadlines, tasks, promises) and run the sync to cross-reference those items with Sam's technical alerts. The app returns two outputs: a prioritized list of action items for Paul and amber-styled alignment warnings that call out promise-vs-delivery conflicts (e.g., promised Vector Search vs. Pinecone migration). This makes the product useful for both the CEO and the engineer during pitches and due-diligence.

### 🛡 Offline Failsafe & Robust Streaming
All Gemini-backed endpoints include resilient offline fallbacks that preserve the same data contract as the live responses. For the inline chat (`/api/ask`), the backend uses strict SSE headers and streams mock chunks in the exact SSE format when Gemini is unavailable, so the UI continues to operate during live demos without an API key.

### ⌨️ Command Palette (Cmd+K)
Press **Cmd+K** from anywhere in the app to open a floating command palette. Ask anything in natural language: *"What's my most urgent action?"*, *"Calculate total potential savings"*, *"What changed in my AI tools this week?"* — Gemini answers with full context of your stack and current alerts.

### 🔍 Stack Inspector Pill
A persistent floating pill in the bottom-right shows live health status for every tool in your stack with color-coded dots (green / amber / red). Click any tool to open its floating detail window. Always one click away, never in your way.

### 📈 Runway Impact Meter
A live SVG arc gauge with a slot-machine digit counter showing your current monthly tooling spend, savings detected this session, and projected annual runway impact. Updates dynamically as new alerts arrive — watching the number climb as Gemini finds savings is genuinely satisfying.

### 🏥 Stack Health Score
Gemini scores your stack 0–100 across four axes:
- **Cost Efficiency** — are you overpaying for what you're using?
- **Deprecation Risk** — how close are you to a breaking change?
- **Vendor Lock-in** — how tied are you to proprietary platforms?
- **Competitive Modernity** — are you running what the best teams run?

Displayed as an animated radial gauge with sequential arc drawing on load. Scores update after every scan.

### 📧 Weekly Digest Email Preview
Generates a ready-to-send HTML email digest — Gemini writes the subject line (*"2 things that could save your startup $340 this week"*), body bullets, and call to action. Preview it in-app and copy the HTML directly.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, CSS Animations (no UI framework) |
| **AI Engine** | Gemini API `gemini-2.5-flash` |
| **AI Features** | Streaming API, Web Search Tool, Multi-turn Chat |
| **Typography** | JetBrains Mono · Space Grotesk (Google Fonts) |
| **Deployment** | Firebase Hosting |
| **Build Tooling** | Vite |
| **Canvas** | HTML5 Canvas (particle network background) |

### 🛠️ Disclosed Tech Stack & Google Services Used

**Development & Scaffolding:**
* **Antigravity / Project IDX:** Used for initial project start and environment scaffolding with Gemini assistance (later transitioned to VS Code for local load management).
* **Google AI Studio:** Used extensively for prompt engineering, architecture planning, and generating the core React frontend codebase.

**Infrastructure & Hosting:**
* **Google Firebase Hosting:** Production deployment, routing, and hosting for the React (Vite) frontend.
* **Google Cloud Run:** Serverless, containerized deployment for the Node/Express.js backend proxy.

**AI & Machine Learning (The Core Engine):**
* **Gemini Models (Google Developer API):** Served as the core intelligence layer for the application.
	* *Gemini Flash:* Used for rapid parsing of the tech stack, generating Mermaid.js architecture diagrams, and running the "Founder Sync" conflict detection.
	* *Gemini Pro:* Used for complex reasoning, including drafting the YC Due Diligence reports and streaming live infrastructure migration code via Server-Sent Events (SSE). 

**Design & UI:**
* **Google Design / Material Design:** Used for UI/UX design inspiration and structural principles.

### Why Gemini is essential
Remove Gemini and the product is nothing. Gemini performs live web searches across unstructured changelog text, filters findings by relevance to a specific founder's stack, estimates dollar impact from pricing page data, and provides contextual migration advice — none of which is possible with a rule-based system or a simple feed aggregator. The streaming API makes the live terminal experience real, not simulated.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stacksense.git
cd stacksense

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# → Add your ANTHROPIC_API_KEY to .env.local

# Start the development server
npm run dev
```

App runs at **`http://localhost:5173`**

### Environment Variables

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

---

## 📁 Project Structure

```
stacksense/
├── src/
│   ├── App.jsx                  # Root — screen routing & global state
│   ├── components/
│   │   ├── BootScreen.jsx       # Cinematic intro (SVG car + code trail)
│   │   ├── OnboardingScreen.jsx # Stack input with typewriter placeholders
│   │   ├── TechCardGrid.jsx     # Parsed tool cards with spring animation
│   │   ├── ParticleCanvas.jsx   # Full-page interactive particle network
│   │   ├── Navbar.jsx           # ECG heartbeat + live clock + Scan Now
│   │   ├── ScanTerminal.jsx     # Live streaming terminal with waveform EQ
│   │   ├── AlertCard.jsx        # 3D entrance cards with dollar counter
│   │   ├── FloatingWindow.jsx   # Draggable detail panels
│   │   ├── InlineChat.jsx       # Per-alert Gemini chat with streaming
│   │   ├── CommandPalette.jsx   # Cmd+K AI search overlay
│   │   ├── StackInspector.jsx   # Bottom-right floating tool health pill
│   │   ├── RunwayGauge.jsx      # SVG arc gauge with slot-machine counter
│   │   ├── HealthScore.jsx      # Radial score gauge (4 categories)
│   │   └── WeeklyDigest.jsx     # Gemini-generated email digest preview
│   ├── hooks/
│   │   └── useScan.js           # Core scan engine (streaming + web search)
│   └── index.css                # Design tokens + global styles
├── public/
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## 🎬 Demo

> **[▶ Watch the full 2-minute demo →](https://your-video-url-here.com)**

**What happens in the demo:**
1. Cinematic boot screen plays — SVG car + code trail
2. Onboarding — typewriter placeholder shows, stack is entered in natural language
3. Tech cards spring into view — each tool parsed and categorized
4. **Scan Now** is hit — Gemini searches the live web, terminal fills in real time
5. Two alert cards slam in: a pricing drop and an upcoming deprecation, both with dollar figures
6. **Expand Details** opens a draggable floating window with the full cost breakdown
7. **Ask Gemini** is clicked on the pricing alert → *"How hard is it to migrate?"*
8. Gemini streams a migration plan specific to the founder's exact stack
9. **Cmd+K** palette opens → *"What's my most urgent action?"* → instant answer
10. Health score and runway gauge animate into view

---

## 👥 Team

| Name | Role | GitHub | LinkedIn |
|---|---|---|---|
| **Zoha Ashraf** | Co-founder · Frontend & AI Integration | [github.com/zoha-ashraf](https://github.com/zoha-ashraf) | [linkedin.com/in/zoha-ashraf](https://linkedin.com/in/zoha-ashraf) |
| **Bilal Rauf** | Co-founder · Backend & Deployment | [github.com/bilal-rauf](https://github.com/bilal-rauf) | [linkedin.com/in/bilal-rauf](https://linkedin.com/in/bilal-rauf) |

---

## 🏆 Hackathon

Built at **Build with AI Hackathon 2026**
Organized by **GDG on Campus, FAST NUCES CFD**

[![Hackathon](https://img.shields.io/badge/Event-Build%20with%20AI%202026-00E5FF?style=flat-square)](https://your-hackathon-event-link.com)
[![Devpost](https://img.shields.io/badge/Submission-Devpost-003E54?style=flat-square&logo=devpost)](https://devpost.com/your-submission-link)

---

## 📄 License

MIT © 2026 Zoha Ashraf & Bilal Rauf

---

<div align="center">

*If StackSense would've saved Sam $340/month — give it a ⭐*

**[stack-sense.web.app](https://stack-sense.web.app/) · Built with Gemini · GDG on Campus FAST NUCES CFD**

</div>
