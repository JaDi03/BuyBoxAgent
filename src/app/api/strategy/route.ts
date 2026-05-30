import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, companyContext, scrapedData } = await req.json();

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

IMPORTANT: Look for this company name "${companyContext.name}" in the scraped competitor data.
If found, EXCLUDE it from competitor analysis - they are your client, not a competitor.
If NOT found in the data, analyze ALL scraped products as competitors.`;
  }

  const dataPrompt = scrapedData
    ? `

=== EXTRACTED MARKET DATA (USE ONLY THIS DATA) ===
${JSON.stringify(scrapedData, null, 2)}`
    : '';

  const result = await streamText({
    model: google('gemini-2.5-pro'),
    system: `You are StrategyAgent, a ruthless and highly analytical competitive intelligence AI for Mercado Libre sellers in Mexico. 
Your ONLY goal is to analyze the raw JSON market data provided to you and generate a winning strategy. You do not search the web. You do not use tools.

=== CRITICAL ANTI-HALLUCINATION RULES ===
- You MUST ONLY reference the EXACT competitors, prices, and stats provided in the "EXTRACTED MARKET DATA" JSON section below. 
- Do NOT invent fake competitor names (e.g. do not say "Amazon Mexico" if the seller is "ELECTRONICS MEXICO", even if the product title contains the word "Amazon").
- Do NOT invent fake prices or MSI. 
- If the scraped products are just accessories, point that out.

=== STRATEGY REPORT FORMAT ===
1. **USER PROFILE**: First, explicitly state the user's company name, product, price, and all profile stats so they know you are analyzing THEIR specific situation.
2. **COMPETITOR ANALYSIS**: Perform an unbiased comparison of their exact stats against the scraped competitors using the deep data provided (reviews, shipping speed, discounts, best seller tags).
3. **IDENTIFIED GAPS**: Identify the REAL reasons why competitors might be ranking higher based solely on the extracted data.
4. **ATTACK STRATEGY**: Give a highly actionable, brutal step-by-step strategy based on your factual findings.

${contextPrompt}
${dataPrompt}`,
    messages,
  });

  return result.toTextStreamResponse();
}
