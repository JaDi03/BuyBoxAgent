import puppeteer from 'puppeteer-core';

export interface ProductReview {
  title: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface ReviewsResponse {
  success: boolean;
  productUrl: string;
  averageRating: number;
  reviews: ProductReview[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  isMockData: boolean;
}

/**
 * Connects to Bright Data Scraping Browser and extracts reviews from a specific Mercado Libre product URL.
 * Falls back to AI-like simulated reviews if connections fail or credentials are missing.
 */
export async function scrapeCompetitorReviews(productUrl: string, productName: string): Promise<ReviewsResponse> {
  const wsEndpoint = process.env.BRIGHT_DATA_WS_ENDPOINT;

  console.log(`[Reviews Scraper] Initiating review extraction for URL: ${productUrl}`);

  if (!wsEndpoint) {
    console.log(`[Reviews Scraper] BRIGHT_DATA_WS_ENDPOINT not defined. Falling back to high-fidelity mock reviews.`);
    return getMockReviews(productUrl, productName);
  }

  let browser;
  try {
    console.log(`[Reviews Scraper] Connecting to Bright Data Scraping Browser...`);
    browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45000);

    // Clean up URL to point to the reviews section if possible, or just visit the product page
    // Often, reviews are embedded directly on the main product details page.
    console.log(`[Reviews Scraper] Navigating to competitor product: ${productUrl}`);
    await page.goto(productUrl, { waitUntil: 'networkidle2' });

    // Scroll down to trigger lazy loading of lower page content (questions/reviews)
    console.log(`[Reviews Scraper] Scrolling down to trigger dynamic reviews loading...`);
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight * 0.75);
    });

    // Wait a brief period for client-side API requests to fetch reviews and mount on DOM
    await new Promise(resolve => setTimeout(resolve, 3500));

    console.log(`[Reviews Scraper] Waiting for reviews elements to mount...`);
    try {
      await page.waitForSelector('.ui-review-capability-comments__comment, .ui-review-view__item, .ui-review-capability-comments__comment__content, .reviews-slide', { timeout: 10000 });
      console.log(`[Reviews Scraper] Reviews elements mounted successfully.`);
    } catch (e) {
      console.warn(`[Reviews Scraper] Warning: Timeout waiting for reviews elements. Proceeding with page content.`);
    }

    console.log(`[Reviews Scraper] Page ready. Parsing reviews section...`);

    // Extract reviews using common Mercado Libre selectors
    const extractedData = await page.evaluate(() => {
      const reviewsList: any[] = [];
      
      // Selectors for reviews container and items on Mercado Libre
      const reviewElements = document.querySelectorAll('.ui-review-capability-comments__comment, .ui-review-view__item, .ui-review-capability-comments__comment__content, .reviews-slide');
      
      const limit = Math.min(reviewElements.length, 5);
      
      for (let i = 0; i < limit; i++) {
        const el = reviewElements[i];
        
        // Title
        const titleEl = el.querySelector('.ui-review-capability-comments__comment__title, .ui-review-view__item-title');
        const title = titleEl?.textContent?.trim() || 'Review sin título';
        
        // Comment/Content
        const commentEl = el.querySelector('.ui-review-capability-comments__comment__content, .ui-review-capability-comments__comment__description, .ui-review-view__item-description');
        const comment = commentEl?.textContent?.trim() || '';
        
        // Stars/Rating (often represented by classes or aria-label)
        const starsEl = el.querySelector('.andes-rating__stars, .ui-review-capability-comments__comment__rating');
        const ariaLabel = starsEl?.getAttribute('aria-label') || '';
        let rating = 5; // Default fallback
        const ratingMatch = ariaLabel.match(/(\d+)\s+de\s+5/i) || ariaLabel.match(/(\d+)\s+stars/i) || ariaLabel.match(/(\d+)/);
        if (ratingMatch && ratingMatch[1]) {
          rating = parseInt(ratingMatch[1], 10);
        }
        
        // Date
        const dateEl = el.querySelector('.ui-review-capability-comments__comment__date, .ui-review-view__item-date');
        const date = dateEl?.textContent?.trim() || undefined;

        if (comment) {
          reviewsList.push({ title, rating, comment, date });
        }
      }

      // Try to extract average rating of the product
      const avgRatingEl = document.querySelector('.ui-review-capability__rating__number, .ui-review-view__rating-number');
      let averageRating = 4.5;
      if (avgRatingEl && avgRatingEl.textContent) {
        averageRating = parseFloat(avgRatingEl.textContent);
      }

      return {
        reviews: reviewsList,
        averageRating
      };
    });

    console.log(`[Reviews Scraper] Extracted ${extractedData.reviews.length} reviews.`);

    // If no reviews found on page (e.g. selector changed or new product), return realistic reviews rather than empty data
    if (extractedData.reviews.length === 0) {
      console.log(`[Reviews Scraper] No reviews found on active DOM. Returning realistic mock reviews.`);
      return getMockReviews(productUrl, productName);
    }

    // Calculate sentiment distribution based on rating
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    extractedData.reviews.forEach((r) => {
      if (r.rating >= 4) positive++;
      else if (r.rating === 3) neutral++;
      else negative++;
    });

    const total = extractedData.reviews.length;

    return {
      success: true,
      productUrl,
      averageRating: extractedData.averageRating,
      reviews: extractedData.reviews,
      sentimentBreakdown: {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100)
      },
      isMockData: false
    };

  } catch (error: any) {
    console.error(`[Reviews Scraper] Scraping Browser error:`, error);
    console.log(`[Reviews Scraper] Recovering via high-fidelity mock reviews.`);
    return getMockReviews(productUrl, productName);
  } finally {
    if (browser) {
      console.log(`[Reviews Scraper] Closing scraper connection...`);
      await browser.close();
    }
  }
}

/**
 * Generates realistic reviews based on the product name.
 */
function getMockReviews(productUrl: string, productName: string): ReviewsResponse {
  const cleanProd = productName.replace(/"/g, '');
  
  const reviews: ProductReview[] = [
    {
      title: 'Excelente calidad',
      rating: 5,
      comment: `Muy contento con mi ${cleanProd}. Funciona exactamente como se describe, tiene buen rendimiento y los materiales se sienten premium. Vale cada peso.`,
      date: '12 de mayo, 2026'
    },
    {
      title: 'Cumple pero el empaque llegó dañado',
      rating: 3,
      comment: `El ${cleanProd} es bueno y funciona bien, pero la caja de Mercado Libre llegó aplastada y el transportista tardó más de lo acordado en entregar.`,
      date: '05 de mayo, 2026'
    },
    {
      title: 'Buen producto, recomendado',
      rating: 4,
      comment: `Buenísima relación calidad-precio. Es la segunda vez que compro esta marca y no defrauda. Lo uso a diario sin problemas.`,
      date: '28 de abril, 2026'
    },
    {
      title: 'Falta un mejor instructivo de uso',
      rating: 4,
      comment: `El aparato está excelente, pero las instrucciones en español son muy confusas. Tuve que buscar tutoriales en internet para configurarlo bien.`,
      date: '15 de abril, 2026'
    },
    {
      title: 'Se siente algo frágil',
      rating: 3,
      comment: `Funciona bien, pero las uniones de plástico se ven algo delicadas. Espero que dure. Por el precio está aceptable, pero podría ser mejor.`,
      date: '02 de abril, 2026'
    }
  ];

  return {
    success: true,
    productUrl,
    averageRating: 4.2,
    reviews,
    sentimentBreakdown: {
      positive: 60,
      neutral: 40,
      negative: 0
    },
    isMockData: true
  };
}
