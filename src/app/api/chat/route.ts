import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { mercadoLibreTool } from '@/lib/ai/tools/mercadoLibreTool';

export const maxDuration = 60; // Allow more time for scraping

export async function POST(req: Request) {
  const { messages, companyContext } = await req.json();

  let contextPrompt = "";
  if (companyContext && companyContext.product) {
    const price = parseFloat(companyContext.price) || 0;
    const minPrice = Math.floor(price * 0.7); // 30% menos
    const maxPrice = Math.floor(price * 1.3); // 30% más

    contextPrompt = `

=== CRITICAL USER CONTEXT ===
The user sells "${companyContext.product}" at $${companyContext.price} MXN.
Their company name is: "${companyContext.name || 'Not provided'}"
Their seller level is: "${companyContext.level || 'Not provided'}"

INSTRUCTIONS FOR SEARCH:
1. Use the EXACT product name "${companyContext.product}" for your search query.
2. Set minPrice to ${minPrice} and maxPrice to ${maxPrice} to filter competitors in the same price tier.
3. This price range (±30%) helps exclude accessories and unrelated products.`;
  }

  const result = await streamText({
    model: google('gemini-2.5-flash'), // Flash is fine for just calling tools
    system: `You are ScraperAgent (Agent 1), a data extraction specialist.
Your ONLY job is to call the 'mercadoLibreTool' when the user asks you to analyze a product.
Do NOT output any strategy or analysis.
Once the tool returns data, simply say: "Extracción completada. Pasando datos al Agente Estratega." and stop.${contextPrompt}`,
    messages,
    tools: {
      mercadoLibreTool,
    },
    maxSteps: 2, // Allow it to call the tool and say "Extracción completada"
  });

  return result.toAIStreamResponse();
}
