# Qissa 🍵
### *Someone is finally listening.*

---

## Table of Contents
- [The Problem](#the-problem)
- [The Idea](#the-idea)
- [Live App](#live-app)
- [Features](#features)
- [The AI Feature — How Qissa Actually Listens](#the-ai-feature--how-qissa-actually-listens)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [How to Run Locally](#how-to-run-locally)
- [Future Roadmap](#future-roadmap)
- [Author](#author)

---

## The Problem

Around us, elderly people are growing quietly lonelier. Their children and grandchildren are busy — with work, with studies, with their own lives — and conversations that used to stretch over hours of chai now happen in rushed five-minute check-ins, if at all.

What gets lost in that rush isn't just company. It's **knowledge**. A proverb passed down through generations. A hard-earned life lesson. A memory of how things used to be. Elders carry decades of lived experience that no one has the patience — or the time — to sit and actually hear anymore. Once that generation is gone, so is everything they never got to say.

**Qissa** (قصہ — Urdu/Arabic for "story" or "tale") was built to solve one small piece of this: give elderly people a space where they are genuinely, patiently listened to — and make sure what they share doesn't just disappear.

**Who this is for:** elderly people in Pakistan (and anywhere Urdu, Roman Urdu, or English is spoken) who want to talk to someone patient and unhurried — and their families and communities, who gain a growing, anonymous archive of real wisdom that would otherwise never have been written down.

---

## The Idea

Qissa isn't a survey, a form, or a data-collection tool disguised as a chatbot. It's built around one core belief: **an elder should never feel like they're being processed.**

So the app works in two invisible layers:

1. **While they're talking** — an AI companion listens, asks gentle questions, and never rushes them. The elder just experiences a warm conversation, nothing more.
2. **After they're done** — a second, completely separate AI process quietly reviews the conversation, strips out anything that could identify the person, and — only if there's genuine wisdom worth keeping — adds it to a public **Wisdom Wall** anyone can read.

The elder never sees this second step happen. They just talked to someone who listened. What's left behind is a small, anonymous piece of their story.

---

## Live App

🔗 **https://qissa-whispers-cloud.lovable.app**

Open it, start a conversation in English, Urdu, or Roman Urdu, end it, then check the Wisdom Wall to see what gets preserved.

---

## Features

| Feature | What it does |
|---|---|
| 🗣️ **AI Companion Chat** | A warm, patient AI listens and responds in whichever language the person types in |
| 🌐 **Automatic language handling** | Detects and replies naturally in English, Urdu (script), or Roman Urdu — no manual language switch needed |
| 📜 **Wisdom Wall** | A public, anonymized feed of reflections and life lessons shared through conversations |
| 🔒 **Automatic anonymization** | Names, places, and identifying details are stripped before anything is saved |
| 🧠 **Two-stage AI design** | One AI listens in real time; a separate AI decides afterward what (if anything) is worth preserving |
| 🔑 **Authentication (Email + Google)** | Lets users return to their own conversation history securely |
| 📱 **Mobile-friendly interface** | Designed to be usable on a phone, since that's how most elderly users will access it |


---

## The AI Feature — How Qissa Actually Listens

This is the heart of the project: **two separate AI calls, each with a narrow, deliberate job**, rather than one AI trying to do everything at once.

### 1️⃣ The Companion — the AI the elder actually talks to

Its only job is to listen well. It doesn't collect data, doesn't give advice, and doesn't rush toward an ending.

```
You are Qissa, a warm and patient listening companion for elderly people in Pakistan. 

LANGUAGE: Reply in whichever language and script the person uses — English, Urdu script, 
or Roman Urdu (Urdu written in English letters). Match their language naturally; don't 
switch unless they do.

TONE: Always speak with the respect due to an elder. Use "aap," never "tum." Be genuinely 
curious, never clinical or rushed. You are not a survey and not a therapist — you are like 
a grandchild who finally has time to sit and listen.

BEHAVIOR:
- Ask one gentle, open question at a time. Never stack multiple questions in one message.
- Follow what they bring up rather than steering them back to a script.
- If they share a memory, a piece of advice, a proverb, or a skill, acknowledge it warmly 
  before inviting more ("Yeh baat bohat pyari hai... aap ko yeh kaisay pata chala?").
- Give them room for silence or short answers — don't fill every gap with a new question.
- Never rush toward "wrapping up." Let the conversation breathe.
- Occasionally reflect back what they said, so they feel heard, not processed.
- Do not give advice, medical opinions, or correct them. You are here to listen, not instruct.
- If a topic seems painful (loss, illness, loneliness), slow down and stay with warmth, 
  not with fixing.

You are not collecting data. You are keeping someone company.
```

### 2️⃣ The Wisdom Extractor — runs quietly after the conversation ends

Once a chat ends, this second AI reviews the whole exchange on its own, decides if there's something genuinely worth keeping, removes anything identifying, and either saves it or lets it go.

```
You will be given a conversation between an elderly person and a listening companion. 
Your job is to extract ONE piece of wisdom, memory, proverb, or life lesson worth 
preserving anonymously for others to read.

RULES:
- Remove ALL identifying details: names, specific places, family members' names, 
  exact ages, dates, addresses.
- Write it as a short, respectful passage (2-4 sentences) in the same language/script 
  the wisdom was originally shared in.
- Preserve the person's actual words and phrasing where possible — don't sanitize the 
  voice into generic language.
- Only extract if there is genuine, shareable wisdom in the conversation. If there isn't 
  yet, return exactly: NONE

Output format (JSON only, no other text):
{"has_wisdom": true/false, "text": "...", "language": "english/urdu/roman_urdu"}
```

**Why two AI calls instead of one?** Combining "listen warmly" and "extract and judge what's worth saving" into a single prompt creates a conflict of interest — an AI trying to do both at once tends to steer the conversation toward "useful" answers instead of just listening. Splitting the two jobs means the elder gets an AI that's purely present with them, while the archiving happens as a clean, separate judgment call afterward.

---

## Tech Stack

- **[Lovable](https://lovable.dev)** — no-code builder used to design and build the app end-to-end
- **React + Vite** — frontend framework
- **Lovable Cloud** (built on Supabase) — database, authentication, and storage
- **Lovable AI Gateway** — routes AI requests server-side so no API key is ever exposed in the frontend
- **Google Gemini** — the underlying AI model powering both the companion chat and the wisdom extraction
- **shadcn/ui** — UI component library
- **Bun** — package manager/runtime (npm also works, see below)

---

## Screenshots

1. **Landing page** — first impression, explains what Qissa is
  <img width="1920" height="1080" alt="Screenshot (10)" src="https://github.com/user-attachments/assets/28ea95d4-bdd4-4b90-9432-5c3b04345da8" />
  
3. **Chat in action** — a real conversation showing the companion's tone and language handling
   <img width="1920" height="1080" alt="Screenshot (11)" src="https://github.com/user-attachments/assets/8b5d28ac-5ed8-4430-b57e-5bd042fe6f07" />

5. **Wisdom Wall** — anonymized entries visible to any visitor
   <img width="1920" height="1080" alt="Screenshot (13)" src="https://github.com/user-attachments/assets/85390867-f575-42c0-8da4-b9bfcd4a3ff7" />

---

## How to Run Locally

This project is built and hosted entirely through Lovable, so the easiest way to 
use it is simply through the live URL above — no setup needed.

If someone wants to run the source code on their own computer, they can:

1. Clone the repository:
   `git clone https://github.com/tehreemsikander512-pixel/qissa-whispers-wisdom.git`
2. Open the folder and install dependencies:
   `npm install`
3. Start the app:
   `npm run dev`
4. Open the local link shown in the terminal.

No API keys need to be set up manually — the app's backend (database and AI) is 
managed automatically through Lovable Cloud.
---

## Future Roadmap

This version of Qissa is intentionally scoped small and solid rather than wide and shaky. Planned next steps:

- 🎙️ **Voice messages** — letting elders speak instead of type, since typing is a real barrier for many older users
- 🗣️ **More languages, starting with Punjabi** — followed by other regional languages, so Qissa can genuinely reach "elders in their own language," as originally envisioned
- 🔓 **Reduced friction at entry** — revisiting whether login should be required at all, given how much of an obstacle account creation can be for first-time elderly users

---

## Author

**Tehreem Fatima**
GitHub: [@tehreemsikander512-pixel](https://github.com/tehreemsikander512-pixel)

---

*Built as a final project — an original idea aimed at giving elderly people a space to be heard, and preserving what they know before it's lost.*
