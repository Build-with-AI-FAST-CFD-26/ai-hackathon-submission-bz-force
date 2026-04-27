<div align="center">

<img src="https://img.shields.io/badge/Built%20at-Build%20with%20AI%20Hackathon%202026-00E5FF?style=for-the-badge&logo=anthropic&logoColor=white" />
<img src="https://img.shields.io/badge/GDG%20on%20Campus-FAST%20NUCES%20CFD-EF9F27?style=for-the-badge&logo=google&logoColor=white" />

<br/><br/>

# ⚡ StackSense

### AI Intelligence Layer for Technical Founders

**The AI analyst that reads every changelog, pricing page, and deprecation notice — so you don't have to.**

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Click%20Here-00E5FF?style=for-the-badge)](https://your-live-url-here.com)
[![Video Demo](https://img.shields.io/badge/🎥%20Video%20Demo-Watch%20Now-EF9F27?style=for-the-badge)](https://your-video-url-here.com)
[![Devpost](https://img.shields.io/badge/🏆%20Devpost-Submission-E24B4A?style=for-the-badge)](https://devpost.com/your-submission-link)

<br/>

![StackSense Banner](https://placehold.co/1200x475/050E1A/00E5FF?text=StackSense+—+AI+Intelligence+Layer&font=monospace)

<!-- 💡 Replace the image above with your actual screenshot or banner -->

</div>

---

## 🎯 The Problem

Technical co-founders like **Sam** face this every week:

| What Happened | What Sam Lost |
|---|---|
| Gemini Flash pricing dropped 40% | He didn't know for **3 weeks** |
| New OSS agent framework released | Could replace a **$400/month** SaaS — no time to evaluate |
| Deprecation notice buried in changelog | Will **break his embeddings** in 2 weeks |
| Competitors already switched | He didn't. |

> *"Technical founders spend hours every week trying to keep up with a tooling landscape that reshuffles itself faster than they can ship."*

**StackSense fixes this.** It is the AI that reads everything so Sam doesn't have to.

---

## ✨ Features

### 🧩 1. Conversational Stack Onboarding
Enter your stack in plain English. Claude parses it into beautiful interactive tech cards — tools, vendors, cost profile, architecture type — in seconds.

### ⚡ 2. Live Scan Engine *(the WOW moment)*
Hit **Scan Now**. Watch a real-time terminal feed as Claude searches the web across every tool in your stack:
```
🔍 Scanning Vertex AI pricing page...
🔍 Reading Cohere changelog...
⚡ Detected: Gemini 2.5 Flash pricing update...
✅ Scan complete — 2 items need your attention
```
Powered by **Claude's streaming API + web search** — every result is live, not cached.

### 📊 3. Impact-Ranked Intelligence Dashboard
Each finding surfaces as a card with:
- 🔴🟡🟢 Impact level (Critical / Watch / FYI)
- 💰 Dollar impact estimate (`"Save ~$340/month"`)
- ⚡ Specific action recommendation
- 📅 Detection date + source link

### 💬 4. "Ask Claude" Inline Chat *(the killer feature)*
Every alert card has an expandable Claude chat — pre-loaded with your stack context and the specific finding. Ask `"How hard is it to migrate?"` and get expert advice tuned to *your* architecture.

### 📈 5. Runway Impact Meter
A live gauge showing current monthly spend, potential savings detected this week, and projected 6-month runway impact — updates dynamically as new alerts come in.

### 🏥 6. Stack Health Score
Claude scores your stack 0–100 across cost efficiency, deprecation risk, vendor lock-in, and competitive modernity — shown as an animated radial gauge with per-category drilldown.

### 📧 7. Weekly Digest Email Preview
Auto-generates a beautiful HTML email digest with a Claude-written subject line (e.g. *"2 things that could save your startup $340 this week"*). Exportable and ready to copy.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS v4, CSS Animations |
| **AI Engine** | Claude API (`claude-sonnet-4-20250514`), Web Search Tool, Streaming |
| **Typography** | JetBrains Mono · Space Grotesk |
| **Deployment** | Google Cloud Run |
| **State / Auth** | Firebase |
| **Build Tooling** | Vite 6, TypeScript 5.8 |

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
# → Open .env.local and add your ANTHROPIC_API_KEY

# Start the development server
npm run dev
```

The app will be running at **`http://localhost:3000`**

### Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here
```

---

## 📁 Project Structure

```
stacksense/
├── src/
│   ├── App.tsx              # Main application & all UI components
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles & design tokens
├── public/
├── index.html
├── vite.config.ts           # Vite + Tailwind config
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🎬 Demo

> **[▶ Watch the full demo →](https://your-video-url-here.com)**

**What the judges see in 2 minutes:**
1. App opens — stack is pre-filled for speed
2. **Scan Now** is hit — Claude scans the web live in the terminal
3. Two alert cards appear: a pricing drop + an upcoming deprecation
4. **Ask Claude** is clicked → *"How hard is it to switch?"*
5. Claude responds with migration steps tailored to the founder's exact stack

---

## 👥 Team

| Name | Role | GitHub | LinkedIn |
|---|---|---|---|
| **Zoha Ashraf** | Co-founder · Frontend & AI Integration | [github.com/zoha-ashraf](https://github.com/zoha-ashraf) | [linkedin.com/in/zoha-ashraf](https://linkedin.com/in/zoha-ashraf) |
| **Bilal Rauf** | Co-founder · Backend & Deployment | [github.com/bilal-rauf](https://github.com/bilal-rauf) | [linkedin.com/in/bilal-rauf](https://linkedin.com/in/bilal-rauf) |

> 💡 *Update the profile links above with your actual GitHub and LinkedIn URLs.*

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

</div>
