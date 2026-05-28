import puppeteer from 'puppeteer-core';

export interface ScrapedProduct {
  title: string;
  price: number;
  currency: string;
  isFullShipping: boolean;
  link: string;
}

/**
 * Connects to Bright Data Scraping Browser and extracts product listings from Mercado Libre Mexico.
 * 
 * @param searchQuery - The product to search for (e.g., "audifonos inalambricos")
 * @returns Array of scraped products
 */
export async function scrapeMercadoLibre(searchQuery: string): Promise<ScrapedProduct[]> {
  const wsEndpoint = process.env.BRIGHT_DATA_WS_ENDPOINT;
  
  if (!wsEndpoint) {
    throw new Error('BRIGHT_DATA_WS_ENDPOINT is not defined in environment variables.');
  }

  console.log(`[Scraper] Connecting to Bright Data Scraping Browser...`);
  
  let browser;
  try {
    // Connect to Bright Data's cloud browser
    browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    });

    console.log(`[Scraper] Connected successfully. Opening new page...`);
    const page = await browser.newPage();
    
    // Set a generous navigation timeout since cloud browsers might have latency
    page.setDefaultNavigationTimeout(60000);

    // Format the search query for Mercado Libre Mexico URL
    // e.g., "audifonos inalambricos" -> "audifonos-inalambricos"
    const formattedQuery = searchQuery.trim().replace(/\s+/g, '-').toLowerCase();
    const targetUrl = `https://listado.mercadolibre.com.mx/${formattedQuery}`;

    console.log(`[Scraper] Navigating to: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    console.log(`[Scraper] Page loaded. Extracting product data...`);
    
    // Evaluate in browser context to extract elements
    const products = await page.evaluate(() => {
      const results: any[] = [];
      // Mercado libre uses '.ui-search-layout__item' for list items
      const items = document.querySelectorAll('.ui-search-layout__item');
      
      // Limit to top 5 results to keep the AI context window concise and focused
      const limit = Math.min(items.length, 5);
      
      for (let i = 0; i < limit; i++) {
        const item = items[i];
        
        // Extract Title (fallback through possible selectors)
        const titleH2 = item.querySelector('h2');
        const titlePoly = item.querySelector('.poly-component__title');
        const imgEl = item.querySelector('img');
        const title = titleH2?.textContent?.trim() || titlePoly?.textContent?.trim() || imgEl?.alt?.trim() || 'Unknown Title';
        
        // Extract Price
        const priceElement = item.querySelector('.andes-money-amount__fraction');
        let price = 0;
        if (priceElement && priceElement.textContent) {
          price = parseInt(priceElement.textContent.replace(/,/g, ''), 10);
        }
        
        // Extract Shipping (Full)
        // Check for specific Full SVGs or text
        const isFullShipping = item.innerHTML.includes('Full') || 
                               item.innerHTML.includes('poly-icon-full') || 
                               item.querySelector('svg.ui-search-icon--full') !== null;
        
        // Extract Link
        const linkElement = item.querySelector('a'); // Get the primary link
        const link = linkElement ? linkElement.href : '';
        
        results.push({
          title,
          price,
          currency: 'MXN',
          isFullShipping,
          link
        });
      }
      
      return results;
    });

    console.log(`[Scraper] Extraction complete. Found ${products.length} products.`);
    return products;
    
  } catch (error) {
    console.error('[Scraper] Error during scraping process:', error);
    throw error;
  } finally {
    if (browser) {
      console.log(`[Scraper] Closing browser connection...`);
      await browser.close();
    }
  }
}
