# 🛒 BuyBoxAgent - Competitive Intelligence E-Commerce AI

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bright Data](https://img.shields.io/badge/Bright_Data-Scraping_Browser-blue?style=for-the-badge)](https://brightdata.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-black?style=for-the-badge&logo=vercel)](https://sdk.vercel.ai/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange?style=for-the-badge)](https://deepmind.google/technologies/gemini/)

*An AI-powered Market Intelligence Agent built for the Bright Data Hackathon.*

</div>

## 📖 Overview

**BuyBoxAgent** is a sophisticated, autonomous AI agent designed for e-commerce sellers (focusing on Mercado Libre). It acts as your personal competitive intelligence analyst. 

By leveraging **Bright Data's Scraping Browser**, the agent can bypass severe anti-bot protections to extract real-time competitor prices, shipping methods (like "Envío Full"), and product positioning. It then analyzes this data to tell you *exactly* why you are losing sales and how to regain the Buy Box.

### 🌟 Key Features

- **Real-Time Web Scraping**: Extracts live data from Mercado Libre, evading bot detection.
- **"Brain Panel" UI**: Watch the AI "think" in real-time as it plans, executes tools, and observes results.
- **Autonomous Tool Execution**: The agent decides when and how to search for competitors without human hand-holding.
- **Premium UX/UI**: Built with Next.js App Router and Tailwind CSS for a seamless, beautiful experience.

---

## 🏗️ Architecture

The system uses a modern Server-Side Rendered (SSR) approach with streaming AI responses.

```mermaid
graph TD
    %% Colors %%
    classDef user fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    classDef ui fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    classDef agent fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    classDef tools fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    classDef target fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff

    User(("User")):::user -->|Asks Question| Frontend["Next.js Frontend<br>(Chat & Brain Panel)"]:::ui
    Frontend -->|Streams Request| API["Next.js API Route<br>(Vercel AI SDK)"]:::agent
    
    API <-->|Generates Plan & Calls Tools| LLM{"Gemini 2.5 Flash"}:::agent
    API -->|Executes Tool| Tool["search_mercado_libre Tool"]:::tools
    
    Tool <-->|WebSocket Connection| BD["Bright Data<br>Scraping Browser"]:::tools
    BD <-->|Bypasses Anti-Bot| ML[("Mercado Libre")]:::target
    
    Tool -->|Returns JSON Data| API
    API -->|Streams Final Answer| Frontend
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Active Bright Data Account (Scraping Browser Zone enabled)
- Google Gemini API Key

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/JaDi03/BuyBoxAgent.git
cd BuyBoxAgent
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of the project with the following keys:

```env
# LLM (Gemini 2.5 Flash)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Bright Data Scraping Browser
BRIGHT_DATA_AUTH="your_user:your_password"
BRIGHT_DATA_HOST="brd.superproxy.io:9222"
BRIGHT_DATA_WS_ENDPOINT="wss://${BRIGHT_DATA_AUTH}@${BRIGHT_DATA_HOST}"
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - React Framework
- **[Vercel AI SDK](https://sdk.vercel.ai/docs)** - AI Streaming & Tool Management
- **[Bright Data](https://brightdata.com/)** - Web Scraping Infrastructure
- **[Puppeteer Core](https://pptr.dev/)** - Browser Automation
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Lucide React](https://lucide.dev/)** - Icons

---
*Developed for the Web Data UNLOCKED Hackathon.*
