# AIG Bot - User & Manager Guide

Welcome to the AIG Bot project! This application provides an AI-powered customer service chatbot optimized for Atome, featuring a dynamic Next.js frontend and a FastAPI backend powered by Google's Gemini models.

This guide explains how to operate the application from both a standard user's perspective and a manager's perspective.

---

## Getting Started

### Prerequisites

Make sure your backend server is running and the following environment variables are properly configured in your backend `.env` file:

- `GEMINI_API_KEY`
- `DB_CONNECTION_URL` (PostgreSQL)
- `MG_DB_URL` (MongoDB)

Make sure the frontend is running using `npm run dev` and your `NEXT_PUBLIC_BACKEND_URL` is pointing to your FastAPI backend.

### 1. Authentication

Upon opening the application (`http://localhost:3000`) or whichever port it is exposed in, you will be greeted by the Login page.

- **To test as a Normal User:** Click "Register", enter a username (e.g., `johndoe`) and a password (min. 8 characters), and register.
- **To test as a Manager:** Click "Register", and create an account with the exact username `"manager"`. The system will automatically grant this account administrative privileges.

_(Note: There is no email verification to keep your credentials safe)_

---

## User Guide (Standard Role)

As a standard user, your primary interface is the **Chat Support** screen.

### 1. Chatting with the AI

Type your queries into the message box at the bottom and press **Enter** or click the **Send** icon. The bot uses its injected Knowledge Base to answer your questions accurately.

### 2. Auto-Correction (Reporting Mistakes)

If the bot gives an inaccurate or unhelpful response:

1. Click the small **"Report Mistake"** button situated under the bot's message.
2. The AI Auditor (Meta-Agent) will analyze the conversation context of that specific reply.
3. The system will automatically generate a new rule (e.g., _"Never promise a refund without checking the transaction status"_) and inject it into the bot's core guidelines, preventing the bot from making the same mistake twice.

---

## 🛠️ Manager Guide (Admin Role)

If you logged in with the username `"manager"`, you will see a red **"Edit Bot"** button at the top of the chat interface. Clicking this opens the **Manager Dashboard**.

The Manager Dashboard provides three distinct ways to teach and configure your AI bot.

### Method 1: The Meta-Agent (AI Builder)

Instead of manually typing rules, you can converse with an AI Meta-Agent tasked with building your bot.

- **Text Prompting:** Simply type requests like, _"Make the bot more polite,"_ or _"Instruct the bot to always greet users with 'Welcome to Atome'."_ The Meta-Agent will translate your instructions into JSON config updates.
- **File Upload:** Upload a `.txt` file containing your company policies or FAQs, and the Meta-Agent will automatically parse it and update the Knowledge Base.

### Method 2: Web Scraping

You can extract knowledge directly from a Help Center or website.

1. Locate the "Import from URL" section.
2. Enter a base URL (e.g., `https://help.atome.ph/`).
3. Click **Scrape**.
4. The backend will crawl the main page and automatically fetch content from up to 10 sub-articles, injecting it straight into the Knowledge Base.

### Method 3: Manual Configuration

For fine-grained control, you can view and edit the raw text that dictates the bot's behavior.

- **Knowledge Base:** Paste reference material, FAQs, or raw data you want the bot to have access to.
- **Additional Guidelines:** Paste strict behavioral rules (e.g., _"Do not speak in markdown,"_ _"Always respond in Spanish"_).
- Click **Save Manual Edits** when you are done to push the new rules live.

---

## Assumptions & Limitations

To ensure the scope of the project remains focused, the following design and technical assumptions are actively applied to this application:

1. **Web Scraping Link Structure:** The web scraper assumes it is hitting a structured help center. It actively searches for and crawls `href` links containing the keywords `'/articles/'` or `'/sections/'`. If the target website uses a different URL structure, linked sub-pages will be ignored.
2. **Basic Authentication:** Authentication assumes basic username/password structures. There are no provisions for email addresses, meaning email verification and "Forgot Password" functionality do not exist.
3. **Manager Role Identification:** The system assumes there is only one central manager. The "manager" role is hardcoded and granted specifically to the user whose username is exactly `"manager"`.
4. **Shared Bot Configuration:** The application assumes a single, global bot configuration. All edits made in the Manager Dashboard update one shared MongoDB document (`collection.find_one({})`), meaning updates take effect globally for all users concurrently.
5. **Domain Constraint:** The Meta-Agent is instructed to act as an "AI Builder for Atome". It assumes and enforces that Knowledge Base updates and chat guidelines must be broadly related to Atome or customer service topics; it is instructed to reject completely unrelated domain topics.
