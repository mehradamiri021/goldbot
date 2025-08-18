"""
News Service for Weekly Gold Market News
سرویس اخبار برای اخبار هفتگی بازار طلا
"""

import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import re
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class NewsService:
    """Service for fetching and processing gold market news"""
    
    def __init__(self):
        self.news_sources = {
            'forex_factory': 'https://www.forexfactory.com/calendar',
            'investing_gold': 'https://www.investing.com/commodities/gold-news',
            'marketwatch_gold': 'https://www.marketwatch.com/investing/future/gc00',
            'fxstreet_gold': 'https://www.fxstreet.com/commodities/gold'
        }
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }

    def fetch_news_from_source(self, source_name: str, url: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetch news from a specific source"""
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            news_items = []
            
            # Different parsing logic for each source
            if source_name == 'forex_factory':
                news_items = self._parse_forex_factory(soup, limit)
            elif source_name == 'investing_gold':
                news_items = self._parse_investing_com(soup, limit)
            elif source_name == 'marketwatch_gold':
                news_items = self._parse_marketwatch(soup, limit)
            elif source_name == 'fxstreet_gold':
                news_items = self._parse_fxstreet(soup, limit)
            
            return news_items
            
        except Exception as e:
            logger.error(f"Error fetching news from {source_name}: {e}")
            return []

    def _parse_forex_factory(self, soup: BeautifulSoup, limit: int) -> List[Dict[str, Any]]:
        """Parse Forex Factory news"""
        news_items = []
        try:
            # Look for news items related to gold, USD, inflation, etc.
            news_elements = soup.find_all(['div', 'tr'], class_=re.compile(r'calendar|news|event'))
            
            for element in news_elements[:limit]:
                title_elem = element.find(['span', 'a', 'td'], string=re.compile(r'gold|Gold|USD|inflation|Fed|FOMC', re.I))
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    
                    # Determine impact level
                    impact = 'medium'
                    if element.find(class_=re.compile(r'high|red', re.I)):
                        impact = 'high'
                    elif element.find(class_=re.compile(r'low|green', re.I)):
                        impact = 'low'
                    
                    news_items.append({
                        'title': title,
                        'summary': f"Economic event that may impact gold prices: {title[:100]}",
                        'impact': impact,
                        'source': 'Forex Factory',
                        'timestamp': datetime.now()
                    })
                    
        except Exception as e:
            logger.error(f"Error parsing Forex Factory: {e}")
            
        return news_items

    def _parse_investing_com(self, soup: BeautifulSoup, limit: int) -> List[Dict[str, Any]]:
        """Parse Investing.com gold news"""
        news_items = []
        try:
            # Look for news articles
            articles = soup.find_all(['article', 'div'], class_=re.compile(r'article|news|story'))
            
            for article in articles[:limit]:
                title_elem = article.find(['h1', 'h2', 'h3', 'a'])
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    
                    # Get summary if available
                    summary_elem = article.find(['p', 'div'], class_=re.compile(r'summary|excerpt|description'))
                    summary = summary_elem.get_text(strip=True)[:200] if summary_elem else title[:100]
                    
                    news_items.append({
                        'title': title,
                        'summary': summary,
                        'impact': 'medium',
                        'source': 'Investing.com',
                        'timestamp': datetime.now()
                    })
                    
        except Exception as e:
            logger.error(f"Error parsing Investing.com: {e}")
            
        return news_items

    def _parse_marketwatch(self, soup: BeautifulSoup, limit: int) -> List[Dict[str, Any]]:
        """Parse MarketWatch gold news"""
        news_items = []
        try:
            # Look for news related to gold futures
            news_elements = soup.find_all(['div', 'article'], class_=re.compile(r'news|article|story'))
            
            for element in news_elements[:limit]:
                title_elem = element.find(['h1', 'h2', 'h3', 'a'])
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    
                    # Check if it's gold-related
                    if any(keyword in title.lower() for keyword in ['gold', 'precious', 'metal', 'commodity']):
                        news_items.append({
                            'title': title,
                            'summary': f"MarketWatch gold market update: {title[:100]}",
                            'impact': 'medium',
                            'source': 'MarketWatch',
                            'timestamp': datetime.now()
                        })
                        
        except Exception as e:
            logger.error(f"Error parsing MarketWatch: {e}")
            
        return news_items

    def _parse_fxstreet(self, soup: BeautifulSoup, limit: int) -> List[Dict[str, Any]]:
        """Parse FXStreet gold news"""
        news_items = []
        try:
            # Look for gold analysis and news
            articles = soup.find_all(['article', 'div'], class_=re.compile(r'article|news|analysis'))
            
            for article in articles[:limit]:
                title_elem = article.find(['h1', 'h2', 'h3', 'a'])
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    
                    # Check if it's gold-related
                    if any(keyword in title.lower() for keyword in ['gold', 'xau', 'precious']):
                        news_items.append({
                            'title': title,
                            'summary': f"FXStreet gold analysis: {title[:100]}",
                            'impact': 'medium',
                            'source': 'FXStreet',
                            'timestamp': datetime.now()
                        })
                        
        except Exception as e:
            logger.error(f"Error parsing FXStreet: {e}")
            
        return news_items

    def get_weekly_news_summary(self, limit_per_source: int = 3) -> List[Dict[str, Any]]:
        """Get weekly news summary from all sources"""
        try:
            logger.info("📰 Fetching weekly gold news summary")
            
            all_news = []
            
            # Fetch from each source
            for source_name, url in self.news_sources.items():
                try:
                    news_items = self.fetch_news_from_source(source_name, url, limit_per_source)
                    all_news.extend(news_items)
                    
                    if news_items:
                        logger.info(f"✅ Fetched {len(news_items)} news items from {source_name}")
                    else:
                        logger.warning(f"⚠️ No news items found from {source_name}")
                        
                except Exception as e:
                    logger.error(f"❌ Error fetching from {source_name}: {e}")
                    continue
            
            # Sort by impact and recency
            impact_priority = {'high': 3, 'medium': 2, 'low': 1}
            all_news.sort(key=lambda x: (impact_priority.get(x.get('impact', 'medium'), 2), x.get('timestamp', datetime.min)), reverse=True)
            
            # Return top news items
            top_news = all_news[:10]  # Top 10 news items
            
            logger.info(f"📊 Compiled {len(top_news)} top news items for weekly report")
            return top_news
            
        except Exception as e:
            logger.error(f"❌ Error getting weekly news summary: {e}")
            
            # Return fallback news items if web scraping fails
            return self._get_fallback_news()

    def _get_fallback_news(self) -> List[Dict[str, Any]]:
        """Provide fallback news items when web scraping fails"""
        fallback_news = [
            {
                'title': 'بررسی روند هفتگی قیمت طلا در بازارهای جهانی',
                'summary': 'تحلیل تکنیکال و بنیادی قیمت طلا بر اساس عوامل اقتصادی هفته',
                'impact': 'medium',
                'source': 'تحلیل تکنیکال',
                'timestamp': datetime.now()
            },
            {
                'title': 'نرخ تورم و تأثیر آن بر قیمت فلزات گرانبها',
                'summary': 'بررسی ارتباط نرخ تورم آمریکا با قیمت طلا و نقره',
                'impact': 'high',
                'source': 'تحلیل اقتصادی',
                'timestamp': datetime.now()
            },
            {
                'title': 'تصمیمات بانک مرکزی آمریکا و تأثیر بر بازار طلا',
                'summary': 'بررسی سیاست‌های پولی فدرال رزرو و پیامدهای آن برای طلا',
                'impact': 'high',
                'source': 'تحلیل بانک مرکزی',
                'timestamp': datetime.now()
            },
            {
                'title': 'تنش‌های ژئوپلیتیک و افزایش تقاضا برای پناهگاه امن',
                'summary': 'تأثیر عدم اطمینان سیاسی جهانی بر تقاضای طلا به عنوان پناهگاه امن',
                'impact': 'medium',
                'source': 'تحلیل ژئوپلیتیک',
                'timestamp': datetime.now()
            }
        ]
        
        logger.info("📋 Using fallback news items for weekly report")
        return fallback_news

# Global instance
news_service = NewsService()

def get_weekly_news_summary() -> List[Dict[str, Any]]:
    """Get weekly news summary - global function"""
    return news_service.get_weekly_news_summary()

def get_daily_news() -> List[Dict[str, Any]]:
    """Get daily news - compatibility function"""
    return news_service.get_weekly_news_summary()

def get_news_summary() -> List[Dict[str, Any]]:
    """Get news summary - compatibility function"""
    return news_service.get_weekly_news_summary()[:3]