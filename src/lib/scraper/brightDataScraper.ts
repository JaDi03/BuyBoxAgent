import puppeteer from 'puppeteer-core';

export interface ScrapedProduct {
  title: string;
  price: number;
  currency: string;
  isFullShipping: boolean;
  link: string;
  seller?: string;
  rating?: string;
  image?: string;
  installments?: string;
  organicRank: number;
  // Deep Extraction Fields
  originalPrice?: number;
  discountPercentage?: string;
  reviewsCount?: string;
  shippingSpeed?: string;
  isSponsored: boolean;
  bestSellerTag: boolean;
  condition?: string;
}

/**
 * Connects to Bright Data Scraping Browser and extracts product listings from Mercado Libre Mexico.
 * 
 * @param searchQuery - The product to search for (e.g., "audifonos inalambricos")
 * @param minPrice - Optional minimum price filter
 * @param maxPrice - Optional maximum price filter
 * @returns Array of scraped products
 */
export async function scrapeMercadoLibre(searchQuery: string, minPrice?: number, maxPrice?: number): Promise<ScrapedProduct[]> {
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

    let targetUrl = `https://listado.mercadolibre.com.mx/${formattedQuery}`;
    if (minPrice !== undefined && maxPrice !== undefined) {
      targetUrl += `_PriceRange_${Math.floor(minPrice)}-${Math.floor(maxPrice)}`;
    }

    console.log(`[Scraper] Navigating to: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    console.log(`[Scraper] Page loaded. Extracting product data...`);

    // Evaluate in browser context to extract elements
    const products = await page.evaluate(() => {
      const results: any[] = [];
      const items = document.querySelectorAll('.ui-search-layout__item');
      const limit = Math.min(items.length, 5);

      for (let i = 0; i < limit; i++) {
        const item = items[i];

        // 1. Title & Link
        const titleEl = item.querySelector('a.poly-component__title');
        const title = titleEl?.textContent?.trim() || 'Unknown Title';
        const link = (titleEl as HTMLAnchorElement)?.href || '';

        // 2. Image
        const imgEl = item.querySelector('img.poly-component__picture');
        const image = (imgEl as HTMLImageElement)?.src || '';

        // 3. Price (Current)
        const priceElement = item.querySelector('.poly-price__current .andes-money-amount__fraction');
        let price = 0;
        if (priceElement && priceElement.textContent) {
          price = parseInt(priceElement.textContent.replace(/,/g, ''), 10);
        }

        // 3b. Deep: Original Price & Discount
        const originalPriceEl = item.querySelector('.andes-money-amount--previous .andes-money-amount__fraction');
        let originalPrice: number | undefined = undefined;
        if (originalPriceEl && originalPriceEl.textContent) {
          originalPrice = parseInt(originalPriceEl.textContent.replace(/,/g, ''), 10);
        }
        const discountEl = item.querySelector('.andes-money-amount__discount');
        const discountPercentage = discountEl?.textContent?.trim() || undefined;

        // 4. Shipping (Full & Speed)
        const itemHtml = item.innerHTML;
        const isFullShipping = itemHtml.includes('#poly_full') || itemHtml.includes('Enviado por FULL') || itemHtml.includes('FULL');

        const shippingSpeedEl = item.querySelector('.poly-component__shipping');
        let shippingSpeed = shippingSpeedEl?.textContent?.trim();
        if (shippingSpeed?.includes('FULL')) {
          shippingSpeed = shippingSpeed.replace('FULL', '').trim();
        }

        // 5. Seller
        const sellerEl = item.querySelector('.poly-component__seller');
        let seller = sellerEl?.textContent?.replace(/Tienda oficial/g, '')?.replace(/Por /g, '')?.trim() || 'Mercado Libre / Desconocido';

        // 6. Rating & Reviews
        const ratingEl = item.querySelector('.poly-component__review-compacted .poly-phrase-label');
        const rating = ratingEl?.textContent?.trim() || '';

        const reviewsEl = item.querySelector('.poly-component__review-compacted .poly-reviews__total');
        const reviewsCount = reviewsEl?.textContent?.replace(/[()]/g, '')?.trim() || '0';

        // 7. Installments (Cuotas)
        const installmentsEl = item.querySelector('.poly-component__installments') || item.querySelector('.poly-price__installments');
        const installments = installmentsEl?.textContent?.trim() || 'Sin MSI';

        // 8. Deep: Sponsored, Best Seller, Condition
        const isSponsored = itemHtml.includes('Promocionado');
        const bestSellerTag = itemHtml.includes('MÁS VENDIDO');
        let condition = 'Nuevo';
        if (itemHtml.includes('Reacondicionado') || title.toLowerCase().includes('reacondicionado')) {
          condition = 'Reacondicionado';
        }

        results.push({
          title,
          price,
          currency: 'MXN',
          isFullShipping,
          link,
          seller,
          rating,
          image,
          installments,
          organicRank: i + 1,
          originalPrice,
          discountPercentage,
          reviewsCount,
          shippingSpeed,
          isSponsored,
          bestSellerTag,
          condition
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
