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

  // تایید دریافت فایل CSV دستی از FXStreet
  async confirmManualCSVUpload(fileName: string, recordCount: number): Promise<void> {
    try {
      await storage.createLog({
        level: 'info',
        message: `✅ فایل CSV دستی دریافت شد: ${fileName} با ${recordCount} رکورد`,
        source: 'csv-upload',
        metadata: { fileName, recordCount, uploadTime: new Date().toISOString() }
      });

      console.log(`✅ تایید دریافت فایل CSV: ${fileName} (${recordCount} رویداد)`);
      
      // اطلاع به ادمین
      const telegramModule = await import('../services/telegram');
      await telegramModule.telegramService.sendToAdmin(
        `📊 <b>تایید دریافت فایل CSV</b>\n\n` +
        `📁 نام فایل: ${fileName}\n` +
        `📈 تعداد رکورد: ${recordCount}\n` +
        `⏰ زمان: ${new Date().toLocaleString('fa-IR')}\n\n` +
        `✅ فایل با موفقیت پردازش شد`
      );
    } catch (error) {
      console.error('خطا در تایید فایل CSV:', error);
    }
  }

  async scrapeForexFactory(): Promise<NewsItem[]> {
    try {
      console.log('🔍 Scraping ForexFactory for gold-related news...');
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('https://www.forexfactory.com/calendar', {
        headers: this.baseHeaders,
        timeout: 15000
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
      return news.slice(0, 15); // افزایش محدودیت

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
      return news.slice(0, 15); // افزایش محدودیت

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
    
    // فیلتر بهبود یافته برای اخبار مهم
    const importantNews = allNews.filter(news => {
      const score = news.relevanceScore || 0;
      // کاهش threshold برای شناسایی اخبار بیشتر
      return score >= 55 || news.impact === 'HIGH';
    });

    console.log(`📰 Important gold news: ${importantNews.length} items`);
    return importantNews.slice(0, 8); // افزایش تعداد اخبار
  }

  private isGoldRelevant(title: string, currency: string = ''): boolean {
    const text = (title + ' ' + currency).toLowerCase();
    
    // کلمات کلیدی گسترده‌تر برای شناسایی اخبار مرتبط با طلا
    const directGoldKeywords = [
      'gold', 'xau', 'precious metals', 'bullion', 'golden'
    ];
    
    const economicKeywords = [
      'federal reserve', 'fed', 'fomc', 'jerome powell', 'central bank',
      'interest rate', 'rates', 'rate cut', 'rate hike',
      'inflation', 'cpi', 'ppi', 'pce', 'core inflation',
      'employment', 'nonfarm', 'payrolls', 'unemployment', 'jobs',
      'gdp', 'economic growth', 'recession', 'recovery',
      'monetary policy', 'fiscal policy', 'stimulus',
      'dollar', 'usd', 'dxy', 'greenback', 'currency',
      'treasury', 'yield', 'bond', '10-year', 'yields',
      'geopolitics', 'war', 'conflict', 'tensions',
      'china', 'trade war', 'tariffs', 'sanctions',
      'oil', 'crude', 'energy', 'commodities',
      'stock market', 'equity', 'risk-on', 'risk-off',
      'safe haven', 'hedge', 'volatility', 'uncertainty'
    ];
    
    const majorEconomies = [
      'united states', 'usa', 'us ', 'america',
      'european union', 'eu ', 'europe', 'eurozone',
      'china', 'chinese', 'japan', 'japanese',
      'united kingdom', 'uk ', 'britain', 'british'
    ];
    
    // بررسی مستقیم طلا
    if (directGoldKeywords.some(keyword => text.includes(keyword))) {
      return true;
    }
    
    // بررسی شاخص‌های اقتصادی مهم
    const economicMatch = economicKeywords.some(keyword => text.includes(keyword));
    const majorEconomyMatch = majorEconomies.some(keyword => text.includes(keyword));
    
    // بررسی ارزهای مهم
    const importantCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CNY'];
    const currencyMatch = importantCurrencies.includes(currency) || 
                         importantCurrencies.some(curr => text.includes(curr.toLowerCase()));
    
    // ترکیب شرایط برای شناسایی بهتر
    return economicMatch || (majorEconomyMatch && currencyMatch);
  }

  private calculateRelevanceScore(title: string, currency: string = ''): number {
    const text = (title + ' ' + currency).toLowerCase();
    let score = 40; // Base score کاهش یافت

    // امتیاز بالا برای کلمات مستقیم طلا
    if (text.includes('gold') || text.includes('xau') || text.includes('bullion')) score += 35;
    if (text.includes('precious metals')) score += 30;
    
    // امتیاز بالا برای Fed و سیاست پولی
    if (text.includes('federal reserve') || text.includes('fed') || text.includes('fomc')) score += 28;
    if (text.includes('jerome powell') || text.includes('powell')) score += 25;
    if (text.includes('interest rate') || text.includes('rates')) score += 25;
    if (text.includes('monetary policy')) score += 22;
    
    // شاخص‌های تورم
    if (text.includes('inflation') || text.includes('cpi') || text.includes('ppi')) score += 20;
    if (text.includes('pce') || text.includes('core inflation')) score += 18;
    
    // داده‌های اشتغال
    if (text.includes('employment') || text.includes('payrolls') || text.includes('nonfarm')) score += 18;
    if (text.includes('unemployment') || text.includes('jobs')) score += 15;
    
    // شاخص‌های اقتصادی
    if (text.includes('gdp') || text.includes('economic growth')) score += 15;
    if (text.includes('recession') || text.includes('recovery')) score += 18;
    
    // دلار و ارز
    if (text.includes('dollar') || text.includes('usd') || text.includes('dxy')) score += 16;
    if (text.includes('currency') || text.includes('greenback')) score += 12;
    
    // اوراق قرضه و yield
    if (text.includes('treasury') || text.includes('yield') || text.includes('bond')) score += 14;
    if (text.includes('10-year') || text.includes('yields')) score += 12;
    
    // ژئوپلیتیک و safe haven
    if (text.includes('geopolitics') || text.includes('war') || text.includes('conflict')) score += 15;
    if (text.includes('safe haven') || text.includes('hedge')) score += 20;
    if (text.includes('uncertainty') || text.includes('volatility')) score += 12;
    
    // کشورهای مهم
    if (text.includes('china') || text.includes('trade war')) score += 12;
    if (text.includes('oil') || text.includes('crude') || text.includes('energy')) score += 10;
    
    // امتیاز ارز
    if (currency === 'USD') score += 12;
    if (['EUR', 'GBP', 'JPY', 'CHF', 'CNY'].includes(currency)) score += 8;
    if (['CAD', 'AUD', 'NZD'].includes(currency)) score += 5;
    
    // بونوس برای ترکیب کلمات
    const combinationBonus = this.getCombinationBonus(text);
    score += combinationBonus;

    return Math.min(score, 100);
  }
  
  private getCombinationBonus(text: string): number {
    let bonus = 0;
    
    // ترکیبات قدرتمند
    if ((text.includes('fed') || text.includes('federal reserve')) && 
        (text.includes('rate') || text.includes('policy'))) bonus += 10;
        
    if (text.includes('inflation') && text.includes('gold')) bonus += 15;
    if (text.includes('dollar') && (text.includes('strength') || text.includes('weak'))) bonus += 8;
    if (text.includes('yield') && text.includes('rise')) bonus += 6;
    if (text.includes('employment') && text.includes('strong')) bonus += 5;
    
    return bonus;
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