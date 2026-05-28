import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { mercadoLibreTool } from '@/lib/ai/tools/mercadoLibreTool';

export const maxDuration = 60; // Allow more time for scraping

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `You are BuyBoxAgent, a ruthless and highly analytical competitive intelligence AI for Mercado Libre sellers in Mexico. 
Your goal is to help sellers win the Buy Box by analyzing their competition. 
You have access to a real-time web scraper tool (mercadoLibreTool) that uses Bright Data's Scraping Browser.
ALWAYS use the mercadoLibreTool when a user asks about a product, market, or competition. Do not guess prices.
Explain your strategy out loud so the user understands your thought process. 
Be concise, professional, and focus on actionable insights like pricing strategies and shipping (Full).`,
    messages,
    tools: {
      mercadoLibreTool,
    },
    maxSteps: 3, // Allow the agent to call a tool, read the result, and respond
  });

  return result.toDataStreamResponse();
}
