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

  const result = await streamText({
    model: google('gemini-2.5-pro'),
    system: `You are StrategyAgent, a ruthless and highly analytical competitive intelligence AI for Mercado Libre sellers in Mexico. 
Your ONLY goal is to analyze the market data, search engine rankings, and competitor reviews to generate a winning strategy. You do not do external research. You only synthesize the facts provided.

=== CRITICAL ANTI-HALLUCINATION RULES ===
- You MUST ONLY reference the EXACT competitors, prices, stats, search positions, and review complaints provided in the JSON data below.
- Do NOT invent fake competitor names.
- Do NOT invent fake prices, rankings, or sentiment distribution metrics.

=== STRATEGY REPORT FORMAT ===
1. **USER PROFILE**: State the user's company name, product, price, and profile stats.
2. **COMPETITOR ANALYSIS**: Compare prices, shipping speed, ratings, and Google Search rankings of your client vs. competitors.
3. **SEO VISIBILITY & GAPS**: Analyze how visible the user's product is on Google compared to other Mercado Libre listings. Highlight if competitors are outranking them organically.
4. **REVIEW SENTIMENT INTELLIGENCE**: Highlight the main strengths and weaknesses of the top competitor based on their scraped reviews. Point out frequent buyer complaints (e.g. shipping delay, packaging issues, fragile quality).
5. **ACTIONABLE ATTACK STRATEGY**: Give a step-by-step pricing, logistics, SEO, and product value proposition strategy to win the Buy Box and organic visibility.

${contextPrompt}
${dataPrompt}
${serpPrompt}
${reviewsPrompt}`,
    messages,
  });

  return result.toTextStreamResponse();
}
