import { tool } from 'ai';
import { z } from 'zod';
import { scrapeMercadoLibre } from '@/lib/scraper/brightDataScraper';

export const mercadoLibreTool = tool({
  description: 'Scrapes real-time product data (prices, titles, shipping) from Mercado Libre Mexico to analyze competitors.',
  parameters: z.object({
    searchQuery: z.string().describe('The name of the product to search for, e.g., "audifonos inalambricos bluetooth"'),
  }),
  execute: async ({ searchQuery }) => {
    try {
      console.log(`[AI Tool] Executing mercadoLibreTool for query: "${searchQuery}"`);
      const products = await scrapeMercadoLibre(searchQuery);
      
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
