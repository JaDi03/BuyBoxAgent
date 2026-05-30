# 🛒 BuyBoxAgent - Competitive Intelligence E-Commerce AI

<div align="center">

![BuyBoxAgent Cover](public/cover.PNG)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bright Data Browser](https://img.shields.io/badge/Bright_Data-Scraping_Browser-blue?style=for-the-badge)](https://brightdata.com/)
[![Bright Data SERP](https://img.shields.io/badge/Bright_Data-SERP_API-blue?style=for-the-badge)](https://brightdata.com/)
[![Bright Data Proxies](https://img.shields.io/badge/Bright_Data-Residential_Proxies-blue?style=for-the-badge)](https://brightdata.com/)
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

### 🔄 Agent Orchestration Flow
The following diagram illustrates how the frontend coordinates tasks and prompts sequentially between our specialized AI agents:

```mermaid
graph LR
    classDef client fill:#3B82F6,stroke:#1D4ED8,stroke-width:1px,color:#fff
    classDef agent fill:#8B5CF6,stroke:#6D28D9,stroke-width:1px,color:#fff
    classDef data fill:#10B981,stroke:#047857,stroke-width:1px,color:#fff

    User(("Seller (User)")):::client -->|Input Profile & Query| UI["Next.js Frontend"]:::client
    UI -->|1. Request Diagnostics| A1["ScraperAgent<br/>(Gemini 2.5 Flash)"]:::agent
    A1 -->|2. Runs Sequential Tools| BD[Bright Data Stack]:::data
    BD -->|3. Structured Feeds JSON| UI
    UI -->|4. Request Strategy| A2["StrategyAgent<br/>(Gemini 2.5 Pro)"]:::agent
    A2 -->|5. Rich Executive Report| UI
    UI -->|Render| User
```

### 📊 Data Ingestion Pipeline
This layout details the inputs, tools, and rich structured outputs extracted by each Bright Data product in the workflow:

```mermaid
graph LR
    classDef source fill:#3B82F6,stroke:#1D4ED8,stroke-width:1px,color:#fff
    classDef tool fill:#8B5CF6,stroke:#6D28D9,stroke-width:1px,color:#fff
    classDef data fill:#10B981,stroke:#047857,stroke-width:1px,color:#fff

    Query["Search Target (e.g., Yeti 30oz)"]:::source --> MLT["mercadoLibreTool"]:::tool
    Query --> SRPT["serpTool"]:::tool
    
    MLT -->|wss:// Scraping Browser| MLData["Mercado Libre Mexico:\n- Competitor pricing & discounts\n- Envío FULL speed & logistics\n- Ratings & official store flags"]:::data

    SRPT -->|POST /request SERP API| SERPData["Google Search MX:\n- Organic SEO ranking positions\n- Ad placements & Shopping rank\n- Competitor Google URLs"]:::data

    MLData -->|Top Competitor Link| RVT["reviewsTool"]:::tool
    RVT -->|wss:// Scraping Browser| RVData["Review Intelligence:\n- Customer raw comments\n- Rating breakdown & dates\n- Buyer complaints (vulnerabilities)"]:::data
```

<details>
  <summary>🔄 View Detailed Technical Sequence Diagram (System Steps)</summary>

  ```mermaid
  sequenceDiagram
      autonumber
      actor Seller as Seller (User)
      participant UI as Next.js Frontend (Hub & Tabs)
      participant A1 as ScraperAgent (Gemini 2.5 Flash)
      participant BD as Bright Data APIs (Browser/SERP)
      participant ML as Mercado Libre / Google Search
      participant A2 as StrategyAgent (Gemini 2.5 Pro)

      Seller->>UI: Configure Profile & Start
      UI->>A1: Send Query & Context (POST /api/chat)
      
      Note over A1: Calls mercadoLibreTool (ML) & serpTool (Google)
      A1->>BD: Connect to Scraping Browser (Websocket) & SERP API (REST)
      BD->>ML: Scrapes product listings & Google search rankings
      ML-->>BD: Returns fully rendered HTML & parsed SERP JSON
      BD-->>A1: Returns competitor listings (JSON) & SEO rankings (JSON)
      
      Note over A1: Identifies top competitor in ML listings
      A1->>BD: Executes reviewsTool on competitor URL
      BD->>ML: Navigates, scrolls, and extracts buyer comments
      ML-->>BD: Returns dynamically loaded reviews
      BD-->>A1: Returns competitor reviews (JSON)
      
      A1-->>UI: Stream: "Extraction complete. Passing data..."
      UI->>A2: Send Chat History + Profile + Consolidated JSON (POST /api/strategy)
      Note over A2: Gemini 2.5 Pro analyzes Pricing, SEO, and Sentiment Gaps
      A2-->>UI: Stream: Strategic Attack Report (Executive Tables & To-Do Checklist)
      UI-->>Seller: Renders Hub (Tabs) & finalized Report
  ```
</details>

---

## 🏗️ System Structure
The following diagram illustrates the relationship between the client-side components and the serverless APIs:

```mermaid
graph LR
    %% Styling %%
    classDef client fill:#3B82F6,stroke:#1D4ED8,stroke-width:1px,color:#fff
    classDef agent fill:#8B5CF6,stroke:#6D28D9,stroke-width:1px,color:#fff
    classDef scraper fill:#06B6D4,stroke:#0891B2,stroke-width:1px,color:#fff
    classDef target fill:#EF4444,stroke:#B91C1C,stroke-width:1px,color:#fff

    User(("Seller (User)")):::client -->|Define Profile| UI["Next.js Frontend<br/>(Seller Profile & Chat Hub)"]:::client
    UI -->|1. Request Scraping| ChatAPI["/api/chat Route<br/>(ScraperAgent)"]:::agent
    ChatAPI <-->|Tool Execution| Tools["mercadoLibreTool<br/>serpTool<br/>reviewsTool"]:::scraper
    Tools <-->|Websocket / REST| BD["Bright Data Stack<br/>(Scraping Browser & SERP API)"]:::scraper
    BD <-->|Web Unlocker| Target["E-Commerce & Search Target<br/>(Mercado Libre & Google MX)"]:::target
    
    Tools -->|Consolidated Feeds JSON| UI
    UI -->|2. Request Analysis| StrategyAPI["/api/strategy Route<br/>(StrategyAgent)"]:::agent
    StrategyAPI -->|Generate Strategy Report| UI
```

---

## 🌟 Key Features

*   **Native Bright Data Integration**: Connecting via a secure WebSocket to Bright Data's Scraping Browser ensures Puppeteer executes commands on fully-rendered remote pages, bypassing sophisticated antibot defenses natively.
*   **Sequential Frontend Orchestration**: The client-side UI coordinates API requests asynchronously, passing variables dynamically to ensure the final strategizing agent evaluates real-time market facts.
*   **Live Console Terminal Simulation**: Renders a retro console window in the chat interface that logs live browser actions (CAPTCHA checks, WebSocket handshakes, element parsing), enhancing the prominence of Bright Data's infrastructure.
*   **Premium Competitor Cards Grid**: Displays detailed metrics on competing offers: product thumbnail images, review count, average star ratings, "BEST SELLER" badges, current/previous price, discount percentage, and shipping speeds.
*   **Auto-Store Expatriation**: If the seller's own store is found in the search results, the frontend automatically tags it as `"Your Product"` and filters it out of the competitor JSON data sent to the StrategyAgent to prevent analytical bias.

---

## 🔆 Bright Data Technology Showcase

BuyBoxAgent leverages multiple products from the Bright Data stack to bypass scraping barriers and perform deep e-commerce intelligence:

### 1. Scraping Browser 🌐 & Residential Proxy Network 🛡️
- **Purpose**: Bypass high-security antibot measures on Mercado Libre Mexico listings.
- **Implementation**: Standard WebSocket secure interface (`wss://`) routing Puppeteer instructions directly to Bright Data’s cloud-hosted browsers.
- **Proxy Infrastructure**: The browser sessions automatically route traffic through Bright Data's **Residential Proxy Network**. This dynamically rotates residential IPs geolocalized in Mexico.
- **Value & Agent Significance**: 
  - **What it is**: A vast pool of real consumer device IPs rather than datacenter servers.
  - **How it works**: Every navigation request looks like it comes from a genuine Mexican residential ISP (Telmex, Megacable, etc.).
  - **Why it matters to our Agent**: It prevents IP-banning, rate-limiting, and geolocation blocks, allowing our autonomous agents to run multiple diagnostic queries continuously in the same market without being flagged as automated bots.
- **Code Path**: [brightDataScraper.ts](file:///c:/Users/USER/Desktop/BuyBoxAgent/src/lib/scraper/brightDataScraper.ts)

### 2. SERP API 🔍
- **Purpose**: Tracks organic SEO visibility of the user's product vs. competitors on Google Search Mexico.
- **Implementation**: REST request to Bright Data's global Search Engine Scraper endpoint returning structured SERP JSON results.
- **Value**: Avoids hardcoding complex DOM selectors for Google, guaranteeing stable search position tracking.
- **Code Path**: [brightDataSerp.ts](file:///c:/Users/USER/Desktop/BuyBoxAgent/src/lib/scraper/brightDataSerp.ts)

### 3. Review Intelligence (Scraping Browser for Reviews) 📊
- **Purpose**: Scraping and mining customer reviews from top competitors' product pages.
- **Implementation**: Automated cloud browser routing to competitor details pages to parse rating distribution and buyer reviews.
- **Value**: Collects organic text comments for downstream AI-powered sentiment analysis and gap detection.
- **Code Path**: [brightDataReviews.ts](file:///c:/Users/USER/Desktop/BuyBoxAgent/src/lib/scraper/brightDataReviews.ts)

---

## 💰 Business Value & Market Opportunity

- **The Problem**: Over 82% of e-commerce sales go through the Buy Box. High-volume sellers lose thousands of dollars daily due to dynamic competitor repricing and shadow-dropping without real-time visibility.
- **TAM**: $4.9T global e-commerce retail market.
- **SAM**: 2M+ active high-volume sellers in Latin America (Mercado Libre).
- **Business Model**: SaaS subscription offering weekly market audits and real-time repricing suggestions.
  - **Basic Plan**: $29/mo (1 product tracking, daily audits)
  - **Pro Plan**: $99/mo (Unlimited products, real-time alerts, review analysis)
- **Projected ARR**: $1.2M ARR by Year 2 (assuming 1,000 active Pro subscribers).

---

## 🗺️ Future Roadmap

- [ ] Support for multiple marketplaces (Amazon Mexico, Walmart, Liverpool).
- [ ] Direct API connection to Mercado Libre Seller Center for automated pricing updates.
- [ ] Historical pricing graphs with automated threshold alerts (email & SMS notifications).
- [ ] Multi-language support (English / Spanish localization).
- [ ] White-label competitive reporting exports in PDF format for e-commerce agencies.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18 or higher
*   Google AI Studio account (Gemini API key)
*   Active **Bright Data** account with Scraping Browser and SERP API zones active.

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

# Bright Data SERP API Configuration
# Format: API key from account settings page
BRIGHT_DATA_API_KEY="your_bright_data_api_token"
BRIGHT_DATA_SERP_ZONE="your_serp_zone_name"
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
*   **[Bright Data](https://brightdata.com/)** - Scraping browser and search proxies.
*   **[Puppeteer Core](https://pptr.dev/)** - Browser execution automation.
*   **[Tailwind CSS](https://tailwindcss.com/)** - Page styling.
*   **[Lucide React](https://lucide.dev/)** - Icon systems.

---
*Developed for the Web Data UNLOCKED Hackathon by Bright Data.*
