import { load } from 'cheerio';

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source: string;
  url?: string;
  publishedAt: Date;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  relevanceScore?: number;
}

export class NewsService {
  private baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  constructor() {
    console.log('📰 NewsService initialized');
  }

  async scrapeForexFactory(): Promise<NewsItem[]> {
    try {
      console.log('🔍 Scraping ForexFactory for gold-related news...');
      
      const response = await fetch('https://www.forexfactory.com/news', {
        headers: this.baseHeaders,
      });

      if (!response.ok) {
        throw new Error(`ForexFactory request failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);
      const news: NewsItem[] = [];

      // Extract news items from ForexFactory
      $('.calendar__row').each((index, element) => {
        try {
          const titleElement = $(element).find('.calendar__event');
          const impactElement = $(element).find('.calendar__impact');
          const currencyElement = $(element).find('.calendar__currency');
          
          const title = titleElement.text().trim();
          const currency = currencyElement.text().trim();
          const impactSpan = impactElement.find('.calendar__impact-icon').length;
          
          if (title && this.isGoldRelevant(title, currency)) {
            const impact = this.mapImpact(impactSpan);
            
            news.push({
              id: `ff_${Date.now()}_${index}`,
              title: `${currency} ${title}`,
              description: `ForexFactory economic event - Impact: ${impact}`,
              content: title,
              source: 'ForexFactory',
              publishedAt: new Date(),
              impact,
              tags: ['economic', 'forexfactory', 'gold'],
              relevanceScore: this.calculateRelevanceScore(title, currency)
            });
          }
        } catch (itemError) {
          console.error('Error processing ForexFactory item:', itemError);
        }
      });

      console.log(`✅ ForexFactory: Found ${news.length} gold-relevant news items`);
      return news.slice(0, 10); // Limit to 10 items

    } catch (error) {
      console.error('❌ ForexFactory scraping failed:', error);
      return [];
    }
  }

  async scrapeFXStreet(): Promise<NewsItem[]> {
    try {
      console.log('🔍 Scraping FXStreet for gold analysis...');
      
      const response = await fetch('https://www.fxstreet.com/news', {
        headers: this.baseHeaders,
      });

      if (!response.ok) {
        throw new Error(`FXStreet request failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);
      const news: NewsItem[] = [];

      // Extract articles from FXStreet
      $('.fxs_article_title_link, .fxs_headline_primary_link').each((index, element) => {
        try {
          const title = $(element).text().trim();
          const url = $(element).attr('href');
          
          if (title && this.isGoldRelevant(title, '')) {
            news.push({
              id: `fxs_${Date.now()}_${index}`,
              title: title,
              description: `FXStreet market analysis`,
              content: title,
              source: 'FXStreet',
              url: url?.startsWith('http') ? url : `https://www.fxstreet.com${url}`,
              publishedAt: new Date(),
              impact: 'MEDIUM',
              tags: ['analysis', 'fxstreet', 'gold'],
              relevanceScore: this.calculateRelevanceScore(title, '')
            });
          }
        } catch (itemError) {
          console.error('Error processing FXStreet item:', itemError);
        }
      });

      console.log(`✅ FXStreet: Found ${news.length} gold-relevant news items`);
      return news.slice(0, 10); // Limit to 10 items

    } catch (error) {
      console.error('❌ FXStreet scraping failed:', error);
      return [];
    }
  }

  async getAllNews(): Promise<NewsItem[]> {
    try {
      console.log('📰 Fetching news from all sources...');
      
      const [forexFactoryNews, fxStreetNews] = await Promise.all([
        this.scrapeForexFactory(),
        this.scrapeFXStreet()
      ]);

      const allNews = [...forexFactoryNews, ...fxStreetNews];
      
      // Sort by relevance score and date
      allNews.sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });

      console.log(`📰 Total news collected: ${allNews.length} items`);
      return allNews;

    } catch (error) {
      console.error('❌ Failed to fetch all news:', error);
      return [];
    }
  }

  async getImportantGoldNews(): Promise<NewsItem[]> {
    const allNews = await this.getAllNews();
    
    // Filter for high relevance and recent news
    const importantNews = allNews.filter(news => 
      (news.relevanceScore || 0) >= 70 && 
      news.impact !== 'LOW'
    );

    console.log(`📰 Important gold news: ${importantNews.length} items`);
    return importantNews.slice(0, 5);
  }

  private isGoldRelevant(title: string, currency: string = ''): boolean {
    const text = (title + ' ' + currency).toLowerCase();
    
    const goldKeywords = [
      'gold', 'xau', 'precious metals',
      'federal reserve', 'fed', 'interest rate',
      'inflation', 'cpi', 'ppi',
      'employment', 'nonfarm', 'payrolls',
      'gdp', 'monetary policy',
      'dollar', 'usd', 'dxy',
      'treasury', 'yield', 'bond'
    ];

    return goldKeywords.some(keyword => text.includes(keyword));
  }

  private calculateRelevanceScore(title: string, currency: string = ''): number {
    const text = (title + ' ' + currency).toLowerCase();
    let score = 50; // Base score

    // High relevance keywords
    if (text.includes('gold') || text.includes('xau')) score += 30;
    if (text.includes('federal reserve') || text.includes('fed')) score += 25;
    if (text.includes('inflation') || text.includes('cpi')) score += 20;
    if (text.includes('interest rate')) score += 20;
    if (text.includes('employment') || text.includes('payrolls')) score += 15;
    if (text.includes('dollar') || text.includes('usd')) score += 15;
    if (text.includes('monetary policy')) score += 15;
    
    // Currency relevance
    if (currency === 'USD') score += 10;
    if (['EUR', 'GBP', 'JPY', 'CHF'].includes(currency)) score += 5;

    return Math.min(score, 100);
  }

  private mapImpact(impactSpans: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (impactSpans >= 3) return 'HIGH';
    if (impactSpans === 2) return 'MEDIUM';
    return 'LOW';
  }

  // Fallback method for when scraping fails
  async getFallbackNews(): Promise<NewsItem[]> {
    console.log('📰 Using fallback news data...');
    
    return [
      {
        id: 'fallback_1',
        title: 'US Federal Reserve Interest Rate Decision Pending',
        description: 'Market awaits Fed decision on interest rates, potential impact on gold prices',
        content: 'The Federal Reserve is expected to announce its interest rate decision, which could significantly impact gold markets.',
        source: 'Market Analysis',
        publishedAt: new Date(),
        impact: 'HIGH',
        tags: ['fed', 'interest-rate', 'gold'],
        relevanceScore: 95
      },
      {
        id: 'fallback_2',
        title: 'US Dollar Strengthens Ahead of Economic Data',
        description: 'Dollar gains could pressure gold prices in short term',
        content: 'The US Dollar has strengthened against major currencies, potentially creating headwinds for gold.',
        source: 'Market Analysis',
        publishedAt: new Date(),
        impact: 'MEDIUM',
        tags: ['usd', 'dollar', 'gold'],
        relevanceScore: 80
      },
      {
        id: 'fallback_3',
        title: 'Inflation Data Shows Mixed Signals',
        description: 'Latest CPI data provides mixed signals for monetary policy',
        content: 'Consumer Price Index data shows mixed signals, creating uncertainty for gold direction.',
        source: 'Market Analysis',
        publishedAt: new Date(),
        impact: 'MEDIUM',
        tags: ['inflation', 'cpi', 'gold'],
        relevanceScore: 75
      }
    ];
  }
}