import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { mercadoLibreTool } from '@/lib/ai/tools/mercadoLibreTool';
import { serpTool } from '@/lib/ai/tools/serpTool';
import { reviewsTool } from '@/lib/ai/tools/reviewsTool';

export const maxDuration = 120; // Allow sufficient time for multiple scraping runs

export async function POST(req: Request) {
  const { messages, companyContext } = await req.json();

  let contextPrompt = "";
  if (companyContext && companyContext.product) {
    const price = parseFloat(companyContext.price) || 0;
    const minPrice = Math.floor(price * 0.7); // 30% less
    const maxPrice = Math.floor(price * 1.3); // 30% more

    contextPrompt = `

=== CRITICAL USER CONTEXT ===
The user sells "${companyContext.product}" at $${companyContext.price} MXN.
Their company name is: "${companyContext.name || 'Not provided'}"
Their seller level is: "${companyContext.level || 'Not provided'}"

INSTRUCTIONS FOR SEARCH:
1. Use the EXACT product name "${companyContext.product}" for your search query.
2. Set minPrice to ${minPrice} and maxPrice to ${maxPrice} in mercadoLibreTool to filter competitors in the same price tier.
3. This price range (±30%) helps exclude accessories and unrelated products.`;
  }

  const result = await streamText({
    model: google('gemini-2.5-flash'), // Flash is fine for calling tools
    system: `You are ScraperAgent (Agent 1), a data extraction specialist.
Your ONLY job is to execute the market diagnostic workflow when the user requests an analysis:
1. Call 'mercadoLibreTool' to scrape competitor listings.
2. Call 'serpTool' to analyze Google SEO visibility for the product name and company name.
3. Wait for the 'mercadoLibreTool' result. Find the top competitor's product link (URL) that is NOT from the user's company ("${companyContext?.name || 'Not provided'}").
4. Call 'reviewsTool' with this top competitor's product URL to analyze customer feedback.

Do NOT output any strategy or competitive recommendations.
Once all tool calls complete, simply say: "Extraction complete. Passing data to StrategyAgent." and stop.${contextPrompt}`,
    messages,
    tools: {
      mercadoLibreTool,
      serpTool,
      reviewsTool
    },
    maxSteps: 6, // Allow it to call all tools sequentially and finalize
  });

  return result.toAIStreamResponse();
}
