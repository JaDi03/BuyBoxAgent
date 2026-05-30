import { tool } from 'ai';
import { z } from 'zod';
import { searchGoogleVisibility } from '@/lib/scraper/brightDataSerp';

export const serpTool = tool({
  description: 'Tracks the Google search visibility and SEO ranking position for the target product to check how the seller is positioned on Google Search vs. key competitors.',
  parameters: z.object({
    productName: z.string().describe('The search query for the product, e.g. "Yeti Rambler 30oz".'),
    companyName: z.string().describe('The name of the user\'s company to check their ranking on the search engine.'),
  }),
  execute: async ({ productName, companyName }) => {
    try {
      console.log(`[AI Tool] Executing serpTool for product: "${productName}", company: "${companyName}"`);
      const data = await searchGoogleVisibility(productName, companyName);
      
      return {
        success: true,
        data,
        message: `Google search visibility retrieved. User product is ranked at position ${data.userProductRank || 'Not Found'} in search results.`,
      };
    } catch (error: any) {
      console.error('[AI Tool] Failed to execute serpTool:', error);
      return {
        success: false,
        error: error.message || 'Failed to track search visibility.',
      };
    }
  },
});
