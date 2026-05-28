import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { mercadoLibreTool } from '@/lib/ai/tools/mercadoLibreTool';

export const maxDuration = 60; // Allow more time for scraping

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    system: `You are BuyBoxAgent, a ruthless and highly analytical competitive intelligence AI for Mercado Libre sellers in Mexico. 
Your goal is to help sellers win the Buy Box by analyzing their competition. 
You have access to a real-time web scraper tool (mercadoLibreTool) that uses Bright Data's Scraping Browser.
If the user asks to analyze the market for a product, USE THE TOOL. Pass the search query accurately.
When you receive the data from the tool, act as an expert e-commerce analyst:
1. Identify the average price and price range.
2. Spot the top sellers (based on sales/reviews).
3. Give actionable advice on how the user can price their product to win the Buy Box.
4. Point out any interesting patterns (e.g. "Most top listings offer free shipping" or "The top seller has a heavily discounted price").
Do not just list the products. Give an executive summary that is highly useful for a seller.`,
    messages,
    tools: {
      mercadoLibreTool,
    },
    maxSteps: 3, // Allow the agent to call a tool, read the result, and respond
  });

  return result.toAIStreamResponse();
}
