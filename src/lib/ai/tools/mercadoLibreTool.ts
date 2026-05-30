import { tool } from 'ai';
import { z } from 'zod';
import { scrapeMercadoLibre } from '@/lib/scraper/brightDataScraper';

export const mercadoLibreTool = tool({
  description: 'Scrapes real-time product data (prices, titles, shipping) from Mercado Libre Mexico to analyze competitors. You MUST pass minPrice and maxPrice to filter exact tier competitors.',
  parameters: z.object({
    searchQuery: z.string().describe('The EXACT product name and model to search for, e.g., "Jbl Tune 520BT" instead of "audifonos".'),
    minPrice: z.number().describe('Minimum price in MXN to filter competitors (e.g. 200)'),
    maxPrice: z.number().describe('Maximum price in MXN to filter competitors (e.g. 600)'),
  }),
  execute: async ({ searchQuery, minPrice, maxPrice }) => {
    try {
      console.log(`[AI Tool] Executing mercadoLibreTool for query: "${searchQuery}" with price range: ${minPrice}-${maxPrice}`);
      const products = await scrapeMercadoLibre(searchQuery, minPrice, maxPrice);
      
      return {
        success: true,
        data: products,
        message: `Successfully retrieved ${products.length} competitor products from Mercado Libre.`,
      };
    } catch (error: any) {
      console.error('[AI Tool] Failed to execute mercadoLibreTool:', error);
      return {
        success: false,
        error: error.message || 'Failed to scrape data. The target site might have changed its structure or the proxy failed.',
      };
    }
  },
});
