export interface SerpResult {
  title: string;
  link: string;
  rank: number;
  snippet?: string;
  displayLink?: string;
}

export interface SerpResponse {
  success: boolean;
  query: string;
  results: SerpResult[];
  userProductRank: number | null; // Rank of user's product link if found
  competitorsRanked: { seller: string; rank: number; link: string }[];
  isMockData: boolean;
}

/**
 * Searches Google using Bright Data's SERP API.
 * If credentials are missing, falls back to a realistic mock generator.
 */
export async function searchGoogleVisibility(productName: string, companyName: string): Promise<SerpResponse> {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const zone = process.env.BRIGHT_DATA_SERP_ZONE;

  console.log(`[SERP API] Initiating Google search visibility check for "${productName}"...`);

  // Fallback to mock data if credentials are not configured
  if (!apiKey || !zone) {
    console.log(`[SERP API] Bright Data API credentials missing. Falling back to high-fidelity mock data.`);
    return getMockSerpData(productName, companyName);
  }

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(productName + ' mercado libre')}&gl=mx&hl=es`;
    
    console.log(`[SERP API] Requesting SERP data from Bright Data... Zone: ${zone}`);
    
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        zone: zone,
        url: searchUrl,
        format: 'json'
      })
    });

    if (!response.ok) {
      throw new Error(`SERP API request failed with status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`[SERP API] Data successfully fetched and parsed.`);

    // Extract organic results from Bright Data's parsed JSON response
    // Bright Data SERP API response typically has organic results in data.organic
    const organic = data.organic || [];
    const results: SerpResult[] = organic.map((item: any, idx: number) => ({
      title: item.title || 'Unknown Title',
      link: item.link || '',
      rank: item.rank || (idx + 1),
      snippet: item.description || item.snippet || '',
      displayLink: item.display_link || new URL(item.link || 'https://google.com').hostname
    }));

    // Detect user's rank and competitors based on the companyName
    let userProductRank: number | null = null;
    const competitorsRanked: { seller: string; rank: number; link: string }[] = [];

    results.forEach((res) => {
      const lowerTitle = res.title.toLowerCase();
      const lowerSnippet = res.snippet ? res.snippet.toLowerCase() : '';
      const lowerCompany = companyName.toLowerCase();

      // Check if it's the user's specific listing
      if (lowerTitle.includes(lowerCompany) || lowerSnippet.includes(lowerCompany)) {
        if (userProductRank === null) {
          userProductRank = res.rank;
        }
      } else if (res.link.includes('mercadolibre.com.mx/MLM-') || res.link.includes('articulo.mercadolibre.com.mx')) {
        // Try to guess competitor names from title/link
        let possibleSeller = 'Mercado Libre Seller';
        if (lowerTitle.includes('oficial') || lowerTitle.includes('tienda')) {
          const match = res.title.match(/tienda oficial\s+([^|-]+)/i) || res.title.match(/([^|-]+)\s+tienda oficial/i);
          if (match && match[1]) {
            possibleSeller = match[1].trim();
          }
        }
        competitorsRanked.push({
          seller: possibleSeller,
          rank: res.rank,
          link: res.link
        });
      }
    });

    return {
      success: true,
      query: productName,
      results,
      userProductRank,
      competitorsRanked,
      isMockData: false
    };

  } catch (error: any) {
    console.error(`[SERP API] Request error:`, error);
    console.log(`[SERP API] Triggering mock fallback to guarantee app resilience.`);
    return getMockSerpData(productName, companyName);
  }
}

/**
 * Returns realistic mock search engine results matching the query.
 */
function getMockSerpData(productName: string, companyName: string): SerpResponse {
  // Clean product name
  const cleanProd = productName.replace(/"/g, '');
  
  const results: SerpResult[] = [
    {
      title: `${cleanProd} | MercadoLibre 🇲🇽`,
      link: `https://listado.mercadolibre.com.mx/${cleanProd.replace(/\s+/g, '-')}`,
      rank: 1,
      snippet: `Compra ${cleanProd} a meses sin intereses. Encuentra la mayor variedad de productos con envíos rápidos a todo México. ¡Elige lo mejor!`,
      displayLink: 'listado.mercadolibre.com.mx'
    },
    {
      title: `${cleanProd} Original Envío Full - ML Oficial`,
      link: 'https://articulo.mercadolibre.com.mx/MLM-991823192-competidor-top-lider',
      rank: 2,
      snippet: `Adquiere tu ${cleanProd} con la garantía de siempre. Distribuidor oficial autorizado. Envío gratuito en 24 horas y meses sin intereses.`,
      displayLink: 'articulo.mercadolibre.com.mx'
    },
    {
      title: `${cleanProd} Premium en Venta - Tienda Oficial ${companyName}`,
      link: 'https://articulo.mercadolibre.com.mx/MLM-123456789-user-shop-active',
      rank: 3,
      snippet: `Consigue el mejor ${cleanProd} en nuestra tienda oficial. ${companyName} te ofrece el precio más competitivo, envío inmediato y garantía de 30 días.`,
      displayLink: 'articulo.mercadolibre.com.mx'
    },
    {
      title: `Los Mejores 10 Modelos de ${cleanProd} del 2026 - Guía de Compra`,
      link: 'https://www.xataka.com.mx/guias-de-compra/los-mejores-modelos-de-analisis',
      rank: 4,
      snippet: `Buscando un ${cleanProd}? Analizamos las alternativas disponibles en el mercado mexicano, comparando precios, opiniones de usuarios y velocidades de entrega.`,
      displayLink: 'xataka.com.mx'
    },
    {
      title: `${cleanProd} Oferta Especial - Distribuidora Express`,
      link: 'https://articulo.mercadolibre.com.mx/MLM-882736125-competidor-barato',
      rank: 5,
      snippet: `Oferta del día en ${cleanProd}. Precios de bodega. Envíos a todo el país. Garantía por defectos de fábrica. ¡Aprovecha la promoción de hoy!`,
      displayLink: 'articulo.mercadolibre.com.mx'
    }
  ];

  return {
    success: true,
    query: productName,
    results,
    userProductRank: 3, // Mocked at position 3
    competitorsRanked: [
      { seller: 'ML Oficial', rank: 2, link: 'https://articulo.mercadolibre.com.mx/MLM-991823192-competidor-top-lider' },
      { seller: 'Distribuidora Express', rank: 5, link: 'https://articulo.mercadolibre.com.mx/MLM-882736125-competidor-barato' }
    ],
    isMockData: true
  };
}
