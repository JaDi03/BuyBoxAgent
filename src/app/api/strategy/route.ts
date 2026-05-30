import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, companyContext, scrapedData, serpData, reviewsData } = await req.json();

  // Construct complete company context
  let contextPrompt = "";
  if (companyContext && companyContext.name) {
    contextPrompt = `

=== USER COMPANY PROFILE (YOUR CLIENT) ===
Company Name: "${companyContext.name}"
Product: "${companyContext.product}"
Selling Price: $${companyContext.price} MXN
Seller Level: ${companyContext.level || 'Not provided'}
Sales Track Record: ${companyContext.sales || 'Not provided'}
Shipping Model: ${companyContext.shipping || 'Not provided'}
Warranty/Returns: ${companyContext.warranty || 'Not provided'}

IMPORTANT: Look for this company name "${companyContext.name}" in the scraped competitor data and Google search results.
If found, EXCLUDE it from competitor analysis - they are your client, not a competitor.
If NOT found in the data, analyze ALL scraped products as competitors.`;
  }

  const dataPrompt = scrapedData
    ? `

=== EXTRACTED MARKET DATA (MERCADO LIBRE MEXICO) ===
${JSON.stringify(scrapedData, null, 2)}`
    : '';

  const serpPrompt = serpData
    ? `

=== GOOGLE SEARCH VISIBILITY (BRIGHT DATA SERP API) ===
${JSON.stringify(serpData, null, 2)}`
    : '';

  const reviewsPrompt = reviewsData
    ? `

=== COMPETITOR REVIEW ANALYSIS (REVIEWS INTELLIGENCE) ===
${JSON.stringify(reviewsData, null, 2)}`
    : '';

  const systemPrompt: string = `You are StrategyAgent, a ruthless and highly analytical competitive intelligence AI for Mercado Libre sellers in Mexico. 
Your ONLY goal is to analyze the market data, search engine rankings, and competitor reviews to generate a winning strategy. You do not do external research. You only synthesize the facts provided.

=== CRITICAL ANTI-HALLUCINATION RULES ===
- You MUST ONLY reference the EXACT competitors, prices, stats, search positions, and review complaints provided in the JSON data below.
- Do NOT invent fake competitor names.
- Do NOT invent fake prices, rankings, or sentiment distribution metrics.

=== STRATEGY REPORT FORMAT ===
You MUST structure the report in a highly visual, easy-to-read way for novice sellers. Do NOT write long paragraphs of text. Keep statements short, bold, and highly structured. Use the following format exactly:

1. **📊 DIAGNOSTIC SUMMARY (Dashboard)**
   Create a markdown table comparing:
   | Metric | Your Store | Competitor Leader | Status / Opportunity |
   Compare Price, Shipping Model, Google SEO Rank, and Star Ratings.

2. **👤 CUSTOMER PROFILE**
   A brief, bulleted profile of the user's setup.

3. **⚔️ COMPETITIVE ANALYSIS & GAPS**
   - Point out who is undercutting you and by how much.
   - Use a GitHub warning alert (\`> [!WARNING]\`) to highlight your main pricing or positioning risk.

4. **🔍 GOOGLE SEO VISIBILITY**
   - Brief analysis of Google visibility.
   - Explain in simple terms if competitors are stealing search traffic.

5. **💬 LEADER VULNERABILITIES (Customer Feedback)**
   - Detail what customers hate about the top competitor based on their negative reviews (e.g. broken packaging, slow shipping).
   - Show how you can exploit these errors.

6. **🚀 STEP-BY-STEP ACTION PLAN (Checklist for Beginners)**
   Organize into "Phase 1: Immediate Actions (24h)" and "Phase 2: Growth Strategy".
   Format every single step as a Markdown checkbox (\`- [ ]\`) so the user can easily follow them.
   Use GitHub tip callouts (\`> [!TIP]\`) to write exact Copy-Paste examples for listing titles, descriptions, and value propositions.

${contextPrompt}
${dataPrompt}
${serpPrompt}
${reviewsPrompt}`;

  const result = await streamText({
    model: google('gemini-2.5-pro'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
