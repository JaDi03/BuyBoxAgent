import { tool } from 'ai';
import { z } from 'zod';
import { scrapeCompetitorReviews } from '@/lib/scraper/brightDataReviews';

export const reviewsTool = tool({
  description: 'Scrapes reviews and customer comments for a competitor product to analyze product quality, customer complaints, and sentiment.',
  parameters: z.object({
    productUrl: z.string().describe('The URL of the competitor product page on Mercado Libre (e.g. obtained from mercadoLibreTool).'),
    productName: z.string().describe('The name/title of the product to scrape reviews for.'),
  }),
  execute: async ({ productUrl, productName }) => {
    try {
      console.log(`[AI Tool] Executing reviewsTool for competitor product: "${productName}"`);
      const data = await scrapeCompetitorReviews(productUrl, productName);
      
      return {
        success: true,
        data,
        message: `Competitor reviews retrieved successfully. Scraped ${data.reviews.length} comments. Average rating is ${data.averageRating}/5.`,
      };
    } catch (error: any) {
      console.error('[AI Tool] Failed to execute reviewsTool:', error);
      return {
        success: false,
        error: error.message || 'Failed to extract product reviews.',
      };
    }
  },
});
