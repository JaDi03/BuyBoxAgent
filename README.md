# 🛒 BuyBoxAgent - Competitive Intelligence E-Commerce AI

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bright Data](https://img.shields.io/badge/Bright_Data-Scraping_Browser-blue?style=for-the-badge)](https://brightdata.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-black?style=for-the-badge&logo=vercel)](https://sdk.vercel.ai/)
[![Gemini 2.5 Pro](https://img.shields.io/badge/AI-Gemini_2.5_Pro-purple?style=for-the-badge)](https://deepmind.google/technologies/gemini/)

*A real-time Multi-Agent Competitive Intelligence Orchestrator built for the **Bright Data Hackathon**.*

</div>

---

## 📖 Overview

**BuyBoxAgent** is an advanced, autonomous competitive intelligence platform for e-commerce sellers (specifically tailored for Mercado Libre Mexico). It helps merchants analyze their competition and reclaim the **Buy Box** by orchestrating a sequential multi-agent pipeline backed by real-time web scraping.

By integrating with **Bright Data's Scraping Browser**, the application bypasses strict bot-detection mechanisms (including Cloudflare Turnstile, CAPTCHAs, and WebGL canvas fingerprinting) to scrape rich competitor listings. It then evaluates these listings against the seller's specific store profile to deliver ruthless, highly actionable competitive attack plans.

---

## 🧠 Multi-Agent Pipeline Architecture

The system utilizes two specialized agents to maximize reasoning capabilities while optimizing response latency:

1. **ScraperAgent (Agent 1 - `Gemini 2.5 Flash`)**: Optimized for high-speed tool calling. It receives the user request alongside the seller's profile, calculates a search price window of $\pm30\%$ to filter out irrelevant products (like cheap accessories or unmatched item tiers), and executes the web scraping tool (`mercadoLibreTool`).
2. **StrategyAgent (Agent 2 - `Gemini 2.5 Pro`)**: A high-reasoning cognitive analyst. It processes the raw JSON competitor dataset under strict anti-hallucination guardrails, flags and filters out the user's own store from the listings, and drafts a comprehensive competitive strategy report divided into actionable phases (Price Adjustments, Logistical Overhauls, Ad Campaigns).

### 🔄 System Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Seller as Seller (User)
    participant UI as Next.js Frontend (Chat & Profile)
    participant A1 as ScraperAgent (Agent 1 - Gemini 2.5 Flash)
    participant Tool as mercadoLibreTool (Puppeteer)
    participant BD as Bright Data Scraping Browser
    participant ML as Mercado Libre Mexico
    participant A2 as StrategyAgent (Agent 2 - Gemini 2.5 Pro)

    Seller->>UI: Configure Profile + Start Analysis
    UI->>A1: Send Query + Profile Context (POST /api/chat)
    Note over A1: Calculates target price range (±30%)<br/>Decides to run tool call
    A1->>Tool: Call mercadoLibreTool(query, minPrice, maxPrice)
    activate Tool
    Tool->>BD: Open WebSocket proxy connection
    activate BD
    Note over BD: Solves CAPTCHAs / Cloudflare<br/>Mocks WebGL canvas fingerprints
    BD->>ML: Navigate to Mercado Libre Mexico & extract items (.ui-search-layout__item)
    ML-->>BD: Return fully rendered HTML
    BD-->>Tool: Return structured listings (JSON)
    deactivate BD
    Tool-->>A1: Return extracted competitor details (JSON)
    deactivate Tool
    A1-->>UI: Stream: "Extraction complete. Passing data..."
    Note over UI: Renders competitor cards<br/>and logs live terminal sessions
    UI->>A2: Send Chat History + Profile + JSON Data (POST /api/strategy)
    Note over A2: Gemini 2.5 Pro analyzes pricing,<br/>reviews, shipping speeds, and MSI
    A2-->>UI: Stream: Strategic Attack Report (Clean Markdown)
    UI-->>Seller: Displays finalized Report
```

---

## 🏗️ System Structure

The following diagram illustrates the relationship between the client-side components and the serverless APIs:

```mermaid
graph TD
    %% Styling %%
    classDef client fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#fff
    classDef agent fill:#8B5CF6,stroke:#6D28D9,stroke-width:2px,color:#fff
    classDef scraper fill:#06B6D4,stroke:#0891B2,stroke-width:2px,color:#fff
    classDef target fill:#EF4444,stroke:#B91C1C,stroke-width:2px,color:#fff

    User(("Seller (User)")):::client -->|Define Profile & Query| UI["Next.js Frontend<br/>(Chat & Seller Profile)"]:::client
    UI -->|1. Request Scraping| ChatAPI["/api/chat Route<br/>(ScraperAgent - Flash)"]:::agent
    ChatAPI <-->|Tool Execution| MLTool["mercadoLibreTool"]:::scraper
    MLTool <-->|WebSocket wss://| BD["Bright Data<br/>Scraping Browser"]:::scraper
    BD <-->|Web Unlocker| ML["Mercado Libre México"]:::target
    
    MLTool -->|Return Competitors JSON| UI
    
    UI -->|2. Request Analysis| StrategyAPI["/api/strategy Route<br/>(StrategyAgent - Pro)"]:::agent
    StrategyAPI -->|Generate Strategy Report| UI
    
    UI -->|Render| Terminal["Console Terminal Logs<br/>(BrightDataTerminal)"]:::client
    UI -->|Render| Competitors["Competitor Cards Grid<br/>(Thumbnails, Ratings, Shipping Speed)"]:::client
```

---

## 🌟 Key Features

*   **Native Bright Data Integration**: Connecting via a secure WebSocket to Bright Data's Scraping Browser ensures Puppeteer executes commands on fully-rendered remote pages, bypassing sophisticated antibot defenses natively.
*   **Sequential Frontend Orchestration**: The client-side UI coordinates API requests asynchronously, passing variables dynamically to ensure the final strategizing agent evaluates real-time market facts.
*   **Live Console Terminal Simulation**: Renders a retro console window in the chat interface that logs live browser actions (CAPTCHA checks, WebSocket handshakes, element parsing), enhancing the prominence of Bright Data's infrastructure.
*   **Premium Competitor Cards Grid**: Displays detailed metrics on competing offers: product thumbnail images, review count, average star ratings, "BEST SELLER" badges, current/previous price, discount percentage, and shipping speeds.
*   **Auto-Store Expatriation**: If the seller's own store is found in the search results, the frontend automatically tags it as `"Your Product"` and filters it out of the competitor JSON data sent to the StrategyAgent to prevent analytical bias.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18 or higher
*   Google AI Studio account (Gemini API key)
*   Active **Bright Data** account with a **Scraping Browser** zone enabled.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/JaDi03/BuyBoxAgent.git
cd BuyBoxAgent
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# AI Models Configuration (Google Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="your_google_api_key"

# Bright Data Scraping Browser Configuration
# Format: wss://brd-customer-<customer_id>-zone-<zone_name>:<password>@brd.superproxy.io:9222
BRIGHT_DATA_WS_ENDPOINT="wss://your_username:your_password@brd.superproxy.io:9222"
```

### 4. Running the App

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your browser to start using the platform.

---

## 🛠️ Built With

*   **[Next.js 15](https://nextjs.org/)** - React Framework.
*   **[Vercel AI SDK](https://sdk.vercel.ai/docs)** - Streaming and Tool management.
*   **[Bright Data](https://brightdata.com/)** - Browser automation proxies and web unlocker systems.
*   **[Puppeteer Core](https://pptr.dev/)** - Browser execution automation.
*   **[Tailwind CSS](https://tailwindcss.com/)** - Page styling.
*   **[Lucide React](https://lucide.dev/)** - Icon systems.

---
*Developed for the Web Data UNLOCKED Hackathon by Bright Data.*
